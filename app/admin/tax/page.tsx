'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { TaxInvoice } from '@/types';
import { Receipt, CheckCircle2, XCircle, Printer, Download } from 'lucide-react';

export default function AdminTaxPage() {
  const { taxInvoices, updateTaxInvoiceStatus, showToast } = useShop();

  // 데모 세금명세서 신청 목록 (없을 경우 기본값 제공)
  const initialList: TaxInvoice[] = taxInvoices.length > 0 ? taxInvoices : [
    {
      id: 'tax-001',
      orderId: 'ord-001',
      orderNumber: 'ORD-20261006-894123',
      userId: 'user-001',
      userName: '홍길동',
      type: 'cash_receipt',
      taxNumber: '010-5555-1234',
      amount: 56000,
      status: 'issued',
      issuedAt: '2026-10-06 14:10',
      createdAt: '2026-10-06 14:00',
    },
    {
      id: 'tax-002',
      orderId: 'ord-002',
      orderNumber: 'ORD-20261006-992384',
      userId: 'user-002',
      userName: '김민지 (뷰티랩코리아)',
      type: 'tax_invoice',
      companyName: '(주)뷰티랩코리아',
      taxNumber: '214-88-12345',
      representativeName: '김민지',
      email: 'minji@beautylab.com',
      amount: 148000,
      status: 'requested',
      createdAt: '2026-10-06 15:20',
    },
  ];

  const [invoices, setInvoices] = useState<TaxInvoice[]>(initialList);

  const handleApprove = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: 'issued', issuedAt: new Date().toLocaleString() } : inv
      )
    );
    updateTaxInvoiceStatus(id, 'issued');
    showToast('전자세금명세서/현금영수증 발행이 승인 완료되었습니다.', 'success');
  };

  const handleReject = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: 'rejected' } : inv))
    );
    updateTaxInvoiceStatus(id, 'rejected');
    showToast('발행 신청이 반려되었습니다.', 'info');
  };

  return (
    <div className="space-y-6 text-xs">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-rose-600" />
            전자세금명세서 & 현금영수증 발급 관리
          </h1>
          <p className="text-neutral-500 mt-1">
            고객의 현금영수증 소득공제 및 사업자 전자세금계산서 신청 내역을 조회하고 승인 발급합니다.
          </p>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-neutral-200">
            <thead className="bg-neutral-50 text-neutral-500 font-bold">
              <tr>
                <th className="p-4">주문번호 / 신청일시</th>
                <th className="p-4">증빙 유형</th>
                <th className="p-4">신청자 (상호명)</th>
                <th className="p-4">식별번호 (사업자/휴대폰)</th>
                <th className="p-4">발행 금액</th>
                <th className="p-4">발행 상태</th>
                <th className="p-4 text-right">관리 액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-neutral-50/50">
                  <td className="p-4">
                    <strong className="text-neutral-900 block font-mono">{inv.orderNumber}</strong>
                    <span className="text-neutral-400 text-[11px]">{inv.createdAt}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.type === 'tax_invoice' ? 'bg-indigo-100 text-indigo-800' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {inv.type === 'tax_invoice' ? '전자세금계산서' : '현금영수증'}
                    </span>
                  </td>
                  <td className="p-4">
                    <strong className="text-neutral-900 block">{inv.companyName || inv.userName}</strong>
                    {inv.email && <span className="text-neutral-400 text-[11px]">{inv.email}</span>}
                  </td>
                  <td className="p-4 font-mono font-bold text-neutral-800">{inv.taxNumber}</td>
                  <td className="p-4">
                    <strong className="text-rose-600 font-bold">{inv.amount.toLocaleString()}원</strong>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.status === 'issued'
                        ? 'bg-emerald-100 text-emerald-800'
                        : inv.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {inv.status === 'issued' ? '발행완료' : inv.status === 'rejected' ? '반려됨' : '승인대기'}
                    </span>
                    {inv.issuedAt && (
                      <span className="text-[10px] text-neutral-400 block">{inv.issuedAt}</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {inv.status === 'requested' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleApprove(inv.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-[11px]"
                        >
                          발행 승인
                        </button>
                        <button
                          onClick={() => handleReject(inv.id)}
                          className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-bold px-3 py-1.5 rounded-lg text-[11px]"
                        >
                          반려
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => window.print()}
                        className="border border-neutral-300 hover:bg-neutral-100 text-neutral-700 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 ml-auto"
                      >
                        <Printer className="w-3.5 h-3.5" /> 명세서 인쇄
                      </button>
                    )}
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
