import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, parseSupabaseError } from '@/lib/supabase';
import { cancelTossPayment } from '@/lib/tossPayments';

interface CancelBody {
  orderId: string;
  cancelReason: string;
  cancelAmount?: number;
  requesterRole?: 'admin' | 'customer';
}

export async function POST(req: NextRequest) {
  try {
    const body: CancelBody = await req.json();
    const { orderId, cancelReason, cancelAmount } = body;

    if (!orderId || !cancelReason?.trim()) {
      return NextResponse.json(
        { success: false, error: 'orderId와 cancelReason은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 1. 주문 조회
    const { data: dbOrder, error: orderError } = await client
      .from('orders')
      .select('*')
      .or(`id.eq.${orderId},order_number.eq.${orderId}`)
      .maybeSingle();

    if (orderError || !dbOrder) {
      return NextResponse.json(
        { success: false, error: `주문(${orderId})을 찾을 수 없습니다.` },
        { status: 404 }
      );
    }

    // 2. 이미 취소/환불된 주문인지 확인
    if (dbOrder.status === 'cancelled' || dbOrder.status === 'refunded') {
      return NextResponse.json(
        { success: false, error: '이미 취소 또는 환불 처리 완료된 주문입니다.' },
        { status: 400 }
      );
    }

    // 3. 배송이 이미 완료된 경우 일반 취소 제한
    if (dbOrder.status === 'delivered' && body.requesterRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: '배송 완료된 주문은 반품 신청을 통해 진행해주세요.' },
        { status: 400 }
      );
    }

    const paymentKey = dbOrder.payment_key || dbOrder.payment_details?.paymentKey;

    let tossCancelData = null;

    // 4. 실제 PG paymentKey가 있는 경우 토스페이먼츠 공식 취소 API 호출
    if (paymentKey) {
      const tossRes = await cancelTossPayment({
        paymentKey,
        cancelReason: cancelReason.trim(),
        cancelAmount: cancelAmount || dbOrder.final_payment_amount,
      });

      if (!tossRes.success) {
        console.error('[cancel] Toss cancel failed:', tossRes.error);
        return NextResponse.json(
          {
            success: false,
            code: tossRes.error?.code,
            error: tossRes.error?.message || 'PG 결제 취소 요청이 거절되었습니다.',
          },
          { status: 400 }
        );
      }
      tossCancelData = tossRes.data;
    } else {
      console.log(`[cancel] paymentKey 없음 (목업 주문 또는 무통장 주문 취소): ${orderId}`);
    }

    // 5. DB 상태 업데이트
    const newStatus = dbOrder.status === 'paid' ? 'cancelled' : 'refunded';
    const amountToCancel = cancelAmount || dbOrder.final_payment_amount;

    const { data: updatedOrder, error: updateError } = await client
      .from('orders')
      .update({
        status: newStatus,
        cancel_reason: cancelReason.trim(),
        cancel_amount: amountToCancel,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', dbOrder.id)
      .select()
      .single();

    if (updateError) {
      console.error('[cancel] DB update error:', updateError);
    }

    // 6. 사용했던 포인트 환불 복구
    if (dbOrder.used_points > 0 && dbOrder.user_id && !dbOrder.user_id.startsWith('guest')) {
      try {
        const { data: member } = await client
          .from('members')
          .select('points')
          .eq('id', dbOrder.user_id)
          .maybeSingle();

        if (member) {
          const restoredPoints = (member.points || 0) + dbOrder.used_points;
          await client
            .from('members')
            .update({ points: restoredPoints })
            .eq('id', dbOrder.user_id);
        }
      } catch (ptErr) {
        console.warn('[cancel] Point restore warning:', ptErr);
      }
    }

    // 7. 재고 복구 처리
    if (dbOrder.items) {
      try {
        const items = typeof dbOrder.items === 'string' ? JSON.parse(dbOrder.items) : dbOrder.items;
        for (const item of items) {
          if (item.productId && item.quantity) {
            const { data: prod } = await client
              .from('products')
              .select('id, stock_quantity')
              .eq('id', item.productId)
              .maybeSingle();

            if (prod && prod.stock_quantity !== undefined) {
              await client
                .from('products')
                .update({ stock_quantity: prod.stock_quantity + item.quantity })
                .eq('id', item.productId);
            }
          }
        }
      } catch (stockErr) {
        console.warn('[cancel] Stock restore warning:', stockErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: '주문 및 결제 취소가 성공적으로 완료되었습니다.',
      orderId: dbOrder.id,
      orderNumber: dbOrder.order_number,
      status: newStatus,
      cancelledAt: new Date().toISOString(),
      tossCancelData,
      order: updatedOrder || dbOrder,
    });
  } catch (err: any) {
    console.error('[cancel] Exception:', err);
    return NextResponse.json(
      { success: false, error: err.message || '결제 취소 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
