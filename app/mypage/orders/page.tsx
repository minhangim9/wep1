'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { Order, OrderStatus } from '@/types';
import {
  ChevronRight,
  Package,
  Truck,
  RotateCcw,
  XCircle,
  Clock,
  ExternalLink,
  Receipt,
  CheckCircle2,
} from 'lucide-react';

export default function MyOrdersPage() {
  const { orders, cancelOrder, requestRefund, requestReturn, showToast } = useShop();

  const [activeTab, setActiveTab] = useState<'all' | 'cancelled' | 'refunded' | 'returned'>('all');

  // 모달 상태
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalType, setModalType] = useState<'cancel' | 'refund' | 'return' | 'tracking' | null>(null);
  const [reasonInput, setReasonInput] = useState('');

  // 탭별 필터링
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'cancelled') return order.status === 'cancelled';
    if (activeTab === 'refunded') return order.status === 'refund_requested' || order.status === 'refunded';
    if (activeTab === 'returned') return order.status === 'return_requested' || order.status === 'returned';
    return true;
  });

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!reasonInput.trim()) {
      showToast('사유를 입력해주세요.', 'error');
      return;
    }

    if (modalType === 'cancel') {
      cancelOrder(selectedOrder.id, reasonInput.trim());
    } else if (modalType === 'refund') {
      requestRefund(selectedOrder.id, reasonInput.trim());
    } else if (modalType === 'return') {
      requestReturn(selectedOrder.id, reasonInput.trim());
    }

    setModalType(null);
    setSelectedOrder(null);
    setReasonInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 빵부스러기 */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition-colors">홈</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/mypage" className="hover:text-neutral-900 transition-colors">마이페이지</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold">주문/배송/취소/반품 내역</span>
      </nav>

      {/* 헤더 */}
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">주문 / 취소 / 반품 내역</h1>
        <p className="text-xs text-neutral-500 mt-1">
          주문하신 상품의 배송 상태를 확인하고 취소 및 반품/환불을 신청할 수 있습니다.
        </p>
      </div>

      {/* 4단 탭 메뉴 */}
      <div className="flex border-b border-neutral-200 text-xs sm:text-sm font-bold text-center">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-3 border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          전체 주문내역 ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`flex-1 py-3 border-b-2 transition-colors ${
            activeTab === 'cancelled'
              ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          취소 내역
        </button>
        <button
          onClick={() => setActiveTab('refunded')}
          className={`flex-1 py-3 border-b-2 transition-colors ${
            activeTab === 'refunded'
              ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          환불 내역
        </button>
        <button
          onClick={() => setActiveTab('returned')}
          className={`flex-1 py-3 border-b-2 transition-colors ${
            activeTab === 'returned'
              ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          반품 내역
        </button>
      </div>

      {/* 주문 목록 */}
      <div className="space-y-6">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const canCancel = order.status === 'paid' || order.status === 'pending_payment';
            const canRefundOrReturn = order.status === 'delivered' || order.status === 'shipped';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs space-y-4 p-5 sm:p-6"
              >
                {/* 주문 상단 바 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm text-neutral-900">{order.orderNumber}</span>
                    <span className="text-neutral-400">{order.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      order.status === 'paid'
                        ? 'bg-rose-100 text-rose-700'
                        : order.status === 'shipped'
                        ? 'bg-blue-100 text-blue-700'
                        : order.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-700'
                        : order.status === 'cancelled'
                        ? 'bg-neutral-200 text-neutral-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status === 'paid' && '결제완료'}
                      {order.status === 'preparing' && '배송준비중'}
                      {order.status === 'shipped' && '배송중'}
                      {order.status === 'delivered' && '배송완료'}
                      {order.status === 'cancelled' && '주문취소완료'}
                      {order.status === 'refund_requested' && '환불신청접수'}
                      {order.status === 'refunded' && '환불완료'}
                      {order.status === 'return_requested' && '반품회수진행'}
                      {order.status === 'returned' && '반품완료'}
                    </span>
                  </div>
                </div>

                {/* 상품 목록 */}
                <div className="space-y-3 divide-y divide-neutral-50">
                  {order.items.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-xl bg-neutral-100 border border-neutral-200"
                        />
                        <div>
                          <p className="font-bold text-neutral-900 text-sm">{item.productName}</p>
                          <p className="text-neutral-500 text-[11px] mt-0.5">
                            {item.optionName ? `옵션: ${item.optionName}` : ''} | 수량: {item.quantity}개
                          </p>
                          {item.isOnePlusOneBonus && (
                            <span className="text-rose-600 font-bold text-[10px]">
                              [1+1 무료 증정품 동봉]
                            </span>
                          )}
                        </div>
                      </div>

                      <strong className="text-sm font-black text-neutral-900">
                        {item.totalPrice.toLocaleString()}원
                      </strong>
                    </div>
                  ))}
                </div>

                {/* 배송지 및 금액 요약 */}
                <div className="bg-neutral-50 p-4 rounded-xl text-xs text-neutral-600 flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <p className="font-bold text-neutral-900">배송지: {order.receiverName} ({order.receiverPhone})</p>
                    <p className="text-neutral-500 mt-0.5">({order.shippingZipcode}) {order.shippingAddress} {order.shippingDetailAddress}</p>
                    {order.tracking && (
                      <p className="text-blue-600 font-semibold mt-1">
                        {order.tracking.carrier} 송장: {order.tracking.trackingNumber}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-neutral-400 text-[11px]">
                      할인: {order.discountCouponAmount.toLocaleString()}원 | 포인트사용: {order.usedPoints.toLocaleString()}P
                    </p>
                    <p className="text-sm font-black text-rose-600 mt-0.5">
                      최종 결제액: {order.finalPaymentAmount.toLocaleString()}원
                    </p>
                  </div>
                </div>

                {/* 하단 액션 버튼 그룹 */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 text-xs">
                  {order.tracking && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setModalType('tracking');
                      }}
                      className="bg-neutral-900 text-white font-bold px-3.5 py-2 rounded-lg hover:bg-neutral-800 flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" /> 실시간 배송조회
                    </button>
                  )}

                  {canCancel && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setModalType('cancel');
                      }}
                      className="border border-neutral-300 hover:border-rose-500 hover:text-rose-600 font-bold px-3.5 py-2 rounded-lg text-neutral-700 transition-colors"
                    >
                      주문 취소
                    </button>
                  )}

                  {canRefundOrReturn && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setModalType('refund');
                        }}
                        className="border border-neutral-300 hover:border-neutral-500 font-bold px-3.5 py-2 rounded-lg text-neutral-700"
                      >
                        환불 신청
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setModalType('return');
                        }}
                        className="border border-neutral-300 hover:border-neutral-500 font-bold px-3.5 py-2 rounded-lg text-neutral-700"
                      >
                        반품 신청
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 text-neutral-400 text-xs">
            해당하는 주문 내역이 없습니다.
          </div>
        )}
      </div>

      {/* 액션 모달 (취소/환불/반품/배송추적) */}
      {modalType && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-neutral-900">
              {modalType === 'cancel' && '주문 취소 신청'}
              {modalType === 'refund' && '환불 신청'}
              {modalType === 'return' && '반품 신청'}
              {modalType === 'tracking' && '실시간 배송 조회'}
            </h3>

            {modalType === 'tracking' ? (
              <div className="space-y-4 text-xs">
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
                  <p><strong>택배사 :</strong> {selectedOrder.tracking?.carrier || 'CJ대한통운'}</p>
                  <p><strong>송장번호 :</strong> <span className="font-mono text-rose-600 font-bold">{selectedOrder.tracking?.trackingNumber}</span></p>
                  <p><strong>출고일시 :</strong> {selectedOrder.tracking?.shippedAt || '2026-10-06'}</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-blue-800">
                  <p className="font-bold flex items-center gap-1">
                    <Truck className="w-4 h-4" /> [간선상차] 허브터미널에서 배송지역으로 이동 중
                  </p>
                  <p className="text-[11px] text-blue-600">익일 오전 배송 담당 기사님이 배정될 예정입니다.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="w-full py-2.5 bg-neutral-900 text-white font-bold rounded-lg"
                >
                  확인 완료
                </button>
              </div>
            ) : (
              <form onSubmit={handleActionSubmit} className="space-y-4 text-xs">
                <p className="text-neutral-600 leading-relaxed">
                  주문번호 <strong className="font-mono text-neutral-900">{selectedOrder.orderNumber}</strong>건에 대해 {modalType === 'cancel' ? '취소' : modalType === 'refund' ? '환불' : '반품'}을 진행합니다.
                </p>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    신청 사유 선택 / 입력 *
                  </label>
                  <select
                    onChange={(e) => setReasonInput(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs mb-2 cursor-pointer"
                  >
                    <option value="">사유를 선택하세요</option>
                    <option value="단순 변심">단순 변심 / 다른 상품 재구매</option>
                    <option value="피부 트러블 발생">피부 트러블 발생 (100% 무료 환불 대상)</option>
                    <option value="배송 지연">배송 지연</option>
                    <option value="상품 불량/파손">상품 불량 또는 파손</option>
                    <option value="직접 입력">기타 직접 입력</option>
                  </select>

                  <textarea
                    rows={3}
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    placeholder="상세 사유를 입력해주세요."
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalType(null);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 py-2.5 border border-neutral-300 rounded-lg text-neutral-700 font-bold"
                  >
                    닫기
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold transition-colors"
                  >
                    신청 완료
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
