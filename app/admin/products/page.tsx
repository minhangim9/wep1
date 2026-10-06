'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { Product } from '@/types';
import { Package, Plus, Trash2, Edit3, Flame, Search, Sparkles } from 'lucide-react';

export default function AdminProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, showToast } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // 신규/수정 폼 상태
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('스킨케어 > 앰플/세럼');
  const [summary, setSummary] = useState('');
  const [price, setPrice] = useState<number>(25000);
  const [originalPrice, setOriginalPrice] = useState<number>(35000);
  const [costPrice, setCostPrice] = useState<number>(8000);
  const [isOnePlusOne, setIsOnePlusOne] = useState<boolean>(false);
  const [mainImage, setMainImage] = useState('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80');
  const [optionName, setOptionName] = useState('본품 50ml');
  const [stockQuantity, setStockQuantity] = useState<number>(100);
  const [ingredients, setIngredients] = useState('병풀추출물, 히알루론산, 세라마이드, 정제수');

  const openNewModal = () => {
    setEditingProduct(null);
    setName('');
    setSummary('');
    setPrice(25000);
    setOriginalPrice(35000);
    setCostPrice(8000);
    setIsOnePlusOne(false);
    setStockQuantity(100);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryName(p.categoryName);
    setSummary(p.summary);
    setPrice(p.price);
    setOriginalPrice(p.originalPrice);
    setCostPrice(p.costPrice);
    setIsOnePlusOne(p.isOnePlusOne);
    setMainImage(p.mainImage);
    setOptionName(p.options[0]?.name || '단품');
    setStockQuantity(p.options[0]?.stockQuantity || 50);
    setIngredients(p.ingredients);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      showToast('상품명과 가격을 입력해주세요.', 'error');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        categoryName,
        summary,
        price,
        originalPrice,
        costPrice,
        isOnePlusOne,
        mainImage,
        ingredients,
        options: [
          {
            id: editingProduct.options[0]?.id || 'opt-1',
            name: optionName,
            additionalPrice: 0,
            stockQuantity,
          },
        ],
      });
    } else {
      addProduct({
        name,
        brand: '다써바 (DASSEOBA)',
        categoryId: 'cat-skincare',
        categoryName,
        summary,
        description: `<p>${summary}</p>`,
        price,
        originalPrice,
        costPrice,
        isOnePlusOne,
        isBest: false,
        isNew: true,
        status: 'on_sale',
        safetyStock: 15,
        mainImage,
        detailImages: [],
        options: [
          {
            id: 'opt-' + Date.now(),
            name: optionName,
            additionalPrice: 0,
            stockQuantity,
          },
        ],
        ingredients,
        volume: '50ml',
        skinTypeRecommendation: ['민감성', '복합성'],
        functions: ['피부진정', '수분보습'],
      });
    }

    setIsModalOpen(false);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-rose-600" />
            상품 등록 및 관리
          </h1>
          <p className="text-neutral-500 mt-1">
            화장품 상품 등록, 수정, 삭제, 옵션/재고 및 1+1 프로모션을 설정합니다.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> 신규 상품 등록
        </button>
      </div>

      {/* 검색 바 */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex items-center gap-2 max-w-md">
        <Search className="w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="상품명 또는 카테고리 검색"
          className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-xs focus:bg-white"
        />
      </div>

      {/* 상품 테이블 */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-neutral-200">
            <thead className="bg-neutral-50 text-neutral-500 font-bold">
              <tr>
                <th className="p-4">상품 정보</th>
                <th className="p-4">카테고리</th>
                <th className="p-4">판매가 (원가)</th>
                <th className="p-4">1+1 행사</th>
                <th className="p-4">재고 현황</th>
                <th className="p-4">상태</th>
                <th className="p-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
              {filtered.map((prod) => {
                const totalStock = prod.options.reduce((sum, o) => sum + o.stockQuantity, 0);

                return (
                  <tr key={prod.id} className="hover:bg-neutral-50/50">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={prod.mainImage}
                        alt={prod.name}
                        className="w-12 h-12 rounded-lg object-cover bg-neutral-100 border border-neutral-200"
                      />
                      <div>
                        <strong className="text-neutral-900 block line-clamp-1">{prod.name}</strong>
                        <span className="text-[11px] text-neutral-400">{prod.brand}</span>
                      </div>
                    </td>
                    <td className="p-4 text-neutral-500">{prod.categoryName}</td>
                    <td className="p-4">
                      <strong className="text-neutral-900 block">{prod.price.toLocaleString()}원</strong>
                      <span className="text-[11px] text-neutral-400">원가: {prod.costPrice.toLocaleString()}원</span>
                    </td>
                    <td className="p-4">
                      {prod.isOnePlusOne ? (
                        <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 w-max">
                          <Flame className="w-3 h-3 fill-rose-700" /> 1+1 행사중
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-[11px]">일반</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`font-bold ${totalStock <= prod.safetyStock ? 'text-rose-600' : 'text-neutral-900'}`}>
                        {totalStock}개
                      </span>
                      {totalStock <= prod.safetyStock && (
                        <span className="text-[10px] text-rose-500 block font-bold">안전재고 미달</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        판매중
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-neutral-900"
                          title="수정"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`[${prod.name}] 상품을 정말 삭제하시겠습니까?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-neutral-400 hover:text-rose-600"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* 상품 등록/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-neutral-900">
              {editingProduct ? '상품 정보 수정' : '신규 화장품 상품 등록'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">상품명 *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: [1+1 특별기획] 다써바 센텔라 시카 카밍 진정 앰플 50ml"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">카테고리</label>
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs cursor-pointer"
                  >
                    <option value="스킨케어 > 앰플/세럼">스킨케어 &gt; 앰플/세럼</option>
                    <option value="스킨케어 > 크림/로션">스킨케어 &gt; 크림/로션</option>
                    <option value="선케어 > 선크림">선케어 &gt; 선크림</option>
                    <option value="메이크업 > 베이스">메이크업 &gt; 베이스</option>
                    <option value="메이크업 > 립">메이크업 &gt; 립</option>
                    <option value="클렌징/필링 > 클렌징폼">클렌징/필링 &gt; 클렌징폼</option>
                    <option value="남성 옴므 > 올인원">남성 옴므 &gt; 올인원</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">대표 이미지 URL</label>
                  <input
                    type="text"
                    required
                    value={mainImage}
                    onChange={(e) => setMainImage(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">판매가 (원) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">정가 (소비자가)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">공급원가</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs"
                  />
                </div>
              </div>

              {/* 1+1 행사 설정 체크박스 */}
              <label className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl cursor-pointer text-rose-900 font-bold">
                <input
                  type="checkbox"
                  checked={isOnePlusOne}
                  onChange={(e) => setIsOnePlusOne(e.target.checked)}
                  className="accent-rose-600 rounded"
                />
                <Flame className="w-4 h-4 text-rose-600 fill-rose-600" />
                1+1 특별 기획전 상품으로 지정 (구매 시 1개 자동 무료 동봉)
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">옵션명</label>
                  <input
                    type="text"
                    value={optionName}
                    onChange={(e) => setOptionName(e.target.value)}
                    placeholder="본품 50ml"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">초기 재고 수량 (개)</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">한줄 요약</label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="예: 마다가스카르 병풀추출물 85% 고함량 진정 앰플"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">화장품 전성분</label>
                <textarea
                  rows={2}
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-300 rounded-lg font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors"
                >
                  {editingProduct ? '수정 완료' : '상품 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
