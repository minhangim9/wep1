'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { Truck, Send, CheckCircle2, Package } from 'lucide-react';

export default function AdminDeliveryPage() {
  const { orders, updateOrderTracking, updateOrderStatus, showToast } = useShop();

  // 송장번호 입력 임시 상태 map
  const [trackingInputs, setTrackingInputs] = useState<Record<string, { carrier: string; number: string }>>({});

  const shippingTargetOrders = orders.filter(
    (o) => o.status === 'paid' || o.status === 'preparing' || o.status === 'shipped'
  );

  const handleCarrierChange = (orderId: string, carrier: string) => {
    setTrackingInputs((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], carrier, number: prev[orderId]?.number || '' },
    }));
  };

  const handleNumberChange = (orderId: string, number: string) => {
    setTrackingInputs((prev) => ({
      ...prev,
      [orderId]: { carrier: prev[orderId]?.carrier || 'CJ대한통운', number },
    }));
  };

  const handleRegisterTracking = (orderId: string) => {
    const data = trackingInputs[orderId];
    if (!data || !data.number.trim()) {
      showToast('송장번호를 입력해주세요.', 'error');
      return;
    }

    updateOrderTracking(orderId, data.carrier || 'CJ대한통운', data.number.trim());
  };

  return (
    <div className="space-y-6 text-xs">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-rose-600" />
            배송 & 운송장 관리
          </h1>
          <p className="text-neutral-500 mt-1">
            택배사 지정, 송장번호 입력 및 배송 상태를 실시간으로 업데이트합니다.
          </p>
        </div>
      </div>

      {/* 배송 대상 테이블 */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-neutral-200">
            <thead className="bg-neutral-50 text-neutral-500 font-bold">
              <tr>
                <th className="p-4">주문번호</th>
                <th className="p-4">수령인 / 주소</th>
                <th className="p-4">상품 요약</th>
                <th className="p-4">택배사 선택</th>
                <th className="p-4">운송장 번호</th>
                <th className="p-4 text-right">송장 등록 및 출고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
              {shippingTargetOrders.map((order) => {
                const currentCarrier = trackingInputs[order.id]?.carrier || order.tracking?.carrier || 'CJ대한통운';
                const currentNumber = trackingInputs[order.id]?.number !== undefined ? trackingInputs[order.id]?.number : order.tracking?.trackingNumber || '';

                return (
                  <tr key={order.id} className="hover:bg-neutral-50/50">
                    <td className="p-4 font-mono font-bold text-neutral-900">
                      {order.orderNumber}
                      <span className={`block text-[10px] font-bold ${
                        order.status === 'shipped' ? 'text-blue-600' : 'text-neutral-400'
                      }`}>
                        상태: {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <strong className="text-neutral-900 block">{order.receiverName} ({order.receiverPhone})</strong>
                      <span className="text-[11px] text-neutral-500 block truncate max-w-xs">
                        {order.shippingAddress} {order.shippingDetailAddress}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="truncate max-w-xs">
                        {order.items[0]?.productName} {order.items.length > 1 ? `외 ${order.items.length - 1}건` : ''}
                      </p>
                    </td>
                    <td className="p-4">
                      <select
                        value={currentCarrier}
                        onChange={(e) => handleCarrierChange(order.id, e.target.value)}
                        className="bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-xs cursor-pointer"
                      >
                        <option value="CJ대한통운">CJ대한통운</option>
                        <option value="우체국택배">우체국택배</option>
                        <option value="롯데택배">롯데택배</option>
                        <option value="한진택배">한진택배</option>
                        <option value="로젠택배">로젠택배</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        value={currentNumber}
                        onChange={(e) => handleNumberChange(order.id, e.target.value)}
                        placeholder="송장번호 숫자 입력"
                        className="bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-xs font-mono w-40"
                      />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRegisterTracking(order.id)}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" /> 송장출고
                        </button>
                        {order.status === 'shipped' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                          >
                            배송완료
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
