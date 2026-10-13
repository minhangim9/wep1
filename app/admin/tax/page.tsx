'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { TaxInvoice, TaxInvoiceItem, Order } from '@/types';
import { calculateTaxInvoiceItemsFromOrder } from '@/lib/supabase';
import {
  Receipt,
  CheckCircle2,
  XCircle,
  Printer,
  Download,
  Plus,
  RefreshCw,
  Database,
  Copy,
  Check,
  X,
  FileText,
  Search,
  Building,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function AdminTaxPage() {
  const {
    orders,
    taxInvoices,
    isLoadingTaxInvoices,
    refreshTaxInvoices,
    requestTaxInvoice,
    updateTaxInvoiceStatus,
    syncAllTaxInvoicesToSupabase,
    showToast,
  } = useShop();

  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'requested' | 'issued' | 'rejected'>('all');

  // 세금명세서 출력 및 상세 보기 모달 상태
  const [selectedInvoice, setSelectedInvoice] = useState<TaxInvoice | null>(null);

  // 신규 세금명세서 발행 신청 모달 상태
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [newType, setNewType] = useState<'tax_invoice' | 'cash_receipt'>('tax_invoice');
  const [newCompanyName, setNewCompanyName] = useState('(주)피우다파트너스');
  const [newTaxNumber, setNewTaxNumber] = useState('120-88-99231');
  const [newRepName, setNewRepName] = useState('홍길동');
  const [newEmail, setNewEmail] = useState('partner@example.com');
  const [newAddress, setNewAddress] = useState('서울특별시 강남구 테헤란로 152');
  const [newBizType, setNewBizType] = useState('도소매 / 전자상거래');
  const [newBizCategory, setNewBizCategory] = useState('화장품 및 미용용품');

  // Supabase SQL 가이드 모달 상태
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // 선택된 주문으로부터 품목/규격/공급가액/세액 실시간 계산
  const targetOrder = orders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId);
  const calculatedItems = targetOrder
    ? calculateTaxInvoiceItemsFromOrder(targetOrder)
    : { items: [], supplyAmount: 0, vatAmount: 0, totalAmount: 0 };

  // 통계 계산
  const totalInvoices = taxInvoices.length;
  const requestedCount = taxInvoices.filter((t) => t.status === 'requested').length;
  const issuedCount = taxInvoices.filter((t) => t.status === 'issued').length;
  const totalAmountIssued = taxInvoices
    .filter((t) => t.status === 'issued')
    .reduce((acc, t) => acc + t.amount, 0);

  // 필터링 적용된 목록
  const filteredInvoices = taxInvoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        inv.orderNumber.toLowerCase().includes(q) ||
        (inv.companyName && inv.companyName.toLowerCase().includes(q)) ||
        inv.userName.toLowerCase().includes(q) ||
        inv.taxNumber.includes(q)
      );
    }
    return true;
  });

  const handleCreateTaxInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetOrder) {
      showToast('발행할 주문을 선택해주세요.', 'error');
      return;
    }

    if (!newTaxNumber.trim()) {
      showToast('사업자등록번호 또는 휴대폰번호를 입력해주세요.', 'error');
      return;
    }

    await requestTaxInvoice(targetOrder.id, {
      orderNumber: targetOrder.orderNumber,
      userId: targetOrder.userId,
      userName: targetOrder.userName,
      type: newType,
      companyName: newCompanyName.trim(),
      taxNumber: newTaxNumber.trim(),
      representativeName: newRepName.trim(),
      email: newEmail.trim(),
      address: newAddress.trim(),
      businessType: newBizType.trim(),
      businessCategory: newBizCategory.trim(),
      supplyAmount: calculatedItems.supplyAmount,
      vatAmount: calculatedItems.vatAmount,
      amount: calculatedItems.totalAmount,
      items: calculatedItems.items,
      remarks: `${targetOrder.orderNumber} 결제 세금계산서`,
    });

    setIsNewModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const sqlScript = `-- ==========================================
-- tax_invoices (세금계산서 및 거래명세서) 테이블 생성 스크립트
-- ==========================================
CREATE TABLE IF NOT EXISTS public.tax_invoices (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    order_number TEXT NOT NULL,
    user_id TEXT NOT NULL DEFAULT '',
    user_name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'tax_invoice' CHECK (type IN ('cash_receipt', 'tax_invoice')),
    company_name TEXT DEFAULT '',
    tax_number TEXT NOT NULL,
    representative_name TEXT DEFAULT '',
    email TEXT DEFAULT '',
    address TEXT DEFAULT '',
    business_type TEXT DEFAULT '',
    business_category TEXT DEFAULT '',
    supply_amount INTEGER NOT NULL DEFAULT 0,
    vat_amount INTEGER NOT NULL DEFAULT 0,
    amount INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'issued', 'rejected')),
    items JSONB DEFAULT '[]'::jsonb,
    issued_at TIMESTAMP WITH TIME ZONE,
    remarks TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tax_invoices_order_number ON public.tax_invoices (order_number);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_tax_number ON public.tax_invoices (tax_number);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_status ON public.tax_invoices (status);

ALTER TABLE public.tax_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on tax_invoices" ON public.tax_invoices;
CREATE POLICY "Allow public read on tax_invoices" ON public.tax_invoices FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on tax_invoices" ON public.tax_invoices;
CREATE POLICY "Allow public insert on tax_invoices" ON public.tax_invoices FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on tax_invoices" ON public.tax_invoices;
CREATE POLICY "Allow public update on tax_invoices" ON public.tax_invoices FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on tax_invoices" ON public.tax_invoices;
CREATE POLICY "Allow public delete on tax_invoices" ON public.tax_invoices FOR DELETE USING (true);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setIsCopied(true);
    showToast('SQL 스크립트가 클립보드에 복사되었습니다!', 'success');
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-6 text-xs">
      {/* 1. 상단 헤더 & Supabase DB 연동 상태 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-rose-600" />
              전자세금명세서 &amp; 현금영수증 발급 관리
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Supabase tax_invoices 실시간 연동
            </span>
          </div>
          <p className="text-neutral-500 mt-1">
            Supabase에 저장된 실제 주문 상품의 품목, 규격, 공급가액, 세액(10%)을 자동으로 계산하여 국세청 표준 전자세금계산서 및 거래명세표로 출력합니다.
          </p>
        </div>

        {/* 액션 버튼 그룹 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* DB 새로고침 */}
          <button
            onClick={() => refreshTaxInvoices()}
            disabled={isLoadingTaxInvoices}
            className="bg-white hover:bg-neutral-50 text-neutral-700 font-bold px-3 py-2 rounded-xl border border-neutral-300 transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            title="Supabase에서 최신 세금명세서 목록 동기화"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTaxInvoices ? 'animate-spin text-rose-600' : ''}`} />
            {isLoadingTaxInvoices ? '동기화 중...' : 'DB 새로고침'}
          </button>

          {/* 기존 데이터 Supabase 동기화 */}
          <button
            onClick={() => syncAllTaxInvoicesToSupabase()}
            disabled={isLoadingTaxInvoices}
            className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            title="현재 세금명세서 데이터를 Supabase tax_invoices 테이블에 일괄 저장"
          >
            <Receipt className="w-3.5 h-3.5 text-rose-400" />
            초기 세금명세서 DB 동기화
          </button>

          {/* Supabase SQL 스크립트 모달 열기 */}
          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-2 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Database className="w-3.5 h-3.5" />
            Supabase SQL 가이드
          </button>

          {/* 신규 세금명세서 발급 버튼 */}
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> 세금명세서 신규 발행
          </button>
        </div>
      </div>

      {/* 2. 통계 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-neutral-500 block">총 발행/신청 건수</span>
          <p className="text-xl font-black mt-1 text-neutral-900">{totalInvoices}건</p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-amber-600 block">발행 승인 대기</span>
          <p className="text-xl font-black mt-1 text-amber-600">{requestedCount}건</p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 block">발행 승인 완료</span>
          <p className="text-xl font-black mt-1 text-emerald-600">{issuedCount}건</p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-rose-600 block">발행 완료 누적액</span>
          <p className="text-xl font-black mt-1 text-rose-600">₩{totalAmountIssued.toLocaleString()}</p>
        </div>
      </div>

      {/* 3. 툴바 & 필터 */}
      <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap text-xs ${
              statusFilter === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            전체 ({totalInvoices})
          </button>
          <button
            onClick={() => setStatusFilter('requested')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap text-xs ${
              statusFilter === 'requested' ? 'bg-amber-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            승인대기 ({requestedCount})
          </button>
          <button
            onClick={() => setStatusFilter('issued')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap text-xs ${
              statusFilter === 'issued' ? 'bg-emerald-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            발행완료 ({issuedCount})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap text-xs ${
              statusFilter === 'rejected' ? 'bg-rose-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            반려
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="주문번호, 상호명, 사업자번호 검색"
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

      {/* 4. 세금명세서 목록 테이블 */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-neutral-200">
            <thead className="bg-neutral-50 text-neutral-500 font-bold">
              <tr>
                <th className="p-4">주문번호 / 신청일시</th>
                <th className="p-4">증빙 유형</th>
                <th className="p-4">신청자 (상호 / 대표)</th>
                <th className="p-4">식별번호 (사업자/휴대폰)</th>
                <th className="p-4">공급가액 / 세액(VAT)</th>
                <th className="p-4">총 발행 금액</th>
                <th className="p-4">발행 상태</th>
                <th className="p-4 text-right">명세서 인쇄 &amp; 관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-neutral-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    등록된 세금명세서 또는 영수증 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const supply = inv.supplyAmount ?? Math.floor(inv.amount / 1.1);
                  const vat = inv.vatAmount ?? (inv.amount - supply);

                  return (
                    <tr key={inv.id} className="hover:bg-neutral-50/50">
                      <td className="p-4">
                        <strong className="text-neutral-900 block font-mono">{inv.orderNumber}</strong>
                        <span className="text-neutral-400 text-[11px]">{inv.createdAt}</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.type === 'tax_invoice'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {inv.type === 'tax_invoice' ? '전자세금계산서' : '현금영수증'}
                        </span>
                      </td>
                      <td className="p-4">
                        <strong className="text-neutral-900 block">{inv.companyName || inv.userName}</strong>
                        {inv.representativeName && (
                          <span className="text-neutral-400 text-[11px]">대표: {inv.representativeName}</span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-bold text-neutral-800">{inv.taxNumber}</td>
                      <td className="p-4 font-mono">
                        <div className="text-neutral-700">₩{supply.toLocaleString()}</div>
                        <div className="text-[10px] text-neutral-400">VAT ₩{vat.toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <strong className="text-rose-600 font-bold text-sm">₩{inv.amount.toLocaleString()}</strong>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.status === 'issued'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.status === 'issued' ? '발행완료' : inv.status === 'rejected' ? '반려됨' : '승인대기'}
                        </span>
                        {inv.issuedAt && (
                          <span className="text-[10px] text-neutral-400 block mt-0.5 font-mono">{inv.issuedAt}</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 세금명세서 출력 모달 열기 */}
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="bg-neutral-900 hover:bg-neutral-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                            title="국세청 표준 세금계산서/명세표 양식 확인 및 인쇄"
                          >
                            <Printer className="w-3.5 h-3.5 text-rose-400" />
                            명세서 출력
                          </button>

                          {inv.status === 'requested' && (
                            <>
                              <button
                                onClick={() => updateTaxInvoiceStatus(inv.id, 'issued')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs"
                                title="발행 승인 (Supabase 저장)"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => updateTaxInvoiceStatus(inv.id, 'rejected')}
                                className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-bold px-2.5 py-1.5 rounded-lg text-xs"
                                title="반려"
                              >
                                반려
                              </button>
                            </>
                          )}
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

      {/* 5. [세금명세서 / 전자세금계산서 출력 (Print)] 모달 */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-neutral-300 overflow-hidden flex flex-col my-8">
            {/* 상단 툴바 (인쇄 시 숨김) */}
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-base text-neutral-900">
                  {selectedInvoice.type === 'tax_invoice' ? '전자세금계산서 / 거래명세표' : '현금영수증 매출전표'}
                </h3>
                <span className="text-xs text-neutral-500 font-mono">({selectedInvoice.orderNumber})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" /> 지금 인쇄하기 (Print)
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 rounded-xl hover:bg-neutral-200 text-neutral-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 인쇄 대상 본문 (국세청 표준 세금계산서 양식) */}
            <div id="printable-tax-invoice" className="p-8 text-neutral-900 bg-white font-sans text-xs space-y-6">
              {/* 타이틀 및 발행 번호 */}
              <div className="text-center border-b-2 border-neutral-900 pb-4 relative">
                <h2 className="text-2xl font-black tracking-widest text-neutral-900 uppercase">
                  {selectedInvoice.type === 'tax_invoice' ? '전 자 세 금 계 산 서' : '현 금 영 수 증 (소득공제용)'}
                </h2>
                <span className="text-[11px] text-neutral-500 block mt-1">
                  (공급받는자 보관용 / 국세청 표준 전자신고 양식)
                </span>
                <span className="absolute right-0 bottom-2 text-[10px] font-mono text-neutral-400">
                  승인번호: {selectedInvoice.id}
                </span>
              </div>

              {/* 공급자 & 공급받는 자 정보 테이블 */}
              <div className="grid grid-cols-2 border-2 border-neutral-900 divide-x-2 divide-neutral-900">
                {/* 공급자 (피우다) */}
                <div className="p-3 space-y-1.5 bg-rose-50/20 relative">
                  <div className="flex items-center justify-between border-b border-neutral-300 pb-1 font-bold text-rose-800">
                    <span>공 급 자</span>
                    <span className="text-[10px] text-neutral-400 font-normal">등록번호: 120-88-01928</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-neutral-500 font-bold">상호 (법인명)</span>
                    <span className="col-span-2 font-bold">아빠사랑 피우다 (Piuda)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-neutral-500 font-bold">성명 (대표자)</span>
                    <span className="col-span-2 font-bold flex items-center gap-1">
                      김아빠
                      <span className="inline-block border border-rose-600 text-rose-600 rounded-full px-1 text-[9px] font-serif">
                        (인)
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-neutral-500 font-bold">사업장 주소</span>
                    <span className="col-span-2">서울특별시 강남구 테헤란로 152 강남파이낸스센터 12층</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-neutral-500 font-bold">업태 / 종목</span>
                    <span className="col-span-2">도소매, 전자상거래 / 화장품 및 뷰티케어</span>
                  </div>
                </div>

                {/* 공급받는 자 (고객/거래처) */}
                <div className="p-3 space-y-1.5 bg-blue-50/20">
                  <div className="flex items-center justify-between border-b border-neutral-300 pb-1 font-bold text-blue-900">
                    <span>공급받는 자</span>
                    <span className="text-[10px] text-neutral-500 font-mono font-bold">
                      등록번호: {selectedInvoice.taxNumber}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-neutral-500 font-bold">상호 / 성명</span>
                    <span className="col-span-2 font-bold">
                      {selectedInvoice.companyName || selectedInvoice.userName}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-neutral-500 font-bold">대표자 / 담당</span>
                    <span className="col-span-2">
                      {selectedInvoice.representativeName || selectedInvoice.userName}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-neutral-500 font-bold">사업장 / 주소</span>
                    <span className="col-span-2">
                      {selectedInvoice.address || '고객 주문서 배송지 주소 참조'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-neutral-500 font-bold">이메일</span>
                    <span className="col-span-2 font-mono">
                      {selectedInvoice.email || '미기재'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 금액 합계 바 */}
              <div className="border border-neutral-900 grid grid-cols-4 text-center font-bold divide-x divide-neutral-900 bg-neutral-100 py-2">
                <div>
                  <span className="text-[10px] text-neutral-500 block">작성일자</span>
                  <span className="font-mono text-sm">{selectedInvoice.createdAt.slice(0, 10)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">공급가액 (VAT 제외)</span>
                  <span className="font-mono text-sm text-neutral-900">
                    ₩{(selectedInvoice.supplyAmount ?? Math.floor(selectedInvoice.amount / 1.1)).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">세액 (VAT 10%)</span>
                  <span className="font-mono text-sm text-neutral-900">
                    ₩{(selectedInvoice.vatAmount ?? (selectedInvoice.amount - Math.floor(selectedInvoice.amount / 1.1))).toLocaleString()}
                  </span>
                </div>
                <div className="bg-rose-50 text-rose-900">
                  <span className="text-[10px] text-rose-600 block">총 합계금액</span>
                  <span className="font-mono text-base font-black text-rose-600">
                    ₩{selectedInvoice.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 품목 / 규격 / 수량 / 단가 / 공급가액 / 세액 상세 테이블 */}
              <div className="border border-neutral-900 overflow-hidden">
                <table className="w-full text-left divide-y divide-neutral-300">
                  <thead className="bg-neutral-100 text-neutral-700 font-bold text-center">
                    <tr className="divide-x divide-neutral-300">
                      <th className="p-2 w-16">월 / 일</th>
                      <th className="p-2">품목명 (Supabase 동기화)</th>
                      <th className="p-2 w-36">규격 (옵션/용량)</th>
                      <th className="p-2 w-16">수량</th>
                      <th className="p-2 w-24 text-right">단가</th>
                      <th className="p-2 w-28 text-right">공급가액</th>
                      <th className="p-2 w-24 text-right">세액</th>
                      <th className="p-2 w-20">비고</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 font-medium">
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((item, idx) => (
                        <tr key={idx} className="divide-x divide-neutral-200">
                          <td className="p-2 text-center font-mono">{selectedInvoice.createdAt.slice(5, 10)}</td>
                          <td className="p-2 font-bold">{item.name}</td>
                          <td className="p-2 text-neutral-600 text-[11px]">{item.spec || '-'}</td>
                          <td className="p-2 text-center font-mono font-bold">{item.quantity}</td>
                          <td className="p-2 text-right font-mono">₩{item.unitPrice.toLocaleString()}</td>
                          <td className="p-2 text-right font-mono font-bold">₩{item.supplyAmount.toLocaleString()}</td>
                          <td className="p-2 text-right font-mono text-neutral-600">₩{item.vatAmount.toLocaleString()}</td>
                          <td className="p-2 text-center text-[10px] text-neutral-400">{item.remarks || ''}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="divide-x divide-neutral-200">
                        <td className="p-2 text-center font-mono">{selectedInvoice.createdAt.slice(5, 10)}</td>
                        <td className="p-2 font-bold">화장품 및 스킨케어 세트</td>
                        <td className="p-2 text-neutral-600">본품 세트</td>
                        <td className="p-2 text-center font-mono">1</td>
                        <td className="p-2 text-right font-mono">
                          ₩{Math.floor(selectedInvoice.amount / 1.1).toLocaleString()}
                        </td>
                        <td className="p-2 text-right font-mono font-bold">
                          ₩{Math.floor(selectedInvoice.amount / 1.1).toLocaleString()}
                        </td>
                        <td className="p-2 text-right font-mono text-neutral-600">
                          ₩{(selectedInvoice.amount - Math.floor(selectedInvoice.amount / 1.1)).toLocaleString()}
                        </td>
                        <td className="p-2 text-center text-[10px] text-neutral-400">-</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* 하단 청구 및 영수 서명란 */}
              <div className="border border-neutral-900 p-3 flex items-center justify-between bg-neutral-50 text-xs font-bold">
                <span>
                  합계금액 (일금 {selectedInvoice.amount.toLocaleString()}원정)
                </span>
                <span className="text-neutral-700">
                  위 금액을 정히 <strong className="text-rose-600 underline">[영수(청구)]</strong> 함.
                </span>
              </div>
            </div>

            {/* 모달 닫기 버튼 (인쇄 시 숨김) */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between print:hidden">
              <span className="text-[11px] text-neutral-500">
                * [지금 인쇄하기]를 누르면 A4 규격에 최적화된 국세청 표준 양식으로 바로 인쇄됩니다.
              </span>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2 rounded-xl bg-neutral-900 text-white font-bold hover:bg-neutral-800 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. [신규 세금명세서 발행 신청] 모달 */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-neutral-200 my-8">
            <h3 className="font-black text-base text-neutral-900 mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-600" />
              세금명세서 신규 발행 (Supabase 주문 데이터 기반 자동계산)
            </h3>
            <form onSubmit={handleCreateTaxInvoice} className="space-y-4">
              {/* 주문 선택 */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  대상 주문 선택 (Supabase orders 테이블)
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-bold focus:bg-white focus:border-rose-600 focus:outline-none cursor-pointer"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      [{o.orderNumber}] {o.userName} - ₩{o.finalPaymentAmount.toLocaleString()} ({o.items[0]?.productName || '상품'} 외)
                    </option>
                  ))}
                </select>
              </div>

              {/* 계산된 품목 미리보기 */}
              {targetOrder && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 space-y-2">
                  <span className="text-[11px] font-bold text-neutral-500 block">
                    자동 계산된 품목 및 공급가액 명세
                  </span>
                  <div className="space-y-1">
                    {calculatedItems.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] font-medium text-neutral-700">
                        <span className="truncate max-w-xs">
                          {it.name} ({it.spec}) x {it.quantity}개
                        </span>
                        <span className="font-mono">
                          공급가 ₩{it.supplyAmount.toLocaleString()} (세액 ₩{it.vatAmount.toLocaleString()})
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-xs">
                    <span>합계 금액:</span>
                    <span className="text-rose-600 font-mono font-black">
                      ₩{calculatedItems.totalAmount.toLocaleString()} (공급가: ₩{calculatedItems.supplyAmount.toLocaleString()} + VAT: ₩{calculatedItems.vatAmount.toLocaleString()})
                    </span>
                  </div>
                </div>
              )}

              {/* 증빙 유형 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">증빙 유형</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:border-rose-600 focus:outline-none cursor-pointer"
                  >
                    <option value="tax_invoice">전자세금계산서 (사업자용)</option>
                    <option value="cash_receipt">현금영수증 (소득공제/지출증빙)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {newType === 'tax_invoice' ? '사업자등록번호' : '휴대폰번호 / 식별번호'}
                  </label>
                  <input
                    type="text"
                    value={newTaxNumber}
                    onChange={(e) => setNewTaxNumber(e.target.value)}
                    placeholder="예: 120-88-12345"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-mono focus:bg-white focus:border-rose-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* 상호 & 대표자 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">상호명 (법인명)</label>
                  <input
                    type="text"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="예: (주)뷰티랩코리아"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:border-rose-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">대표자 성명</label>
                  <input
                    type="text"
                    value={newRepName}
                    onChange={(e) => setNewRepName(e.target.value)}
                    placeholder="예: 김민지"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:border-rose-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* 이메일 & 주소 */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">전자세금계산서 수신 이메일</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="tax@partner.com"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-mono focus:bg-white focus:border-rose-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">사업장 주소</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:border-rose-600 focus:outline-none"
                />
              </div>

              {/* 업태 & 종목 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">업태</label>
                  <input
                    type="text"
                    value={newBizType}
                    onChange={(e) => setNewBizType(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:border-rose-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">종목</label>
                  <input
                    type="text"
                    value={newBizCategory}
                    onChange={(e) => setNewBizCategory(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:border-rose-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 font-bold hover:bg-neutral-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" /> Supabase DB 발급 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Supabase SQL DDL 가이드 모달 */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-base text-neutral-900">Supabase tax_invoices 테이블 DDL 스크립트</h3>
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
                접속하여 아래 스크립트를 실행하시면 <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono font-bold">tax_invoices</code> 테이블이 즉시 생성됩니다.
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
                실행 후 테이블이 생성되면 전자세금명세서 발행 및 품목 계산 내역이 실시간으로 동기화됩니다.
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
