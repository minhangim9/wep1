'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { Order, OrderStatus } from '@/types';
import {
  ShoppingCart,
  Download,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  Search,
  Filter,
  RefreshCw,
  Database,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  Eye,
  Info,
  Package,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const {
    orders,
    isLoadingOrders,
    refreshOrders,
    syncAllOrdersToSupabase,
    createOrder,
    updateOrderStatus,
    updateOrderTracking,
    deleteOrder,
    products,
    showToast,
  } = useShop();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 송장 등록 상태
  const [trackingCarrier, setTrackingCarrier] = useState('CJ대한통운');
  const [trackingNumber, setTrackingNumber] = useState('');

  // 신규 수기 주문 등록 상태
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [newReceiverName, setNewReceiverName] = useState('');
  const [newReceiverPhone, setNewReceiverPhone] = useState('010-1234-5678');
  const [newShippingAddress, setNewShippingAddress] = useState('서울특별시 강남구 테헤란로 152');
  const [newShippingDetail, setNewShippingDetail] = useState('강남파이낸스센터 12층');
  const [newSelectedProdId, setNewSelectedProdId] = useState(products[0]?.id || 'prod-001');
  const [newProdQty, setNewProdQty] = useState(1);
  const [newPaymentMethod, setNewPaymentMethod] = useState<'card' | 'transfer'>('card');

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.receiverName.toLowerCase().includes(q) ||
        o.receiverPhone.includes(q)
      );
    }
    return true;
  });

  // 발주서 CSV 다운로드
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      showToast('내보낼 주문 데이터가 없습니다.', 'error');
      return;
    }

    const headers = ['주문번호', '주문일시', '주문자명', '수령인', '연락처', '배송주소', '상품내역', '결제금액', '상태'];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      o.createdAt,
      o.userName,
      o.receiverName,
      o.receiverPhone,
      `"${o.shippingAddress} ${o.shippingDetailAddress}"`,
      `"${o.items.map((i) => `${i.productName}(${i.quantity}개)`).join(', ')}"`,
      o.finalPaymentAmount,
      o.status,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `피우다_발주서_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('발주서 CSV 파일이 다운로드되었습니다.', 'success');
  };

  // 결제완료 주문 전체를 배송준비중(발주 승인)으로 일괄 변경
  const handleBatchPrepare = async () => {
    const paidOrders = orders.filter((o) => o.status === 'paid');
    if (paidOrders.length === 0) {
      showToast('발주 처리할 결제완료(paid) 주문이 없습니다.', 'info');
      return;
    }

    for (const o of paidOrders) {
      await updateOrderStatus(o.id, 'preparing');
    }
    showToast(`총 ${paidOrders.length}건의 주문이 [배송준비중/발주완료]로 Supabase에 동기화되었습니다.`, 'success');
  };

  // 수기 신규 주문 등록 제출
  const handleCreateNewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReceiverName || !newShippingAddress) {
      showToast('수령인과 배송지 주소를 입력해주세요.', 'error');
      return;
    }

    const selectedProduct = products.find((p) => p.id === newSelectedProdId) || products[0];
    const unitPrice = selectedProduct?.price || 25000;
    const totalAmount = unitPrice * newProdQty;

    createOrder({
      userId: 'admin-manual',
      userName: newReceiverName + ' (관리자 수기)',
      items: [
        {
          id: 'ord-item-' + Date.now(),
          productId: selectedProduct?.id || 'prod-manual',
          productName: selectedProduct?.name || '피우다 화장품',
          productImage: selectedProduct?.mainImage || '',
          optionName: selectedProduct?.options[0]?.name || '단품',
          unitPrice,
          quantity: newProdQty,
          totalPrice: totalAmount,
          isOnePlusOneBonus: selectedProduct?.isOnePlusOne,
        },
      ],
      totalAmount,
      discountCouponAmount: 0,
      usedPoints: 0,
      shippingFee: 0,
      finalPaymentAmount: totalAmount,
      status: 'paid',
      receiverName: newReceiverName,
      receiverPhone: newReceiverPhone,
      shippingZipcode: '06236',
      shippingAddress: newShippingAddress,
      shippingDetailAddress: newShippingDetail,
      shippingMemo: '관리자 수기 발주 건',
      paymentMethod: newPaymentMethod,
    });

    setIsNewOrderModalOpen(false);
    setNewReceiverName('');
  };

  // 운송장 저장
  const handleSaveTracking = async () => {
    if (!selectedOrder || !trackingNumber) {
      showToast('운송장 번호를 입력해주세요.', 'error');
      return;
    }
    await updateOrderTracking(selectedOrder.id, trackingCarrier, trackingNumber);
    setIsDetailModalOpen(false);
    setTrackingNumber('');
  };

  // 토스페이먼츠 결제 취소 및 환불 처리 (관리자 권한)
  const handleCancelOrderWithPg = async (order: Order) => {
    const defaultReason = '관리자 승인 주문 취소 및 환불';
    const reason = prompt(`[토스페이먼츠 PG 결제 취소/환불]\n\n주문번호: ${order.orderNumber}\n취소 금액: ${order.finalPaymentAmount.toLocaleString()}원\n\n취소 사유를 입력해주세요:`, defaultReason);
    if (!reason) return;

    try {
      showToast('토스페이먼츠 PG 결제 취소 요청 중...', 'info');
      const res = await fetch('/api/payments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          cancelReason: reason.trim(),
          cancelAmount: order.finalPaymentAmount,
          requesterRole: 'admin',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`주문(${order.orderNumber})이 성공적으로 취소 및 환불되었습니다.`, 'success');
        await refreshOrders();
        setIsDetailModalOpen(false);
      } else {
        alert(`결제 취소 실패: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (err: any) {
      console.error('[AdminOrders] cancel error:', err);
      alert(`결제 취소 처리 중 네트워크 오류: ${err.message}`);
    }
  };

  const sqlCode = `-- Supabase SQL Editor 실행 쿼리 (https://psblczhzozsuicstbefl.supabase.co)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount INTEGER NOT NULL DEFAULT 0,
    discount_coupon_amount INTEGER NOT NULL DEFAULT 0,
    used_points INTEGER NOT NULL DEFAULT 0,
    shipping_fee INTEGER NOT NULL DEFAULT 0,
    final_payment_amount INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refund_requested', 'refunded', 'return_requested', 'returned')),
    receiver_name TEXT NOT NULL,
    receiver_phone TEXT NOT NULL,
    shipping_zipcode TEXT DEFAULT '',
    shipping_address TEXT NOT NULL,
    shipping_detail_address TEXT DEFAULT '',
    shipping_memo TEXT DEFAULT '',
    payment_method TEXT DEFAULT 'card',
    payment_details JSONB DEFAULT '{}'::jsonb,
    tracking JSONB DEFAULT '{}'::jsonb,
    tax_invoice_requested BOOLEAN DEFAULT false,
    tax_invoice_info JSONB DEFAULT '{}'::jsonb,
    cancel_reason TEXT,
    refund_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on orders" ON public.orders;
CREATE POLICY "Allow public read on orders" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on orders" ON public.orders;
CREATE POLICY "Allow public insert on orders" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
CREATE POLICY "Allow public update on orders" ON public.orders FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on orders" ON public.orders;
CREATE POLICY "Allow public delete on orders" ON public.orders FOR DELETE USING (true);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setIsCopied(true);
    showToast('SQL 스크립트가 클립보드에 복사되었습니다!', 'success');
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-6 text-xs">
      {/* 헤더 & Supabase 연동 상태 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-rose-600" />
              주문 &amp; 발주 관리
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Supabase orders 테이블 연동
            </span>
          </div>
          <p className="text-neutral-500 mt-1">
            신규 고객 주문 접수, 배송준비 발주 처리, 송장 등록 및 취소/환불 내역이 Supabase <code className="text-rose-600 font-mono font-bold">orders</code> 테이블에 실시간 동기화됩니다.
          </p>
        </div>

        {/* 액션 버튼 그룹 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* DB 새로고침 */}
          <button
            onClick={() => refreshOrders()}
            disabled={isLoadingOrders}
            className="bg-white hover:bg-neutral-50 text-neutral-700 font-bold px-3 py-2 rounded-xl border border-neutral-300 transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            title="Supabase에서 최신 주문 목록 동기화"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin text-rose-600' : ''}`} />
            {isLoadingOrders ? '동기화 중...' : 'DB 새로고침'}
          </button>

          {/* Supabase 일괄 저장 */}
          <button
            onClick={() => syncAllOrdersToSupabase()}
            disabled={isLoadingOrders}
            className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            title="현재 주문 데이터를 Supabase orders 테이블에 일괄 저장"
          >
            <Database className="w-3.5 h-3.5 text-rose-400" />
            Supabase 일괄 저장
          </button>

          {/* SQL 스키마 확인 */}
          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            title="Supabase orders 테이블 생성 DDL 확인"
          >
            <Copy className="w-3.5 h-3.5" />
            SQL 스키마 확인
          </button>

          {/* 수기 발주/주문 등록 */}
          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="bg-white hover:bg-neutral-50 text-neutral-800 font-bold px-3 py-2 rounded-xl border border-neutral-300 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4 text-rose-600" /> 신규 주문/발주 등록
          </button>

          {/* 일괄 배송준비 (발주 승인) */}
          <button
            onClick={handleBatchPrepare}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            결제완료 ➔ 일괄 배송준비 처리
          </button>

          {/* 발주서 CSV 다운로드 */}
          <button
            onClick={handleExportCSV}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> 발주서 엑셀(CSV) 다운로드
          </button>
        </div>
      </div>

      {/* 안내 배너 */}
      <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-950">
        <div className="flex items-start sm:items-center gap-2.5">
          <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong>Supabase Orders 실시간 연동:</strong> 쇼핑몰 결제 완료 건 및 관리자 발주 승인, 송장 등록, 주문 취소/환불 내역이 Supabase 클라우드 데이터베이스에 실시간으로 기록됩니다.
          </span>
        </div>
        <a
          href="https://supabase.com/dashboard/project/psblczhzozsuicstbefl/editor"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-rose-700 hover:text-rose-900 underline whitespace-nowrap"
        >
          Supabase Table Editor 열기 <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* 필터 및 검색 바 */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 ml-1" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="주문번호, 수령인, 연락처 검색"
            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-xs focus:bg-white focus:outline-rose-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-neutral-600">상태 필터:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-xs font-semibold cursor-pointer focus:bg-white focus:outline-rose-500"
            >
              <option value="all">전체 상태</option>
              <option value="paid">결제완료 (발주대기)</option>
              <option value="preparing">배송준비중 (발주승인)</option>
              <option value="shipped">배송중</option>
              <option value="delivered">배송완료</option>
              <option value="cancelled">주문취소</option>
              <option value="refund_requested">환불신청</option>
              <option value="refunded">환불완료</option>
            </select>
          </div>
          <span className="text-neutral-500 font-medium">
            총 <strong className="text-neutral-900 font-bold">{filteredOrders.length}</strong>건
          </span>
        </div>
      </div>

      {/* 주문 테이블 */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-neutral-200">
            <thead className="bg-neutral-50 text-neutral-500 font-bold">
              <tr>
                <th className="p-4">주문번호 / 일시</th>
                <th className="p-4">수령인 (연락처)</th>
                <th className="p-4">주문 상품 정보</th>
                <th className="p-4">결제금액</th>
                <th className="p-4">현재 상태</th>
                <th className="p-4 text-right">상태 변경 액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-400">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    검색 조건에 맞는 주문 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-neutral-900 block font-mono text-xs">{order.orderNumber}</strong>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setTrackingCarrier(order.tracking?.carrier || 'CJ대한통운');
                            setTrackingNumber(order.tracking?.trackingNumber || '');
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1 text-neutral-400 hover:text-neutral-900 rounded hover:bg-neutral-100"
                          title="상세보기 / 송장등록"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-neutral-400 text-[11px] block mt-0.5">{order.createdAt}</span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-bold text-neutral-900 block">{order.receiverName}</span>
                      <span className="text-neutral-400 text-[11px] font-mono">{order.receiverPhone}</span>
                      <span className="text-neutral-500 text-[10px] block truncate max-w-xs">{order.shippingAddress}</span>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 max-w-sm">
                        {order.items.map((it) => (
                          <div key={it.id} className="flex items-center gap-2">
                            {it.productImage && (
                              <img
                                src={it.productImage}
                                alt={it.productName}
                                className="w-6 h-6 rounded object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                              />
                            )}
                            <p className="truncate text-neutral-800 text-[11px]">
                              • {it.productName} <span className="font-bold text-neutral-900">({it.quantity}개)</span>
                              {it.isOnePlusOneBonus && <span className="text-rose-600 font-bold ml-1 text-[10px]">[1+1]</span>}
                            </p>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <strong className="text-neutral-900 text-xs block">{order.finalPaymentAmount.toLocaleString()}원</strong>
                      <span className="text-neutral-400 text-[10px]">
                        {order.paymentMethod === 'card'
                          ? '신용카드'
                          : order.paymentMethod === 'kakaopay'
                          ? '카카오페이'
                          : order.paymentMethod === 'naverpay'
                          ? '네이버페이'
                          : order.paymentMethod === 'tosspay'
                          ? '토스페이'
                          : '무통장/계좌이체'}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          order.status === 'paid'
                            ? 'bg-rose-100 text-rose-700'
                            : order.status === 'preparing'
                            ? 'bg-amber-100 text-amber-800'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-700'
                            : order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-700'
                            : order.status === 'cancelled'
                            ? 'bg-neutral-200 text-neutral-600'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {order.status === 'paid' && '결제완료 (발주대기)'}
                        {order.status === 'preparing' && '배송준비중 (발주완료)'}
                        {order.status === 'shipped' && '배송중'}
                        {order.status === 'delivered' && '배송완료'}
                        {order.status === 'cancelled' && '주문취소'}
                        {order.status === 'refund_requested' && '환불신청'}
                        {order.status === 'refunded' && '환불완료'}
                        {order.status === 'return_requested' && '반품신청'}
                        {order.status === 'returned' && '반품완료'}
                      </span>
                      {order.tracking?.trackingNumber && (
                        <span className="text-[10px] text-neutral-400 block font-mono mt-0.5">
                          {order.tracking.carrier} {order.tracking.trackingNumber}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer hover:bg-white focus:outline-rose-500"
                        >
                          <option value="paid">결제완료 (발주대기)</option>
                          <option value="preparing">배송준비중</option>
                          <option value="shipped">배송중</option>
                          <option value="delivered">배송완료</option>
                          <option value="cancelled">주문취소</option>
                          <option value="refund_requested">환불신청</option>
                          <option value="refunded">환불완료</option>
                        </select>
                        <button
                          onClick={() => {
                            if (confirm(`[${order.orderNumber}] 주문을 삭제하시겠습니까?\nSupabase DB에서도 영구 삭제됩니다.`)) {
                              deleteOrder(order.id);
                            }
                          }}
                          className="p-1 hover:bg-rose-50 rounded text-neutral-400 hover:text-rose-600 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 주문 상세 및 송장 등록 모달 */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-black text-base text-neutral-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-rose-600" />
                주문 상세 및 송장 등록
              </h3>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 bg-neutral-50 p-4 rounded-xl text-neutral-700">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-neutral-400 block text-[10px]">주문번호</span>
                  <strong className="font-mono text-neutral-900">{selectedOrder.orderNumber}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">주문일시</span>
                  <span>{selectedOrder.createdAt}</span>
                </div>
              </div>

              <div>
                <span className="text-neutral-400 block text-[10px]">수령인 및 배송지</span>
                <p className="font-bold text-neutral-900">{selectedOrder.receiverName} ({selectedOrder.receiverPhone})</p>
                <p className="text-[11px] text-neutral-600">{selectedOrder.shippingAddress} {selectedOrder.shippingDetailAddress}</p>
                {selectedOrder.shippingMemo && (
                  <p className="text-[10px] text-rose-600 mt-1">배송메모: {selectedOrder.shippingMemo}</p>
                )}
              </div>

              <div>
                <span className="text-neutral-400 block text-[10px] mb-1">주문 상품</span>
                <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-neutral-200">
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between">
                      <span className="text-[11px] font-medium">{it.productName} ({it.optionName || '기본'})</span>
                      <span className="font-bold text-neutral-900">{it.quantity}개 / {it.totalPrice.toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PG 결제 승인 상세 정보 */}
              <div className="pt-2 border-t border-neutral-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-neutral-900 text-[11px]">
                  <span>결제 정보 (토스페이먼츠 PG)</span>
                  <span className="text-rose-600 font-black text-sm">
                    {selectedOrder.finalPaymentAmount.toLocaleString()}원
                  </span>
                </div>
                <div className="text-[10px] text-neutral-500 space-y-0.5 font-mono">
                  {selectedOrder.paymentKey && (
                    <p>PG 거래키: {selectedOrder.paymentKey}</p>
                  )}
                  {selectedOrder.paymentDetails?.cardName && (
                    <p>카드사/수단: {selectedOrder.paymentDetails.cardName} {selectedOrder.paymentDetails.approveNo ? `(승인: ${selectedOrder.paymentDetails.approveNo})` : ''}</p>
                  )}
                  {selectedOrder.paymentDetails?.easyPayProvider && (
                    <p>간편결제: {selectedOrder.paymentDetails.easyPayProvider}</p>
                  )}
                  {selectedOrder.cancelReason && (
                    <p className="text-rose-600 font-bold">취소 사유: {selectedOrder.cancelReason}</p>
                  )}
                </div>
                {selectedOrder.paymentDetails?.receiptUrl && (
                  <div className="pt-1">
                    <a
                      href={selectedOrder.paymentDetails.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-bold underline"
                    >
                      <span>토스페이먼츠 전자영수증(매출전표) 보기</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* 배송 송장 번호 입력 */}
            <div className="space-y-2 p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl">
              <label className="font-bold text-rose-950 flex items-center gap-1.5 text-xs">
                <Truck className="w-4 h-4 text-rose-600" />
                배송 운송장 등록 (저장 시 Supabase 동기화)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                  className="bg-white border border-neutral-300 rounded-lg p-2 text-xs"
                >
                  <option value="CJ대한통운">CJ대한통운</option>
                  <option value="우체국택배">우체국택배</option>
                  <option value="한진택배">한진택배</option>
                  <option value="로젠택배">로젠택배</option>
                  <option value="롯데택배">롯데택배</option>
                </select>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="송장번호 숫자 입력"
                  className="col-span-2 bg-white border border-neutral-300 rounded-lg p-2 text-xs focus:outline-rose-500 font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2.5 border border-neutral-300 rounded-lg font-bold hover:bg-neutral-50 cursor-pointer"
              >
                닫기
              </button>

              {/* 결제 취소/환불 버튼 */}
              {(selectedOrder.status === 'paid' || selectedOrder.status === 'preparing') && (
                <button
                  type="button"
                  onClick={() => handleCancelOrderWithPg(selectedOrder)}
                  className="px-4 py-2.5 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  PG 결제 취소/환불
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveTracking}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                송장 저장 및 배송중 처리
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수기 신규 주문/발주 등록 모달 */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-black text-base text-neutral-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-600" />
                신규 수기 주문 및 발주 등록 (Supabase DB 저장)
              </h3>
              <button
                type="button"
                onClick={() => setIsNewOrderModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateNewOrder} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">발주 대상 상품 *</label>
                <select
                  value={newSelectedProdId}
                  onChange={(e) => setNewSelectedProdId(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs cursor-pointer focus:bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.price.toLocaleString()}원)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">주문 수량 (개) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProdQty}
                    onChange={(e) => setNewProdQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-bold focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">결제 수단</label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                  >
                    <option value="card">신용카드</option>
                    <option value="transfer">무통장입금/계좌이체</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">수령인 성명 *</label>
                  <input
                    type="text"
                    required
                    value={newReceiverName}
                    onChange={(e) => setNewReceiverName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">연락처 *</label>
                  <input
                    type="text"
                    required
                    value={newReceiverPhone}
                    onChange={(e) => setNewReceiverPhone(e.target.value)}
                    placeholder="010-1234-5678"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">기본 배송 주소 *</label>
                <input
                  type="text"
                  required
                  value={newShippingAddress}
                  onChange={(e) => setNewShippingAddress(e.target.value)}
                  placeholder="서울특별시 강남구 테헤란로 152"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">상세 주소</label>
                <input
                  type="text"
                  value={newShippingDetail}
                  onChange={(e) => setNewShippingDetail(e.target.value)}
                  placeholder="강남파이낸스센터 12층"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-300 rounded-lg font-bold hover:bg-neutral-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors shadow-sm"
                >
                  Supabase에 주문 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SQL 스키마 안내 모달 */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-black text-base text-neutral-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-rose-500" />
                Supabase Orders (주문/발주) 테이블 생성 SQL
              </h3>
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-neutral-600 leading-relaxed text-xs">
              Supabase Dashboard의 <strong>SQL Editor</strong>에서 아래 쿼리를 1회 실행하시면 <code className="bg-neutral-100 px-1 py-0.5 rounded text-rose-600 font-bold font-mono">public.orders</code> 테이블과 RLS 보안 정책이 자동 생성됩니다.
            </p>

            <div className="relative">
              <pre className="p-4 bg-neutral-900 text-neutral-100 rounded-xl font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed">
                {sqlCode}
              </pre>
              <button
                onClick={copySqlToClipboard}
                className="absolute top-2.5 right-2.5 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs transition-colors"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {isCopied ? '복사 완료!' : 'SQL 복사'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://supabase.com/dashboard/project/psblczhzozsuicstbefl/sql/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
              >
                Supabase SQL Editor 바로가기 <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 text-white rounded-xl font-bold hover:bg-neutral-900"
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
