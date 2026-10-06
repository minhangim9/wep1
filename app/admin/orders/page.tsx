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
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, showToast } = useShop();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
    if (orders.length === 0) {
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
      `"${o.items.map((i) => `${i.productName}(${i.quantity})`).join(', ')}"`,
      o.finalPaymentAmount,
      o.status,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `다써바_발주서_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('발주서 CSV 파일이 다운로드되었습니다.', 'success');
  };

  // 결제완료 주문 전체를 배송준비중으로 일괄 변경
  const handleBatchPrepare = () => {
    const paidOrders = orders.filter((o) => o.status === 'paid');
    if (paidOrders.length === 0) {
      showToast('발주 처리할 결제완료 주문이 없습니다.', 'info');
      return;
    }

    paidOrders.forEach((o) => updateOrderStatus(o.id, 'preparing'));
    showToast(`총 ${paidOrders.length}건의 주문이 [배송준비중]으로 변경되었습니다.`, 'success');
  };

  return (
    <div className="space-y-6 text-xs">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-rose-600" />
            주문 & 발주 관리
          </h1>
          <p className="text-neutral-500 mt-1">
            신규 주문 접수 확인, 일괄 발주 처리 및 취소/환불을 승인합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBatchPrepare}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            결제완료 ➔ 일괄 배송준비 처리
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" /> 발주서 엑셀(CSV) 다운로드
          </button>
        </div>
      </div>

      {/* 필터 바 */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="주문번호, 수령인, 연락처 검색"
            className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-xs focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-600">상태 필터:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-xs font-semibold cursor-pointer"
          >
            <option value="all">전체 상태</option>
            <option value="paid">결제완료 (발주대기)</option>
            <option value="preparing">배송준비중</option>
            <option value="shipped">배송중</option>
            <option value="delivered">배송완료</option>
            <option value="cancelled">주문취소</option>
            <option value="refund_requested">환불신청</option>
          </select>
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
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50/50">
                  <td className="p-4">
                    <strong className="text-neutral-900 block font-mono">{order.orderNumber}</strong>
                    <span className="text-neutral-400 text-[11px]">{order.createdAt}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-neutral-900 block">{order.receiverName}</span>
                    <span className="text-neutral-400 text-[11px] font-mono">{order.receiverPhone}</span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-0.5 max-w-xs">
                      {order.items.map((it) => (
                        <p key={it.id} className="truncate">
                          • {it.productName} ({it.quantity}개)
                          {it.isOnePlusOneBonus && <span className="text-rose-600 font-bold ml-1">[1+1]</span>}
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <strong className="text-neutral-900 text-sm">{order.finalPaymentAmount.toLocaleString()}원</strong>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      order.status === 'paid'
                        ? 'bg-rose-100 text-rose-700'
                        : order.status === 'shipped'
                        ? 'bg-blue-100 text-blue-700'
                        : order.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                    >
                      <option value="paid">결제완료</option>
                      <option value="preparing">배송준비중</option>
                      <option value="shipped">배송중</option>
                      <option value="delivered">배송완료</option>
                      <option value="cancelled">주문취소</option>
                      <option value="refunded">환불완료</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
