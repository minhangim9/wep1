'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { RawMaterial } from '@/types';
import { Boxes, Plus, Minus, AlertTriangle, Search, CheckCircle2 } from 'lucide-react';

export default function AdminInventoryPage() {
  const { products, rawMaterials, updateProduct, updateMaterialStock, addRawMaterial, showToast } = useShop();

  const [activeTab, setActiveTab] = useState<'products' | 'materials'>('materials');
  const [isNewMatModalOpen, setIsNewMatModalOpen] = useState(false);

  // 신규 자재 등록 상태
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<RawMaterial['type']>('용기(Bottle)');
  const [currentStock, setCurrentStock] = useState(1000);
  const [safetyStock, setSafetyStock] = useState(200);
  const [unitCost, setUnitCost] = useState(500);
  const [supplier, setSupplier] = useState('');

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      showToast('자재 코드와 이름을 입력해주세요.', 'error');
      return;
    }

    addRawMaterial({
      code,
      name,
      type,
      currentStock,
      safetyStock,
      unitCost,
      supplier: supplier || '자체생산',
    });

    setIsNewMatModalOpen(false);
    setCode('');
    setName('');
  };

  return (
    <div className="space-y-6 text-xs">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-rose-600" />
            재고 및 원부자재 관리
          </h1>
          <p className="text-neutral-500 mt-1">
            화장품 완제품 재고 현황과 용기, 캡, 단상자, 원료 입출고를 통합 관리합니다.
          </p>
        </div>

        {activeTab === 'materials' && (
          <button
            onClick={() => setIsNewMatModalOpen(true)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> 신규 원부자재 등록
          </button>
        )}
      </div>

      {/* 탭 전환 */}
      <div className="flex border-b border-neutral-200 text-xs font-bold text-center">
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex-1 py-3 border-b-2 transition-colors ${
            activeTab === 'materials'
              ? 'border-neutral-900 text-neutral-900 bg-white'
              : 'border-transparent text-neutral-400 bg-neutral-50'
          }`}
        >
          원부자재 (용기/캡/단상자/원료) 재고
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-3 border-b-2 transition-colors ${
            activeTab === 'products'
              ? 'border-neutral-900 text-neutral-900 bg-white'
              : 'border-transparent text-neutral-400 bg-neutral-50'
          }`}
        >
          완제품 화장품 옵션별 재고
        </button>
      </div>

      {activeTab === 'materials' ? (
        /* 원부자재 테이블 */
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
                  <th className="p-4 text-right">입출고 수량 조절</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                {rawMaterials.map((mat) => {
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
                            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2 py-1 rounded text-xs font-bold"
                            title="100개 출고"
                          >
                            -100
                          </button>
                          <button
                            onClick={() => updateMaterialStock(mat.id, -10)}
                            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2 py-1 rounded text-xs font-bold"
                            title="10개 출고"
                          >
                            -10
                          </button>
                          <button
                            onClick={() => updateMaterialStock(mat.id, 50)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs font-bold"
                            title="50개 입고"
                          >
                            +50
                          </button>
                          <button
                            onClick={() => updateMaterialStock(mat.id, 500)}
                            className="bg-rose-600 hover:bg-rose-500 text-white px-2 py-1 rounded text-xs font-bold shadow-xs"
                            title="500개 대량 입고"
                          >
                            +500
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                              }}
                              className="bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded text-xs font-bold"
                            >
                              -10
                            </button>
                            <button
                              onClick={() => {
                                const newOpts = prod.options.map((o) =>
                                  o.id === opt.id ? { ...o, stockQuantity: o.stockQuantity + 50 } : o
                                );
                                updateProduct(prod.id, { options: newOpts });
                              }}
                              className="bg-rose-600 text-white px-2 py-1 rounded text-xs font-bold"
                            >
                              +50 입고
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

      {/* 자재 등록 모달 */}
      {isNewMatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-neutral-900">신규 원부자재 등록</h3>
            <form onSubmit={handleCreateMaterial} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">자재 코드 *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="MAT-BTL-100ML"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">자재 명칭 *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 100ml 갈색 유리 에센스 용기"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">자재 유형</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs cursor-pointer"
                  >
                    <option value="용기(Bottle)">용기(Bottle)</option>
                    <option value="펌프/캡(Cap)">펌프/캡(Cap)</option>
                    <option value="단상자(Box)">단상자(Box)</option>
                    <option value="라벨(Label)">라벨(Label)</option>
                    <option value="원료(Formula)">원료(Formula)</option>
                    <option value="완충재(Pack)">완충재(Pack)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">초기 입고수량</label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">안전 재고</label>
                  <input
                    type="number"
                    value={safetyStock}
                    onChange={(e) => setSafetyStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">개당 공급단가(원)</label>
                  <input
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">공급업체(납품처)</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="(주)한국패키징"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewMatModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-300 rounded-lg font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-500"
                >
                  자재 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
