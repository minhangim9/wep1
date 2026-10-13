import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getTossPayment } from '@/lib/tossPayments';

/**
 * Toss Payments Webhook 수신 엔드포인트
 * (가상계좌 입금 완료, 결제 상태 변경, 취소 이벤트 등 수신)
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    console.log('[TossWebhook] Received event:', rawBody.eventType, rawBody.data?.orderId);

    const { eventType, data } = rawBody;

    if (!data?.paymentKey) {
      return NextResponse.json({ message: 'No paymentKey in payload' }, { status: 400 });
    }

    // 보안 검증: 웹훅 페이로드만 믿지 않고, 토스 공식 API로 실시간 역조회 수행
    const tossLookup = await getTossPayment(data.paymentKey);
    if (!tossLookup.success || !tossLookup.data) {
      console.error('[TossWebhook] Verification failed: Unable to lookup payment from Toss API');
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    const officialPayment = tossLookup.data;
    const client = getSupabaseClient();

    // DB에서 주문 조회
    const { data: dbOrder } = await client
      .from('orders')
      .select('*')
      .or(`id.eq.${officialPayment.orderId},order_number.eq.${officialPayment.orderId}`)
      .maybeSingle();

    if (!dbOrder) {
      console.warn(`[TossWebhook] Order not found for orderId: ${officialPayment.orderId}`);
      return NextResponse.json({ message: 'Order not found, acknowledged' }, { status: 200 });
    }

    // 1. 가상계좌 입금 완료 또는 결제 완료 이벤트
    if (
      officialPayment.status === 'DONE' &&
      dbOrder.status !== 'paid'
    ) {
      console.log(`[TossWebhook] Order ${dbOrder.order_number} marked as PAID via webhook`);
      await client
        .from('orders')
        .update({
          status: 'paid',
          payment_key: officialPayment.paymentKey,
          payment_details: {
            ...(dbOrder.payment_details || {}),
            approvedAt: officialPayment.approvedAt,
            receiptUrl: officialPayment.receipt?.url,
            cardName: officialPayment.card?.company,
            vbankName: officialPayment.virtualAccount?.bankCode,
            updatedViaWebhook: true,
          },
        })
        .eq('id', dbOrder.id);
    }

    // 2. 결제 취소 이벤트
    if (
      (officialPayment.status === 'CANCELED' || officialPayment.status === 'PARTIAL_CANCELED') &&
      dbOrder.status !== 'cancelled' &&
      dbOrder.status !== 'refunded'
    ) {
      console.log(`[TossWebhook] Order ${dbOrder.order_number} marked as CANCELLED via webhook`);
      await client
        .from('orders')
        .update({
          status: 'cancelled',
          cancel_reason: officialPayment.cancels?.[0]?.cancelReason || '토스페이먼츠 웹훅 취소 통보',
          cancel_amount: officialPayment.cancels?.[0]?.cancelAmount || dbOrder.final_payment_amount,
          cancelled_at: officialPayment.cancels?.[0]?.canceledAt || new Date().toISOString(),
        })
        .eq('id', dbOrder.id);
    }

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
  } catch (err: any) {
    console.error('[TossWebhook] Exception:', err);
    return NextResponse.json(
      { error: err.message || 'Webhook processing error' },
      { status: 500 }
    );
  }
}
