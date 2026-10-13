import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, parseSupabaseError } from '@/lib/supabase';
import { OrderItem, Order } from '@/types';
import crypto from 'crypto';

interface CreateOrderBody {
  userId?: string;
  userName?: string;
  receiverName: string;
  receiverPhone: string;
  shippingZipcode: string;
  shippingAddress: string;
  shippingDetailAddress?: string;
  shippingMemo?: string;
  items: Array<{
    productId: string;
    optionId?: string;
    quantity: number;
  }>;
  couponId?: string;
  pointsToUse?: number;
  paymentMethod?: Order['paymentMethod'];
  taxInvoiceRequested?: boolean;
  taxInvoiceInfo?: {
    type: 'cash_receipt' | 'tax_invoice';
    number: string;
    companyName?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderBody = await req.json();

    // 1. 필수 입력값 검증
    if (!body.receiverName?.trim() || !body.receiverPhone?.trim() || !body.shippingAddress?.trim()) {
      return NextResponse.json(
        { success: false, error: '수령인 이름, 연락처, 배송지 주소는 필수 입력값입니다.' },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: '주문할 상품이 선택되지 않았습니다.' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 2. 서버 DB 기준 상품 정보 및 재고/가격 검증
    const productIds = Array.from(new Set(body.items.map((i) => i.productId)));
    const { data: dbProducts, error: prodError } = await client
      .from('products')
      .select('*')
      .in('id', productIds);

    if (prodError) {
      console.error('[create-order] DB products query error:', prodError);
      return NextResponse.json(
        { success: false, error: '상품 정보를 조회하는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    const productMap = new Map((dbProducts || []).map((p: any) => [p.id, p]));

    const calculatedItems: OrderItem[] = [];
    let calculatedTotalItemAmount = 0;

    for (const itemReq of body.items) {
      const dbProd = productMap.get(itemReq.productId);
      if (!dbProd) {
        return NextResponse.json(
          { success: false, error: `상품(ID: ${itemReq.productId})을 찾을 수 없습니다.` },
          { status: 400 }
        );
      }

      // 품절 여부 검증
      if (dbProd.status === 'sold_out' || (dbProd.stock_quantity !== undefined && dbProd.stock_quantity <= 0)) {
        return NextResponse.json(
          { success: false, error: `[${dbProd.name}] 상품은 현재 품절되어 주문할 수 없습니다.` },
          { status: 400 }
        );
      }

      // 옵션 가격 및 재고 확인
      let optionName: string | undefined = undefined;
      let optionPrice = 0;

      if (itemReq.optionId && dbProd.options) {
        const optionsList = typeof dbProd.options === 'string' ? JSON.parse(dbProd.options) : dbProd.options;
        const matchedOption = optionsList.find((opt: any) => opt.id === itemReq.optionId);
        if (matchedOption) {
          optionName = matchedOption.name;
          optionPrice = matchedOption.additionalPrice || 0;
          if (matchedOption.stockQuantity !== undefined && matchedOption.stockQuantity < itemReq.quantity) {
            return NextResponse.json(
              { success: false, error: `[${dbProd.name} - ${optionName}] 옵션의 재고가 부족합니다.` },
              { status: 400 }
            );
          }
        }
      }

      const unitPrice = Number(dbProd.price) + optionPrice;
      const quantity = Math.max(1, Math.floor(Number(itemReq.quantity) || 1));
      const totalPrice = unitPrice * quantity;

      calculatedTotalItemAmount += totalPrice;

      calculatedItems.push({
        id: 'oi-' + crypto.randomBytes(6).toString('hex'),
        productId: dbProd.id,
        productName: dbProd.name,
        productImage: dbProd.main_image || '',
        optionName,
        unitPrice,
        quantity,
        totalPrice,
        isOnePlusOneBonus: Boolean(dbProd.is_one_plus_one),
      });
    }

    // 3. 배송비 계산 (서버 기준: 30,000원 이상 무료배송, 미만 3,000원)
    const calculatedShippingFee = calculatedTotalItemAmount >= 30000 || calculatedTotalItemAmount === 0 ? 0 : 3000;

    // 4. 쿠폰 할인 검증
    let couponDiscount = 0;
    if (body.couponId) {
      const { data: dbCoupon } = await client
        .from('coupons')
        .select('*')
        .eq('id', body.couponId)
        .maybeSingle();

      if (dbCoupon && !dbCoupon.is_used && calculatedTotalItemAmount >= (dbCoupon.min_order_amount || 0)) {
        if (dbCoupon.discount_type === 'fixed') {
          couponDiscount = dbCoupon.discount_value || 0;
        } else {
          couponDiscount = Math.floor(calculatedTotalItemAmount * ((dbCoupon.discount_value || 0) / 100));
        }
      }
    }

    // 5. 포인트 사용 검증 (최대 주문금액의 50% 한도)
    const maxUsablePoints = Math.floor(calculatedTotalItemAmount * 0.5);
    const requestedPoints = Math.max(0, Math.floor(Number(body.pointsToUse) || 0));
    const validatedUsedPoints = Math.min(requestedPoints, maxUsablePoints);

    // 6. 최종 결제 금액 산출
    const finalPaymentAmount = Math.max(
      0,
      calculatedTotalItemAmount + calculatedShippingFee - couponDiscount - validatedUsedPoints
    );

    // 7. 고유하고 예측 불가능한 주문 번호 생성 (ORD-YYYYMMDD-HEX8)
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const orderNumber = `ORD-${todayStr}-${randomHex}`;
    const orderId = `ord-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    // 주문명 요약 (예: "센텔라 앰플 외 1건")
    const orderName =
      calculatedItems.length === 1
        ? calculatedItems[0].productName
        : `${calculatedItems[0].productName} 외 ${calculatedItems.length - 1}건`;

    // 8. DB에 status: 'pending_payment' 로 주문 저장
    const newOrderData = {
      id: orderId,
      order_number: orderNumber,
      user_id: body.userId || 'guest-' + crypto.randomBytes(4).toString('hex'),
      user_name: body.userName || body.receiverName,
      items: calculatedItems,
      total_amount: calculatedTotalItemAmount,
      discount_coupon_amount: couponDiscount,
      used_points: validatedUsedPoints,
      shipping_fee: calculatedShippingFee,
      final_payment_amount: finalPaymentAmount,
      status: 'pending_payment',
      receiver_name: body.receiverName.trim(),
      receiver_phone: body.receiverPhone.trim(),
      shipping_zipcode: body.shippingZipcode.trim(),
      shipping_address: body.shippingAddress.trim(),
      shipping_detail_address: body.shippingDetailAddress?.trim() || '',
      shipping_memo: body.shippingMemo?.trim() || '',
      payment_method: body.paymentMethod || 'card',
      payment_details: {
        orderName,
        calculatedAt: new Date().toISOString(),
      },
      tracking: {},
      tax_invoice_requested: Boolean(body.taxInvoiceRequested),
      tax_invoice_info: body.taxInvoiceInfo || {},
      created_at: new Date().toISOString(),
    };

    const { error: insertError } = await client
      .from('orders')
      .insert([newOrderData]);

    if (insertError) {
      console.error('[create-order] insert error:', insertError);
      return NextResponse.json(
        { success: false, error: parseSupabaseError(insertError) || '주문 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      amount: finalPaymentAmount,
      orderName,
      totalItemAmount: calculatedTotalItemAmount,
      shippingFee: calculatedShippingFee,
      discountAmount: couponDiscount,
      usedPoints: validatedUsedPoints,
    });
  } catch (err: any) {
    console.error('[create-order] Exception:', err);
    return NextResponse.json(
      { success: false, error: err.message || '주문 처리 중 예외가 발생했습니다.' },
      { status: 500 }
    );
  }
}
