'use client';

import React, { useState, useRef } from 'react';
import { useShop } from '@/context/ShopContext';
import { Product } from '@/types';
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  Flame,
  Search,
  RefreshCw,
  Database,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Info,
  UploadCloud,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FileImage,
} from 'lucide-react';
import { uploadProductImageToSupabase, fileToBase64 } from '@/lib/supabase';

export default function AdminProductsPage() {
  const {
    products,
    isLoadingProducts,
    refreshProducts,
    syncAllProductsToSupabase,
    addProduct,
    updateProduct,
    deleteProduct,
    showToast,
  } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // 이미지 업로드 관련 상태
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [bucketMissingAlert, setBucketMissingAlert] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
    setCategoryName('스킨케어 > 앰플/세럼');
    setSummary('');
    setPrice(25000);
    setOriginalPrice(35000);
    setCostPrice(8000);
    setIsOnePlusOne(false);
    setOptionName('본품 50ml');
    setStockQuantity(100);
    setMainImage('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80');
    setIngredients('병풀추출물, 히알루론산, 세라마이드, 정제수');
    setUploadStatus('idle');
    setUploadedFileName('');
    setBucketMissingAlert(false);
    setImageInputMode('upload');
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
    setUploadStatus('idle');
    setUploadedFileName('');
    setBucketMissingAlert(false);
    setIsModalOpen(true);
  };

  // 이미지 파일 업로드 핸들러
  const handleImageFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일(PNG, JPG, WEBP, GIF)만 업로드할 수 있습니다.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('이미지 크기는 최대 10MB까지 가능합니다.', 'error');
      return;
    }

    setUploadedFileName(file.name);
    setIsUploadingImage(true);
    setUploadStatus('uploading');

    try {
      // 1. 즉시 브라우저 미리보기 반영
      const previewUrl = await fileToBase64(file);
      setMainImage(previewUrl);

      // 2. Supabase Storage 'products' 버킷에 업로드
      const { url, error, isBucketMissing } = await uploadProductImageToSupabase(file);

      if (error || !url) {
        if (isBucketMissing) {
          setBucketMissingAlert(true);
          setUploadStatus('error');
          showToast('Supabase Storage에 products 버킷 생성이 필요합니다. (아래 SQL 실행 권장)', 'info');
        } else {
          setUploadStatus('error');
          showToast(`스토리지 업로드 알림: ${error}`, 'info');
        }
      } else {
        // 3. Supabase Storage Public URL로 설정
        setMainImage(url);
        setUploadStatus('success');
        setBucketMissingAlert(false);
        showToast('이미지가 Supabase Storage에 성공적으로 저장되었습니다! ☁️', 'success');
      }
    } catch (err: any) {
      setUploadStatus('error');
      showToast(`이미지 처리 실패: ${err.message}`, 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      showToast('상품명과 가격을 입력해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
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
        await addProduct({
          name,
          brand: '피우다 (Piuda)',
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sqlCode = `-- Supabase SQL Editor 실행 쿼리 (https://psblczhzozsuicstbefl.supabase.co)
-- 1. products 테이블 생성
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT DEFAULT '피우다 (Piuda)',
    category_id TEXT DEFAULT 'cat-skincare',
    category_name TEXT NOT NULL,
    summary TEXT DEFAULT '',
    description TEXT DEFAULT '',
    price INTEGER NOT NULL,
    original_price INTEGER NOT NULL,
    cost_price INTEGER DEFAULT 0,
    is_one_plus_one BOOLEAN DEFAULT false,
    is_best BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    is_special_deal BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'on_sale' CHECK (status IN ('on_sale', 'sold_out', 'hidden')),
    safety_stock INTEGER DEFAULT 10,
    rating NUMERIC DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    main_image TEXT NOT NULL,
    detail_images JSONB DEFAULT '[]'::jsonb,
    options JSONB DEFAULT '[]'::jsonb,
    ingredients TEXT DEFAULT '',
    volume TEXT DEFAULT '',
    skin_type_recommendation JSONB DEFAULT '[]'::jsonb,
    functions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS 활성화 및 권한 설정
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on products" ON public.products;
CREATE POLICY "Allow public read on products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on products" ON public.products;
CREATE POLICY "Allow public insert on products" ON public.products FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on products" ON public.products;
CREATE POLICY "Allow public update on products" ON public.products FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on products" ON public.products;
CREATE POLICY "Allow public delete on products" ON public.products FOR DELETE USING (true);

-- 3. Supabase Storage 버킷 생성 (products)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'products',
    'products',
    true,
    10485760, -- 10MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']::text[];

-- 4. Storage 정책 설정 (공개 조회 및 업로드 허용)
DROP POLICY IF EXISTS "Allow public read on products storage" ON storage.objects;
CREATE POLICY "Allow public read on products storage" ON storage.objects
    FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow public insert on products storage" ON storage.objects;
CREATE POLICY "Allow public insert on products storage" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow public update on products storage" ON storage.objects;
CREATE POLICY "Allow public update on products storage" ON storage.objects
    FOR UPDATE USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow public delete on products storage" ON storage.objects;
CREATE POLICY "Allow public delete on products storage" ON storage.objects
    FOR DELETE USING (bucket_id = 'products');`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setIsCopied(true);
    showToast('SQL 스크립트가 클립보드에 복사되었습니다!', 'success');
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-6 text-xs">
      {/* 상단 헤더 & Supabase 상태 바 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-rose-600" />
              상품 등록 및 관리
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Supabase DB &amp; Storage 연동
            </span>
          </div>
          <p className="text-neutral-500 mt-1">
            신규 화장품 등록 시 상품 정보는 Supabase <code className="text-rose-600 font-mono font-bold">products</code> 테이블에, 첨부 이미지는 Supabase <code className="text-rose-600 font-mono font-bold">Storage</code>에 실시간 저장됩니다.
          </p>
        </div>

        {/* 액션 버튼 그룹 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 새로고침 */}
          <button
            onClick={() => refreshProducts()}
            disabled={isLoadingProducts}
            className="bg-white hover:bg-neutral-50 text-neutral-700 font-bold px-3 py-2 rounded-xl border border-neutral-300 transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            title="Supabase에서 최신 상품 목록 동기화"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingProducts ? 'animate-spin text-rose-600' : ''}`} />
            {isLoadingProducts ? '동기화 중...' : 'DB 새로고침'}
          </button>

          {/* 초기 8개 상품 일괄 업로드 */}
          <button
            onClick={() => syncAllProductsToSupabase()}
            disabled={isLoadingProducts}
            className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            title="현재 등록된 상품 목록을 Supabase DB에 일괄 저장"
          >
            <Database className="w-3.5 h-3.5 text-rose-400" />
            Supabase 일괄 저장
          </button>

          {/* SQL 스크립트 보기 */}
          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            title="Supabase 테이블 및 스토리지 버킷 생성 DDL SQL 확인"
          >
            <Copy className="w-3.5 h-3.5" />
            SQL 스키마 확인
          </button>

          {/* 신규 상품 등록 */}
          <button
            onClick={openNewModal}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> 신규 상품 등록
          </button>
        </div>
      </div>

      {/* 안내 배너 */}
      <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-950">
        <div className="flex items-start sm:items-center gap-2.5">
          <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong>Supabase Products 테이블 &amp; Storage:</strong> 신규 상품 등록 시 이미지 파일 업로드와 상품 데이터 저장이 Supabase 클라우드에 영구 보관되며 쇼핑몰 화면에 즉시 노출됩니다.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://supabase.com/dashboard/project/psblczhzozsuicstbefl/storage/buckets"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-rose-700 hover:text-rose-900 underline whitespace-nowrap"
          >
            Storage 관리 <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://supabase.com/dashboard/project/psblczhzozsuicstbefl/editor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-neutral-700 hover:text-neutral-900 underline whitespace-nowrap"
          >
            Table Editor <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 검색 바 & 총 상품 수 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="bg-white p-2 rounded-2xl border border-neutral-200 flex items-center gap-2 w-full max-w-md shadow-2xs">
          <Search className="w-4 h-4 text-neutral-400 ml-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="상품명 또는 카테고리 검색"
            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-xs focus:bg-white focus:outline-rose-500"
          />
        </div>
        <div className="text-neutral-500 font-medium">
          총 <strong className="text-neutral-900 font-bold">{filtered.length}</strong>개 상품 표시 중
        </div>
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
                  <tr key={prod.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={prod.mainImage}
                        alt={prod.name}
                        className="w-12 h-12 rounded-lg object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <strong className="text-neutral-900 block truncate max-w-sm">{prod.name}</strong>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-neutral-400">{prod.brand}</span>
                          <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.2 rounded font-mono">{prod.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-neutral-500 whitespace-nowrap">{prod.categoryName}</td>
                    <td className="p-4 whitespace-nowrap">
                      <strong className="text-neutral-900 block text-xs">{prod.price.toLocaleString()}원</strong>
                      <span className="text-[11px] text-neutral-400">원가: {prod.costPrice.toLocaleString()}원</span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {prod.isOnePlusOne ? (
                        <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 w-max">
                          <Flame className="w-3 h-3 fill-rose-700" /> 1+1 행사중
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-[11px]">일반</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`font-bold ${totalStock <= prod.safetyStock ? 'text-rose-600' : 'text-neutral-900'}`}>
                        {totalStock}개
                      </span>
                      {totalStock <= prod.safetyStock && (
                        <span className="text-[10px] text-rose-500 block font-bold">안전재고 미달</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        판매중
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-neutral-900 transition-colors"
                          title="수정"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`[${prod.name}] 상품을 정말 삭제하시겠습니까?\nSupabase DB에서도 함께 삭제됩니다.`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-neutral-400 hover:text-rose-600 transition-colors"
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
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-black text-base text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                {editingProduct ? '상품 정보 수정 (Supabase 동기화)' : '신규 화장품 상품 등록 (Supabase DB 저장)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-[11px] leading-relaxed">
              💡 <strong>안내:</strong> 신규 상품 및 업로드한 이미지는 Supabase <code className="font-mono font-bold">products</code> 테이블과 <code className="font-mono font-bold">Storage</code>에 실시간 저장됩니다.
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">상품명 *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: [1+1 특별기획] 피우다(Piuda) 센텔라 시카 카밍 진정 앰플 50ml"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">카테고리</label>
                <select
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs cursor-pointer focus:bg-white"
                >
                  <option value="스킨케어 > 앰플/세럼">스킨케어 &gt; 앰플/세럼</option>
                  <option value="스킨케어 > 크림/로션">스킨케어 &gt; 크림/로션</option>
                  <option value="선케어 > 선크림">선케어 &gt; 선크림</option>
                  <option value="메이크업 > 베이스">메이크업 &gt; 베이스</option>
                  <option value="메이크업 > 립">메이크업 &gt; 립</option>
                  <option value="클렌징/필링 > 클렌징폼">클렌징/필링 &gt; 클렌징폼</option>
                  <option value="헤어/바디 > 샴푸/스케일러">헤어/바디 &gt; 샴푸/스케일러</option>
                  <option value="남성 옴므 > 올인원">남성 옴므 &gt; 올인원</option>
                </select>
              </div>

              {/* 대표 이미지 업로드 섹션 */}
              <div className="space-y-2 p-3 bg-neutral-50/80 border border-neutral-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-800 text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-rose-600" />
                    대표 이미지 등록 *
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        imageInputMode === 'upload'
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      <UploadCloud className="w-3 h-3 inline mr-1" />
                      내 컴퓨터 파일 업로드
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        imageInputMode === 'url'
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      URL 직접 입력
                    </button>
                  </div>
                </div>

                {/* 이미지 미리보기 및 파일 선택 드롭존 */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* 미리보기 썸네일 */}
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white border-2 border-neutral-200 shrink-0 shadow-2xs flex items-center justify-center">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt="대표 이미지 미리보기"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-neutral-400 p-2">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-[10px]">미리보기</span>
                      </div>
                    )}
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white">
                        <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
                        <span className="text-[9px] font-bold mt-1">업로드 중</span>
                      </div>
                    )}
                  </div>

                  {/* 컨트롤러 */}
                  <div className="flex-1 w-full space-y-2">
                    {imageInputMode === 'upload' ? (
                      <>
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleImageFileUpload(e.dataTransfer.files[0]);
                            }
                          }}
                          onClick={() => fileInputRef.current?.click()}
                          className={`p-3.5 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all ${
                            isDragging
                              ? 'border-rose-500 bg-rose-50 scale-[1.01]'
                              : 'border-neutral-300 bg-white hover:border-rose-400 hover:bg-rose-50/40'
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleImageFileUpload(e.target.files[0]);
                              }
                            }}
                          />
                          <div className="flex flex-col items-center justify-center gap-1">
                            <UploadCloud className="w-5 h-5 text-rose-600" />
                            <p className="text-neutral-800 font-bold text-xs">
                              컴퓨터 사진 선택 <span className="text-rose-600 underline">클릭</span> 또는 파일 드래그
                            </p>
                            <p className="text-[10px] text-neutral-400">
                              PNG, JPG, WEBP, GIF (최대 10MB) • Supabase Storage 자동 저장
                            </p>
                          </div>
                        </div>

                        {uploadStatus === 'success' && (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">Supabase Storage 저장 완료: {mainImage}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-1">
                        <input
                          type="text"
                          required
                          value={mainImage}
                          onChange={(e) => setMainImage(e.target.value)}
                          placeholder="https://... 이미지 웹 URL 주소"
                          className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-rose-500"
                        />
                        <p className="text-[10px] text-neutral-400">
                          외부 이미지 주소(Unsplash, CDN 주소)를 직접 입력할 수도 있습니다.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Storage 버킷 미생성 알림 배너 */}
                {bucketMissingAlert && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed">
                      <strong>Supabase Storage `products` 버킷 생성 안내:</strong>
                      <p className="mt-0.5 text-amber-800">
                        현재 등록은 로컬 미리보기 이미지로 계속 저장 가능하며, Supabase 클라우드 스토리지에 영구 보관하시려면 상단 <strong>[SQL 스키마 확인]</strong> 쿼리를 Supabase SQL Editor에서 1회 실행해주시면 버킷이 자동 생성됩니다.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">판매가 (원) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-bold focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">정가 (소비자가)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">공급원가</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
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
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">초기 재고 수량 (개)</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-bold focus:bg-white"
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
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">화장품 전성분</label>
                <textarea
                  rows={2}
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-300 rounded-lg font-bold hover:bg-neutral-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Supabase에 저장 중...
                    </>
                  ) : editingProduct ? (
                    '수정 완료'
                  ) : (
                    'Supabase에 상품 등록'
                  )}
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
                Supabase Products 테이블 및 Storage 생성 SQL
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
              Supabase Dashboard의 <strong>SQL Editor</strong>에서 아래 쿼리를 1회 실행하시면 <code className="bg-neutral-100 px-1 py-0.5 rounded text-rose-600 font-bold font-mono">public.products</code> 테이블과 이미지 저장을 위한 <code className="bg-neutral-100 px-1 py-0.5 rounded text-rose-600 font-bold font-mono">storage.buckets (products)</code> 버킷 및 RLS 정책이 한 번에 자동 구축됩니다.
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
