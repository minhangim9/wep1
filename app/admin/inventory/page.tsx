'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { RawMaterial } from '@/types';
import {
  Boxes,
  Plus,
  Minus,
  AlertTriangle,
  Search,
  CheckCircle2,
  RefreshCw,
  Database,
  Copy,
  Check,
  X,
  Package,
  Layers,
  TrendingDown,
  DollarSign
} from 'lucide-react';

export default function AdminInventoryPage() {
  const {
    products,
    rawMaterials,
    isLoadingMaterials,
    refreshRawMaterials,
    syncAllMaterialsToSupabase,
    updateProduct,
    updateMaterialStock,
    addRawMaterial,
    showToast,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'materials' | 'products'>('materials');
  const [isNewMatModalOpen, setIsNewMatModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // 신규 자재 등록 상태
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<RawMaterial['type']>('용기(Bottle)');
  const [currentStock, setCurrentStock] = useState(1000);
  const [safetyStock, setSafetyStock] = useState(200);
  const [unitCost, setUnitCost] = useState(500);
  const [supplier, setSupplier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Supabase SQL 가이드 모달 상태
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // 원부자재 통계 계산
  const totalMaterialCount = rawMaterials.length;
  const totalStockQuantity = rawMaterials.reduce((acc, m) => acc + m.currentStock, 0);
  const lowStockCount = rawMaterials.filter((m) => m.currentStock <= m.safetyStock).length;
  const totalValuation = rawMaterials.reduce((acc, m) => acc + m.currentStock * m.unitCost, 0);

  // 필터링 적용된 원부자재 목록
  const filteredMaterials = rawMaterials.filter((mat) => {
    if (selectedType !== 'all' && mat.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        mat.name.toLowerCase().includes(q) ||
        mat.code.toLowerCase().includes(q) ||
        mat.supplier.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      showToast('자재 코드와 이름을 입력해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addRawMaterial({
        code: code.trim(),
        name: name.trim(),
        type,
        currentStock,
        safetyStock,
        unitCost,
        supplier: supplier.trim() || '자체생산',
      });

      setIsNewMatModalOpen(false);
      setCode('');
      setName('');
      setSupplier('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sqlScript = `-- ==========================================
-- raw_materials (원부자재 및 재고 관리) 테이블 생성 스크립트
-- ==========================================
CREATE TABLE IF NOT EXISTS public.raw_materials (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT '용기(Bottle)',
    current_stock INTEGER NOT NULL DEFAULT 0,
    safety_stock INTEGER NOT NULL DEFAULT 0,
    unit_cost INTEGER NOT NULL DEFAULT 0,
    supplier TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_raw_materials_code ON public.raw_materials (code);
CREATE INDEX IF NOT EXISTS idx_raw_materials_type ON public.raw_materials (type);

ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on raw_materials" ON public.raw_materials;
CREATE POLICY "Allow public read on raw_materials" ON public.raw_materials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on raw_materials" ON public.raw_materials;
CREATE POLICY "Allow public insert on raw_materials" ON public.raw_materials FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on raw_materials" ON public.raw_materials;
CREATE POLICY "Allow public update on raw_materials" ON public.raw_materials FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on raw_materials" ON public.raw_materials;
CREATE POLICY "Allow public delete on raw_materials" ON public.raw_materials FOR DELETE USING (true);`;

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
              <Boxes className="w-6 h-6 text-rose-600" />
              재고 및 원부자재 관리
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Supabase raw_materials 테이블 연동
            </span>
          </div>
          <p className="text-neutral-500 mt-1">
            화장품 완제품 재고와 유리 용기, 스포이드 캡, 친환경 단상자, 원료 입출고 데이터가 Supabase DB에 실시간 저장됩니다.
          </p>
        </div>

        {/* 액션 버튼 그룹 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* DB 새로고침 */}
          <button
            onClick={() => refreshRawMaterials()}
            disabled={isLoadingMaterials}
            className="bg-white hover:bg-neutral-50 text-neutral-700 font-bold px-3 py-2 rounded-xl border border-neutral-300 transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            title="Supabase에서 최신 원부자재 목록 동기화"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMaterials ? 'animate-spin text-rose-600' : ''}`} />
            {isLoadingMaterials ? '동기화 중...' : 'DB 새로고침'}
          </button>

          {/* 기존 원부자재 데이터 Supabase 동기화 */}
          <button
            onClick={() => syncAllMaterialsToSupabase()}
            disabled={isLoadingMaterials}
            className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            title="현재 원부자재 데이터를 Supabase raw_materials 테이블에 일괄 저장"
          >
            <Boxes className="w-3.5 h-3.5 text-rose-400" />
            초기 원부자재 DB 동기화
          </button>

          {/* Supabase SQL 스크립트 모달 열기 */}
          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-2 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Database className="w-3.5 h-3.5" />
            Supabase SQL 가이드
          </button>

          {activeTab === 'materials' && (
            <button
              onClick={() => setIsNewMatModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> 신규 원부자재 등록
            </button>
          )}
        </div>
      </div>

      {/* 2. 자재 통계 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold">등록 자재 품목</span>
            <Layers className="w-4 h-4" />
          </div>
          <p className="text-xl font-black mt-1 text-neutral-900">{totalMaterialCount}종</p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold">총 재고 수량</span>
            <Package className="w-4 h-4" />
          </div>
          <p className="text-xl font-black mt-1 text-neutral-900">{totalStockQuantity.toLocaleString()}개</p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold">안전재고 미달 품목</span>
            <TrendingDown className={`w-4 h-4 ${lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
          </div>
          <p className={`text-xl font-black mt-1 ${lowStockCount > 0 ? 'text-rose-600' : 'text-neutral-900'}`}>
            {lowStockCount}개
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold">자재 자산 평가액</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black mt-1 text-emerald-600">₩{totalValuation.toLocaleString()}</p>
        </div>
      </div>

      {/* 3. 탭 전환 */}
      <div className="flex border-b border-neutral-200 text-xs font-bold text-center">
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex-1 py-3 border-b-2 transition-colors ${
            activeTab === 'materials'
              ? 'border-neutral-900 text-neutral-900 bg-white'
              : 'border-transparent text-neutral-400 bg-neutral-50'
          }`}
        >
          원부자재 (용기/캡/단상자/원료) 재고 (Supabase 실시간 연동)
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-3 border-b-2 transition-colors ${
            activeTab === 'products'
              ? 'border-neutral-900 text-neutral-900 bg-white'
              : 'border-transparent text-neutral-400 bg-neutral-50'
          }`}
        >
          완제품 화장품 옵션별 재고 현황
        </button>
      </div>

      {activeTab === 'materials' ? (
        <div className="space-y-4">
          {/* 검색 및 유형 필터 */}
          <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['all', '용기(Bottle)', '펌프/캡(Cap)', '단상자(Box)', '라벨(Label)', '원료(Formula)', '완충재(Pack)'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap text-xs ${
                    selectedType === t ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {t === 'all' ? '전체 자재' : t}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="자재명, 코드, 공급처 검색"
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

          {/* 원부자재 테이블 */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left divide-y divide-neutral-200">
                <thead className="bg-neutral-50 text-neutral-500 font-bold">
                  <tr>
                    <th className="p-4">자재 코드 / 명칭</th>
                    <th className="p-4">자재 유형</th>
                    <th className="p-4">단가</th>
                    <th className="p-4">현재 재고</th>
                    <th className="p-4">안전 재고</th>
                    <th className="p-4">공급업체</th>
                    <th className="p-4 text-right">입출고 수량 조절 (Supabase 즉시 저장)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                  {filteredMaterials.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-neutral-400">
                        <Boxes className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        일치하는 원부자재 내역이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map((mat) => {
                      const isLow = mat.currentStock <= mat.safetyStock;

                      return (
                        <tr key={mat.id} className="hover:bg-neutral-50/50">
                          <td className="p-4">
                            <strong className="text-neutral-900 block">{mat.name}</strong>
                            <span className="text-neutral-400 font-mono text-[11px]">{mat.code}</span>
                          </td>
                          <td className="p-4">
                            <span className="bg-neutral-100 px-2 py-0.5 rounded text-[11px] font-bold">
                              {mat.type}
                            </span>
                          </td>
                          <td className="p-4">{mat.unitCost.toLocaleString()}원</td>
                          <td className="p-4">
                            <span className={`font-black text-sm ${isLow ? 'text-rose-600' : 'text-neutral-900'}`}>
                              {mat.currentStock.toLocaleString()}
                            </span>
                            {isLow && (
                              <span className="text-[10px] text-rose-500 font-bold block flex items-center gap-0.5 mt-0.5">
                                <AlertTriangle className="w-3 h-3" /> 안전재고 미달
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-neutral-500">{mat.safetyStock.toLocaleString()}</td>
                          <td className="p-4 text-neutral-600">{mat.supplier}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => updateMaterialStock(mat.id, -100)}
                                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2 py-1 rounded text-xs font-bold transition-colors"
                                title="100개 출고 (Supabase 저장)"
                              >
                                -100
                              </button>
                              <button
                                onClick={() => updateMaterialStock(mat.id, -10)}
                                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2 py-1 rounded text-xs font-bold transition-colors"
                                title="10개 출고 (Supabase 저장)"
                              >
                                -10
                              </button>
                              <button
                                onClick={() => updateMaterialStock(mat.id, 50)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs font-bold transition-colors"
                                title="50개 입고 (Supabase 저장)"
                              >
                                +50
                              </button>
                              <button
                                onClick={() => updateMaterialStock(mat.id, 500)}
                                className="bg-rose-600 hover:bg-rose-500 text-white px-2 py-1 rounded text-xs font-bold shadow-xs transition-colors"
                                title="500개 대량 입고 (Supabase 저장)"
                              >
                                +500
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
        </div>
      ) : (
        /* 완제품 재고 테이블 */
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-neutral-200">
              <thead className="bg-neutral-50 text-neutral-500 font-bold">
                <tr>
                  <th className="p-4">완제품명</th>
                  <th className="p-4">옵션명</th>
                  <th className="p-4">현재고</th>
                  <th className="p-4">안전재고</th>
                  <th className="p-4 text-right">재고 입출고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                {products.map((prod) => (
                  <React.Fragment key={prod.id}>
                    {prod.options.map((opt) => (
                      <tr key={opt.id} className="hover:bg-neutral-50/50">
                        <td className="p-4 font-bold text-neutral-900">{prod.name}</td>
                        <td className="p-4 text-neutral-600">{opt.name}</td>
                        <td className="p-4">
                          <strong className="text-sm font-black text-neutral-900">{opt.stockQuantity}개</strong>
                        </td>
                        <td className="p-4 text-neutral-500">{prod.safetyStock}개</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                const newOpts = prod.options.map((o) =>
                                  o.id === opt.id ? { ...o, stockQuantity: Math.max(0, o.stockQuantity - 10) } : o
                                );
                                updateProduct(prod.id, { options: newOpts });
                                showToast(`${prod.name} 재고가 10개 감소했습니다.`, 'info');
                              }}
                              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2 py-1 rounded text-xs font-bold"
                            >
                              -10
                            </button>
                            <button
                              onClick={() => {
                                const newOpts = prod.options.map((o) =>
                                  o.id === opt.id ? { ...o, stockQuantity: o.stockQuantity + 50 } : o
                                );
                                updateProduct(prod.id, { options: newOpts });
                                showToast(`${prod.name} 재고가 50개 추가되었습니다.`, 'success');
                              }}
                              className="bg-rose-600 hover:bg-rose-500 text-white px-2 py-1 rounded text-xs font-bold"
                            >
                              +50
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. 신규 원부자재 등록 모달 */}
      {isNewMatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <h3 className="font-black text-base text-neutral-900 mb-4 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-rose-600" />
              신규 원부자재 등록 (Supabase DB 저장)
            </h3>
            <form onSubmit={handleCreateMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">자재 관리 코드</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="예: MAT-BTL-100ML-AMBER"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-mono focus:bg-white focus:border-rose-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">자재 명칭</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 100ml 갈색 차광 유리병"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:border-rose-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">자재 유형</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as RawMaterial['type'])}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:border-rose-600 focus:outline-none cursor-pointer"
                >
                  <option value="용기(Bottle)">용기 (Bottle)</option>
                  <option value="펌프/캡(Cap)">펌프/캡 (Cap)</option>
                  <option value="단상자(Box)">단상자 (Box)</option>
                  <option value="라벨(Label)">라벨 (Label)</option>
                  <option value="원료(Formula)">원료 (Formula)</option>
                  <option value="완충재(Pack)">완충재 (Pack)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">초기 재고</label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-mono"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">안전 재고</label>
                  <input
                    type="number"
                    value={safetyStock}
                    onChange={(e) => setSafetyStock(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-mono"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">개당 단가(원)</label>
                  <input
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-mono"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">납품 공급업체</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="예: 삼우글라스패키징 (미입력 시 자체생산)"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:border-rose-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsNewMatModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 font-bold hover:bg-neutral-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {isSubmitting ? '저장 중...' : 'Supabase DB 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Supabase SQL DDL 가이드 모달 */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-base text-neutral-900">Supabase raw_materials 테이블 DDL 스크립트</h3>
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
                접속하여 아래 스크립트를 실행하시면 <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono font-bold">raw_materials</code> 테이블이 즉시 생성됩니다.
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
                실행 후 테이블이 생성되면 재고 수량 변경 및 자재 등록 데이터가 실시간으로 저장 및 동기화됩니다.
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
