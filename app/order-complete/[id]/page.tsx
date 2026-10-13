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
  ExternalLink,
  CreditCard,
  Receipt,
  ShieldCheck,
} from 'lucide-react';

export default function OrderCompletePage() {
  const params = useParams();
  const orderId = params.id as string;
  const { orders } = useShop();

  const order =
    orders.find((o) => o.id === orderId || o.orderNumber === orderId) || orders[0];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-8 animate-in fade-in">
      {/* 축하 아이콘 및 타이틀 */}
      <div className="space-y-3">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 text-xs font-bold px-3 py-1 rounded-full border border-rose-200">
          <Sparkles className="w-3.5 h-3.5" /> 토스페이먼츠 안전 결제 승인 완료
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">
          주문 및 결제가 성공적으로 완료되었습니다!
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
          카카오톡 알림톡으로 주문 내역과 전자영수증이 발송되었습니다. 정성껏 포장하여 신속히
          발송해 드리겠습니다.
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
            <p>
              받는 분 : {order.receiverName} ({order.receiverPhone})
            </p>
            <p>
              주소 : ({order.shippingZipcode}) {order.shippingAddress} {order.shippingDetailAddress}
            </p>
            {order.shippingMemo && (
              <p className="text-neutral-400 text-[11px]">배송 메모 : {order.shippingMemo}</p>
            )}
          </div>

          {/* 주문 상품 리스트 */}
          <div className="pt-3 border-t border-neutral-200 space-y-2">
            <p className="font-bold text-neutral-900">주문 상품 목록</p>
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-neutral-700">
                <span className="truncate max-w-md">
                  {item.productName} {item.optionName ? `(${item.optionName})` : ''} x{' '}
                  {item.quantity}
                  {item.isOnePlusOneBonus && (
                    <span className="ml-1 text-rose-600 font-bold text-[10px]">
                      [1+1 증정포함]
                    </span>
                  )}
                </span>
                <strong className="text-neutral-900">{item.totalPrice.toLocaleString()}원</strong>
              </div>
            ))}
          </div>

          {/* PG 결제 수단 및 영수증 정보 */}
          <div className="pt-3 border-t border-neutral-200 space-y-2 bg-white p-3.5 rounded-xl border border-neutral-200/80">
            <div className="flex items-center justify-between font-bold text-neutral-900">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-rose-500" />
                결제 승인 상세 (토스페이먼츠)
              </span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-200">
                결제 완료 (Paid)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-600">
              <div>
                <span className="text-neutral-400">결제 수단: </span>
                <strong className="text-neutral-800">
                  {order.paymentDetails?.easyPayProvider
                    ? `${order.paymentDetails.easyPayProvider} 간편결제`
                    : order.paymentDetails?.cardName
                    ? `${order.paymentDetails.cardName} 신용/체크카드`
                    : '온라인 결제'}
                </strong>
              </div>

              {order.paymentDetails?.approveNo && (
                <div>
                  <span className="text-neutral-400">승인번호: </span>
                  <span className="font-mono text-neutral-800">
                    {order.paymentDetails.approveNo}
                  </span>
                </div>
              )}

              {order.paymentKey && (
                <div className="sm:col-span-2">
                  <span className="text-neutral-400">PG 거래키: </span>
                  <span className="font-mono text-[10px] text-neutral-600 truncate block">
                    {order.paymentKey}
                  </span>
                </div>
              )}
            </div>

            {/* 공식 영수증 보기 링크 */}
            {order.paymentDetails?.receiptUrl && (
              <div className="pt-2 border-t border-neutral-100 flex justify-end">
                <a
                  href={order.paymentDetails.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-2xs"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>토스페이먼츠 전자영수증(매출전표) 확인</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            )}
          </div>

          {/* 최종 결제 금액 */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-between text-sm">
            <span className="font-bold text-neutral-900">최종 결제 금액</span>
            <strong className="text-2xl font-black text-rose-600">
              {order.finalPaymentAmount.toLocaleString()}원
            </strong>
          </div>
        </div>
      )}

      {/* 하단 네비게이션 버튼 */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Link
          href="/mypage/orders"
          className="bg-neutral-900 text-white font-bold px-6 py-3.5 rounded-xl text-xs hover:bg-neutral-800 transition-colors shadow-sm"
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
