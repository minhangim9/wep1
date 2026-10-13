import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, parseSupabaseError } from '@/lib/supabase';
import { confirmTossPayment } from '@/lib/tossPayments';

interface ConfirmBody {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: ConfirmBody = await req.json();
    const { paymentKey, orderId, amount } = body;

    // 1. 필수 파라미터 검증
    if (!paymentKey || !orderId || amount === undefined) {
      return NextResponse.json(
        { success: false, error: 'paymentKey, orderId, amount는 필수 전달값입니다.' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 2. DB에서 주문 조회 (orderId 또는 order_number로 검색)
    const { data: dbOrder, error: orderError } = await client
      .from('orders')
      .select('*')
      .or(`id.eq.${orderId},order_number.eq.${orderId}`)
      .maybeSingle();

    if (orderError) {
      console.error('[confirm] Order query error:', orderError);
      return NextResponse.json(
        { success: false, error: '주문 정보 조회 중 데이터베이스 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    if (!dbOrder) {
      return NextResponse.json(
        { success: false, error: `주문(${orderId})을 찾을 수 없습니다.` },
        { status: 404 }
      );
    }

    // 3. 멱등성 검증: 이미 결제 완료된 경우 중복 승인 방지
    if (dbOrder.status === 'paid' && dbOrder.payment_key === paymentKey) {
      return NextResponse.json({
        success: true,
        message: '이미 정상 승인 완료된 주문입니다.',
        orderId: dbOrder.id,
        orderNumber: dbOrder.order_number,
        order: dbOrder,
      });
    }

    // 4. [보안 핵심] 결제 금액 위변조 검증 (1원 단위 일치 여부)
    const expectedAmount = Number(dbOrder.final_payment_amount);
    const receivedAmount = Number(amount);

    if (expectedAmount !== receivedAmount) {
      console.error(
        `[SECURITY WARNING] 금액 위변조 시도 감지! DB 예정 금액: ${expectedAmount}원 vs 결제 요청 금액: ${receivedAmount}원 (주문번호: ${dbOrder.order_number})`
      );

      // 의심 거래로 주문 상태 취소 처리
      await client
        .from('orders')
        .update({
          status: 'cancelled',
          cancel_reason: `[보안 차단] 결제 승인 요청 금액 불일치 (DB: ${expectedAmount}원, 요청: ${receivedAmount}원)`,
        })
        .eq('id', dbOrder.id);

      return NextResponse.json(
        {
          success: false,
          error: '결제 요청 금액이 주문서에 등록된 금액과 일치하지 않아 거래가 차단되었습니다.',
        },
        { status: 400 }
      );
    }

    // 5. 토스페이먼츠 공식 서버 승인 API 호출 (Basic Auth + Idempotency-Key)
    const tossResult = await confirmTossPayment({
      paymentKey,
      orderId,
      amount: receivedAmount,
    });

    if (!tossResult.success || !tossResult.data) {
      console.error('[confirm] Toss API confirm failed:', tossResult.error);

      // 실패 상태 업데이트
      await client
        .from('orders')
        .update({
          cancel_reason: `결제 승인 실패: [${tossResult.error?.code}] ${tossResult.error?.message}`,
        })
        .eq('id', dbOrder.id);

      return NextResponse.json(
        {
          success: false,
          code: tossResult.error?.code || 'PAYMENT_FAILED',
          error: tossResult.error?.message || '토스페이먼츠 결제 승인에 실패했습니다.',
        },
        { status: 400 }
      );
    }

    const tossData = tossResult.data;

    // 6. 결제 수단 및 상세 정보 가공
    const paymentDetails: Record<string, any> = {
      ...(dbOrder.payment_details || {}),
      paymentKey: tossData.paymentKey,
      method: tossData.method,
      approvedAt: tossData.approvedAt || new Date().toISOString(),
      requestedAt: tossData.requestedAt,
      receiptUrl: tossData.receipt?.url,
    };

    if (tossData.card) {
      paymentDetails.cardName = tossData.card.company || '신용카드';
      paymentDetails.cardNumber = tossData.card.number;
      paymentDetails.approveNo = tossData.card.approveNo;
      paymentDetails.installmentMonths = tossData.card.installmentPlanMonths;
    }

    if (tossData.easyPay) {
      paymentDetails.easyPayProvider = tossData.easyPay.provider;
    }

    if (tossData.virtualAccount) {
      paymentDetails.vbankName = tossData.virtualAccount.bankCode;
      paymentDetails.vbankAccount = tossData.virtualAccount.accountNumber;
      paymentDetails.vbankDueDate = tossData.virtualAccount.dueDate;
    }

    // 가상계좌(입금대기)의 경우 상태를 'pending_payment'로 유지, 그 외 결제는 'paid'
    const newStatus =
      tossData.status === 'WAITING_FOR_DEPOSIT' ? 'pending_payment' : 'paid';

    // 7. Supabase orders 테이블 업데이트
    const { data: updatedOrder, error: updateError } = await client
      .from('orders')
      .update({
        status: newStatus,
        payment_key: tossData.paymentKey,
        payment_details: paymentDetails,
      })
      .eq('id', dbOrder.id)
      .select()
      .single();

    if (updateError) {
      console.error('[confirm] Order update DB error:', updateError);
    }

    // 8. 재고 차감 처리 (결제 완료 시)
    if (newStatus === 'paid' && dbOrder.items) {
      try {
        const items = typeof dbOrder.items === 'string' ? JSON.parse(dbOrder.items) : dbOrder.items;
        for (const item of items) {
          if (item.productId && item.quantity) {
            // DB에서 현재 재고 조회 후 차감
            const { data: prod } = await client
              .from('products')
              .select('id, stock_quantity')
              .eq('id', item.productId)
              .maybeSingle();

            if (prod && prod.stock_quantity !== undefined) {
              const newStock = Math.max(0, prod.stock_quantity - item.quantity);
              await client
                .from('products')
                .update({ stock_quantity: newStock })
                .eq('id', item.productId);
            }
          }
        }
      } catch (stockErr) {
        console.warn('[confirm] Stock update warning:', stockErr);
      }
    }

    // 9. 최종 성공 응답 반환
    return NextResponse.json({
      success: true,
      message: '결제가 성공적으로 승인 완료되었습니다.',
      orderId: dbOrder.id,
      orderNumber: dbOrder.order_number,
      finalPaymentAmount: receivedAmount,
      approvedAt: tossData.approvedAt,
      receiptUrl: tossData.receipt?.url,
      cardName: paymentDetails.cardName,
      easyPayProvider: paymentDetails.easyPayProvider,
      order: updatedOrder || dbOrder,
    });
  } catch (err: any) {
    console.error('[confirm] Exception:', err);
    return NextResponse.json(
      { success: false, error: err.message || '결제 승인 처리 중 서버 예외가 발생했습니다.' },
      { status: 500 }
    );
  }
}
