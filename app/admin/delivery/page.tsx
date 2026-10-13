'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { Order, OrderStatus } from '@/types';
import {
  Truck,
  Send,
  CheckCircle2,
  Package,
  Search,
  Filter,
  RefreshCw,
  Database,
  Copy,
  Check,
  Edit,
  X,
  MapPin,
  Phone,
  User,
  Clock,
  ExternalLink,
  AlertCircle,
  FileText
} from 'lucide-react';

const CARRIERS = [
  'CJ대한통운',
  '우체국택배',
  '롯데택배',
  '한진택배',
  '로젠택배',
];

export default function AdminDeliveryPage() {
  const {
    orders,
    isLoadingOrders,
    refreshOrders,
    updateOrderTracking,
    updateOrderDeliveryInfo,
    updateOrderStatus,
    syncDeliveriesToSupabase,
    showToast,
  } = useShop();

  // 검색 및 필터링 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'preparing' | 'shipped' | 'delivered'>('all');

  // 송장번호/택배사 인라인 입력 상태 map
  const [trackingInputs, setTrackingInputs] = useState<Record<string, { carrier: string; number: string }>>({});
  const [submittingOrderId, setSubmittingOrderId] = useState<string | null>(null);

  // 배송 & 송장 정보 수정 모달 상태
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState<{
    receiverName: string;
    receiverPhone: string;
    shippingAddress: string;
    shippingDetailAddress: string;
    shippingMemo: string;
    carrier: string;
    trackingNumber: string;
    status: OrderStatus;
  }>({
    receiverName: '',
    receiverPhone: '',
    shippingAddress: '',
    shippingDetailAddress: '',
    shippingMemo: '',
    carrier: 'CJ대한통운',
    trackingNumber: '',
    status: 'preparing',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Supabase SQL 가이드 모달 상태
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // 배송 상태별 통계 계산
  const totalCount = orders.length;
  const preparingCount = orders.filter((o) => o.status === 'paid' || o.status === 'preparing').length;
  const shippedCount = orders.filter((o) => o.status === 'shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  // 필터링 적용된 주문 목록
  const filteredOrders = orders.filter((order) => {
    // 탭 필터
    if (statusFilter === 'preparing') {
      if (order.status !== 'paid' && order.status !== 'preparing') return false;
    } else if (statusFilter === 'shipped') {
      if (order.status !== 'shipped') return false;
    } else if (statusFilter === 'delivered') {
      if (order.status !== 'delivered') return false;
    }

    // 검색어 필터
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchOrderNumber = order.orderNumber.toLowerCase().includes(q);
      const matchReceiver = order.receiverName.toLowerCase().includes(q);
      const matchPhone = order.receiverPhone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''));
      const matchTracking = order.tracking?.trackingNumber?.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''));
      const matchAddress = order.shippingAddress.toLowerCase().includes(q);
      return matchOrderNumber || matchReceiver || matchPhone || matchTracking || matchAddress;
    }

    return true;
  });

  const handleCarrierChange = (orderId: string, carrier: string) => {
    setTrackingInputs((prev) => ({
      ...prev,
      [orderId]: {
        carrier,
        number: prev[orderId]?.number !== undefined ? prev[orderId].number : (orders.find((o) => o.id === orderId)?.tracking?.trackingNumber || ''),
      },
    }));
  };

  const handleNumberChange = (orderId: string, number: string) => {
    setTrackingInputs((prev) => ({
      ...prev,
      [orderId]: {
        carrier: prev[orderId]?.carrier || (orders.find((o) => o.id === orderId)?.tracking?.carrier || 'CJ대한통운'),
        number,
      },
    }));
  };

  // 인라인 송장 등록 및 출고
  const handleRegisterTracking = async (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const inputData = trackingInputs[orderId];
    const number = (inputData?.number !== undefined ? inputData.number : (targetOrder.tracking?.trackingNumber || '')).trim();
    const carrier = inputData?.carrier || targetOrder.tracking?.carrier || 'CJ대한통운';

    if (!number) {
      showToast('운송장 번호를 입력해주세요.', 'error');
      return;
    }

    setSubmittingOrderId(orderId);
    try {
      await updateOrderTracking(orderId, carrier, number);
    } finally {
      setSubmittingOrderId(null);
    }
  };

  // 수정 모달 열기
  const handleOpenEditModal = (order: Order) => {
    setEditingOrder(order);
    setEditForm({
      receiverName: order.receiverName || '',
      receiverPhone: order.receiverPhone || '',
      shippingAddress: order.shippingAddress || '',
      shippingDetailAddress: order.shippingDetailAddress || '',
      shippingMemo: order.shippingMemo || '',
      carrier: order.tracking?.carrier || 'CJ대한통운',
      trackingNumber: order.tracking?.trackingNumber || '',
      status: order.status,
    });
  };

  // 수정 모달 저장
  const handleSaveEdit = async () => {
    if (!editingOrder) return;
    if (!editForm.receiverName.trim()) {
      showToast('수령인 이름을 입력해주세요.', 'error');
      return;
    }
    if (!editForm.shippingAddress.trim()) {
      showToast('배송지 주소를 입력해주세요.', 'error');
      return;
    }

    setIsSavingEdit(true);
    try {
      await updateOrderDeliveryInfo(editingOrder.id, {
        receiverName: editForm.receiverName.trim(),
        receiverPhone: editForm.receiverPhone.trim(),
        shippingAddress: editForm.shippingAddress.trim(),
        shippingDetailAddress: editForm.shippingDetailAddress.trim(),
        shippingMemo: editForm.shippingMemo.trim(),
        carrier: editForm.carrier,
        trackingNumber: editForm.trackingNumber.trim(),
        status: editForm.status,
      });
      setEditingOrder(null);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const sqlScript = `-- ==========================================
-- deliveries (배송 및 운송장 관리) 테이블 생성 스크립트
-- ==========================================
CREATE TABLE IF NOT EXISTS public.deliveries (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    order_number TEXT NOT NULL,
    carrier TEXT NOT NULL DEFAULT 'CJ대한통운',
    carrier_code TEXT DEFAULT '04',
    tracking_number TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'shipped' CHECK (status IN ('preparing', 'shipped', 'in_transit', 'delivered', 'returned')),
    receiver_name TEXT NOT NULL,
    receiver_phone TEXT NOT NULL,
    shipping_zipcode TEXT DEFAULT '',
    shipping_address TEXT NOT NULL,
    shipping_detail_address TEXT DEFAULT '',
    shipping_memo TEXT DEFAULT '',
    items_summary TEXT DEFAULT '',
    shipped_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON public.deliveries (order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_number ON public.deliveries (order_number);
CREATE INDEX IF NOT EXISTS idx_deliveries_tracking_number ON public.deliveries (tracking_number);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries (status);

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on deliveries" ON public.deliveries;
CREATE POLICY "Allow public read on deliveries" ON public.deliveries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on deliveries" ON public.deliveries;
CREATE POLICY "Allow public insert on deliveries" ON public.deliveries FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on deliveries" ON public.deliveries;
CREATE POLICY "Allow public update on deliveries" ON public.deliveries FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on deliveries" ON public.deliveries;
CREATE POLICY "Allow public delete on deliveries" ON public.deliveries FOR DELETE USING (true);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setIsCopied(true);
    showToast('SQL 스크립트가 클립보드에 복사되었습니다!', 'success');
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-6 text-xs">
      {/* 1. 상단 헤더 & Supabase DB 실시간 연동 상태 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
              <Truck className="w-6 h-6 text-rose-600" />
              배송 &amp; 운송장 관리
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Supabase deliveries &amp; orders 실시간 동기화
            </span>
          </div>
          <p className="text-neutral-500 mt-1">
            택배사 지정, 운송장 번호 입력, 수령인/배송지 수정 및 배송 상태 변경 내역이 Supabase DB에 실시간 저장됩니다.
          </p>
        </div>

        {/* 액션 버튼 그룹 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* DB 새로고침 */}
          <button
            onClick={() => refreshOrders()}
            disabled={isLoadingOrders}
            className="bg-white hover:bg-neutral-50 text-neutral-700 font-bold px-3 py-2 rounded-xl border border-neutral-300 transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            title="Supabase에서 최신 주문 및 배송 목록 동기화"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin text-rose-600' : ''}`} />
            {isLoadingOrders ? '동기화 중...' : 'DB 새로고침'}
          </button>

          {/* 기존 배송 데이터 Supabase 동기화 */}
          <button
            onClick={() => syncDeliveriesToSupabase()}
            disabled={isLoadingOrders}
            className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            title="현재 주문의 배송 및 송장 데이터를 Supabase deliveries 테이블에 저장"
          >
            <Send className="w-3.5 h-3.5 text-rose-400" />
            초기 배송 DB 동기화
          </button>

          {/* Supabase SQL 스크립트 모달 열기 */}
          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-2 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Database className="w-3.5 h-3.5" />
            Supabase SQL 가이드
          </button>
        </div>
      </div>

      {/* 2. 배송 상태 통계 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'all'
              ? 'bg-neutral-900 text-white border-neutral-900 shadow-md'
              : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold opacity-80">전체 주문</span>
            <Package className="w-4 h-4 opacity-70" />
          </div>
          <p className="text-xl font-black mt-1">{totalCount}건</p>
        </div>

        <div
          onClick={() => setStatusFilter('preparing')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'preparing'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md'
              : 'bg-white text-neutral-800 border-neutral-200 hover:border-amber-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold opacity-80">발주/배송준비</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black mt-1 text-amber-600 group-data-[active=true]:text-white">
            {preparingCount}건
          </p>
        </div>

        <div
          onClick={() => setStatusFilter('shipped')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'shipped'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-neutral-800 border-neutral-200 hover:border-blue-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold opacity-80">배송중 (송장등록)</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-black mt-1 text-blue-600">
            {shippedCount}건
          </p>
        </div>

        <div
          onClick={() => setStatusFilter('delivered')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'delivered'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white text-neutral-800 border-neutral-200 hover:border-emerald-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold opacity-80">배송완료</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black mt-1 text-emerald-600">
            {deliveredCount}건
          </p>
        </div>
      </div>

      {/* 3. 검색 및 필터 툴바 */}
      <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* 탭 버튼 */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
              statusFilter === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            전체 ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('preparing')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
              statusFilter === 'preparing' ? 'bg-amber-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            발주/배송준비 ({preparingCount})
          </button>
          <button
            onClick={() => setStatusFilter('shipped')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
              statusFilter === 'shipped' ? 'bg-blue-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            배송중 ({shippedCount})
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
              statusFilter === 'delivered' ? 'bg-emerald-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            배송완료 ({deliveredCount})
          </button>
        </div>

        {/* 검색 인풋 */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="주문번호, 수령인, 연락처, 송장번호 검색"
            className="w-full bg-neutral-50 border border-neutral-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-rose-600 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. 배송 대상 및 송장 관리 테이블 */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-neutral-200">
            <thead className="bg-neutral-50 text-neutral-500 font-bold">
              <tr>
                <th className="p-4">주문번호 / 상태</th>
                <th className="p-4">수령인 / 주소</th>
                <th className="p-4">상품 요약</th>
                <th className="p-4">택배사 선택</th>
                <th className="p-4">운송장 번호</th>
                <th className="p-4 text-right">송장 등록 &amp; 관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-neutral-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    해당 조건에 일치하는 배송/주문 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const currentCarrier =
                    trackingInputs[order.id]?.carrier || order.tracking?.carrier || 'CJ대한통운';
                  const currentNumber =
                    trackingInputs[order.id]?.number !== undefined
                      ? trackingInputs[order.id]?.number
                      : (order.tracking?.trackingNumber || '');

                  const isSubmitting = submittingOrderId === order.id;

                  // 상태 뱃지 스타일
                  let statusBadge = (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-600">
                      상태: {order.status}
                    </span>
                  );
                  if (order.status === 'paid') {
                    statusBadge = (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        결제완료 (발주대기)
                      </span>
                    );
                  } else if (order.status === 'preparing') {
                    statusBadge = (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        배송준비중
                      </span>
                    );
                  } else if (order.status === 'shipped') {
                    statusBadge = (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                        배송중
                      </span>
                    );
                  } else if (order.status === 'delivered') {
                    statusBadge = (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        배송완료
                      </span>
                    );
                  }

                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors">
                      {/* 주문번호 및 상태 */}
                      <td className="p-4 font-mono font-bold text-neutral-900 align-top">
                        <div className="flex items-center gap-1.5">
                          <span>{order.orderNumber}</span>
                        </div>
                        <div className="mt-1">{statusBadge}</div>
                        <span className="text-[10px] text-neutral-400 font-normal block mt-1">
                          {order.createdAt}
                        </span>
                      </td>

                      {/* 수령인 및 배송지 */}
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-neutral-900">{order.receiverName}</strong>
                          <span className="text-neutral-400 text-[11px]">({order.receiverPhone})</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 mt-0.5 leading-snug max-w-xs">
                          {order.shippingAddress} {order.shippingDetailAddress}
                        </p>
                        {order.shippingMemo && (
                          <p className="text-[10px] text-neutral-400 mt-1 italic">
                            💬 {order.shippingMemo}
                          </p>
                        )}
                      </td>

                      {/* 상품 요약 */}
                      <td className="p-4 align-top">
                        <p className="truncate max-w-xs font-semibold text-neutral-800">
                          {order.items[0]?.productName || '상품 정보 없음'}
                          {order.items.length > 1 && (
                            <span className="text-rose-600 font-bold ml-1">
                              외 {order.items.length - 1}건
                            </span>
                          )}
                        </p>
                        <span className="text-[11px] text-neutral-400">
                          총 결제액: ₩{order.finalPaymentAmount.toLocaleString()}
                        </span>
                      </td>

                      {/* 택배사 선택 */}
                      <td className="p-4 align-top">
                        <select
                          value={currentCarrier}
                          onChange={(e) => handleCarrierChange(order.id, e.target.value)}
                          className="bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-xs cursor-pointer focus:outline-none focus:border-rose-600 focus:bg-white"
                        >
                          {CARRIERS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* 운송장 번호 입력 */}
                      <td className="p-4 align-top">
                        <input
                          type="text"
                          value={currentNumber}
                          onChange={(e) => handleNumberChange(order.id, e.target.value)}
                          placeholder="송장번호 숫자 입력"
                          className="bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-xs font-mono w-44 focus:outline-none focus:border-rose-600 focus:bg-white"
                        />
                        {order.tracking?.shippedAt && (
                          <span className="block text-[10px] text-neutral-400 mt-1 font-mono">
                            출고: {order.tracking.shippedAt}
                          </span>
                        )}
                      </td>

                      {/* 액션 버튼 */}
                      <td className="p-4 text-right align-top">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {/* 송장출고 / 송장수정 버튼 */}
                          <button
                            onClick={() => handleRegisterTracking(order.id)}
                            disabled={isSubmitting}
                            className={`font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-2xs transition-colors disabled:opacity-50 ${
                              order.status === 'shipped' || order.status === 'delivered'
                                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                : 'bg-rose-600 hover:bg-rose-500 text-white'
                            }`}
                            title="운송장 정보를 Supabase DB에 저장하고 배송중으로 변경합니다"
                          >
                            {isSubmitting ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            {order.status === 'shipped' || order.status === 'delivered' ? '송장수정' : '송장출고'}
                          </button>

                          {/* 배송완료 전환 버튼 */}
                          {order.status === 'shipped' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors shadow-2xs"
                              title="배송완료 상태로 업데이트합니다"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              배송완료
                            </button>
                          )}

                          {/* 배송 정보 상세 수정 모달 버튼 */}
                          <button
                            onClick={() => handleOpenEditModal(order)}
                            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors"
                            title="수령인, 주소, 택배사, 송장번호 직접 수정"
                          >
                            <Edit className="w-3.5 h-3.5 text-neutral-500" />
                            수정
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. [배송 & 송장 정보 수정] 모달 */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-base text-neutral-900">배송 및 송장 정보 수정</h3>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="p-1 rounded-lg hover:bg-neutral-200 text-neutral-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs">
                <span className="text-neutral-500 font-bold block">주문번호</span>
                <span className="font-mono font-bold text-neutral-900 text-sm">{editingOrder.orderNumber}</span>
              </div>

              {/* 수령인 & 연락처 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">수령인 성함</label>
                  <input
                    type="text"
                    value={editForm.receiverName}
                    onChange={(e) => setEditForm({ ...editForm, receiverName: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:border-rose-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">수령인 연락처</label>
                  <input
                    type="text"
                    value={editForm.receiverPhone}
                    onChange={(e) => setEditForm({ ...editForm, receiverPhone: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:border-rose-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* 기본주소 & 상세주소 */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">배송지 주소</label>
                <input
                  type="text"
                  value={editForm.shippingAddress}
                  onChange={(e) => setEditForm({ ...editForm, shippingAddress: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:border-rose-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">상세 주소</label>
                <input
                  type="text"
                  value={editForm.shippingDetailAddress}
                  onChange={(e) => setEditForm({ ...editForm, shippingDetailAddress: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:border-rose-600 focus:outline-none"
                />
              </div>

              {/* 배송 메모 */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">배송 요청사항 / 메모</label>
                <input
                  type="text"
                  value={editForm.shippingMemo}
                  onChange={(e) => setEditForm({ ...editForm, shippingMemo: e.target.value })}
                  placeholder="예: 부재 시 문 앞에 놓아주세요"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:border-rose-600 focus:outline-none"
                />
              </div>

              {/* 택배사 & 운송장 번호 */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">택배사</label>
                  <select
                    value={editForm.carrier}
                    onChange={(e) => setEditForm({ ...editForm, carrier: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:border-rose-600 focus:outline-none cursor-pointer"
                  >
                    {CARRIERS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">운송장 번호</label>
                  <input
                    type="text"
                    value={editForm.trackingNumber}
                    onChange={(e) => setEditForm({ ...editForm, trackingNumber: e.target.value })}
                    placeholder="숫자 입력"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-mono focus:bg-white focus:border-rose-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* 배송 상태 */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">배송 상태 지정</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as OrderStatus })}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:border-rose-600 focus:outline-none cursor-pointer"
                >
                  <option value="paid">결제완료 (발주대기)</option>
                  <option value="preparing">배송준비중</option>
                  <option value="shipped">배송중 (출고완료)</option>
                  <option value="delivered">배송완료</option>
                  <option value="cancelled">주문취소</option>
                  <option value="refunded">환불완료</option>
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="px-4 py-2 rounded-xl text-neutral-600 font-bold hover:bg-neutral-200 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSavingEdit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {isSavingEdit ? '저장 중...' : 'Supabase DB 저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Supabase SQL DDL 가이드 모달 */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-base text-neutral-900">Supabase deliveries 테이블 DDL 스크립트</h3>
              </div>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-200 text-neutral-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-neutral-600 leading-relaxed text-xs">
                Supabase 대시보드 (<a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-rose-600 underline font-bold">SQL Editor</a>)에
                접속하여 아래 스크립트를 실행하시면 <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono font-bold">deliveries</code> 테이블이 즉시 생성됩니다.
              </p>

              <div className="relative">
                <pre className="p-4 bg-neutral-950 text-neutral-100 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-neutral-800 max-h-72">
                  {sqlScript}
                </pre>
                <button
                  onClick={copySqlToClipboard}
                  className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 backdrop-blur-xs transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? '복사됨!' : 'SQL 복사'}
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500">
                실행 후 테이블이 생성되면 바로 데이터가 실시간으로 저장 및 동기화됩니다.
              </span>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-white font-bold hover:bg-neutral-800 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
