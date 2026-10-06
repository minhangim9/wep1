'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import {
  CheckCircle2,
  Package,
  Truck,
  Gift,
  ArrowRight,
  Sparkles,
  MessageCircle,
} from 'lucide-react';

export default function OrderCompletePage() {
  const params = useParams();
  const orderId = params.id as string;
  const { orders } = useShop();

  const order = orders.find((o) => o.id === orderId) || orders[0];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-8">
      {/* 축하 아이콘 및 타이틀 */}
      <div className="space-y-3">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 text-xs font-bold px-3 py-1 rounded-full border border-rose-200">
          <Sparkles className="w-3.5 h-3.5" /> 주문 및 결제 정상 완료
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">
          주문이 성공적으로 접수되었습니다!
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
          카카오톡 알림톡으로 주문 내역과 배송 조회가 전송되었습니다. 정성껏 포장하여 신속히 발송해 드리겠습니다.
        </p>
      </div>

      {order && (
        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 text-left space-y-4 text-xs">
          {/* 주문 기본 정보 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-200 gap-2">
            <div>
              <span className="text-neutral-400 block text-[11px]">주문번호</span>
              <strong className="text-sm sm:text-base font-black text-neutral-900 font-mono">
                {order.orderNumber}
              </strong>
            </div>
            <div>
              <span className="text-neutral-400 block text-[11px]">주문일시</span>
              <span className="text-neutral-700">{order.createdAt}</span>
            </div>
          </div>

          {/* 배송지 요약 */}
          <div className="space-y-1 text-neutral-600 py-1">
            <p className="font-bold text-neutral-900">배송지 정보</p>
            <p>받는 분 : {order.receiverName} ({order.receiverPhone})</p>
            <p>주소 : ({order.shippingZipcode}) {order.shippingAddress} {order.shippingDetailAddress}</p>
          </div>

          {/* 주문 상품 리스트 */}
          <div className="pt-3 border-t border-neutral-200 space-y-2">
            <p className="font-bold text-neutral-900">주문 상품 목록</p>
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-neutral-700">
                <span className="truncate max-w-md">
                  {item.productName} {item.optionName ? `(${item.optionName})` : ''} x {item.quantity}
                  {item.isOnePlusOneBonus && (
                    <span className="ml-1 text-rose-600 font-bold text-[10px]">[1+1 증정포함]</span>
                  )}
                </span>
                <strong className="text-neutral-900">{item.totalPrice.toLocaleString()}원</strong>
              </div>
            ))}
          </div>

          {/* 최종 결제 금액 */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-between text-sm">
            <span className="font-bold text-neutral-900">최종 결제 금액</span>
            <strong className="text-xl font-black text-rose-600">
              {order.finalPaymentAmount.toLocaleString()}원
            </strong>
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Link
          href="/mypage/orders"
          className="bg-neutral-900 text-white font-bold px-6 py-3.5 rounded-xl text-xs hover:bg-neutral-800 transition-colors"
        >
          나의 주문 내역 보러가기
        </Link>
        <Link
          href="/"
          className="bg-neutral-100 text-neutral-700 font-bold px-6 py-3.5 rounded-xl text-xs hover:bg-neutral-200 transition-colors"
        >
          쇼핑 계속하기
        </Link>
      </div>
    </div>
  );
}
