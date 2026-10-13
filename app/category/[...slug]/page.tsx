'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { INITIAL_CATEGORIES } from '@/lib/mockData';
import { ProductCard } from '@/components/product/ProductCard';
import {
  ChevronRight,
  Filter,
  SlidersHorizontal,
  Sparkles,
  Flame,
  Check,
} from 'lucide-react';

function CategoryPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { products } = useShop();

  const slugArray = Array.isArray(params.slug) ? params.slug : [params.slug as string];
  const currentSlug = slugArray[slugArray.length - 1] || 'all';
  const searchQuery = searchParams.get('search') || '';

  // 필터 및 정렬 상태
  const [sortBy, setSortBy] = useState<'popular' | 'new' | 'price_asc' | 'price_desc' | 'rating'>('popular');
  const [onlyOnePlusOne, setOnlyOnePlusOne] = useState(currentSlug === 'one-plus-one');
  const [selectedSkinType, setSelectedSkinType] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');

  // 현재 카테고리 정보 탐색
  const findCategory = (slug: string) => {
    for (const main of INITIAL_CATEGORIES) {
      if (main.slug === slug) return main;
      if (main.children) {
        for (const sub of main.children) {
          if (sub.slug === slug) return sub;
          if (sub.children) {
            for (const third of sub.children) {
              if (third.slug === slug) return third;
            }
          }
        }
      }
    }
    return null;
  };

  const currentCategory = findCategory(currentSlug);

  // 상품 필터링
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // 검색어 필터
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchSummary = p.summary.toLowerCase().includes(q);
          const matchCat = p.categoryName.toLowerCase().includes(q);
          const matchIngredients = p.ingredients.toLowerCase().includes(q);
          if (!matchName && !matchSummary && !matchCat && !matchIngredients) return false;
        }

        // 카테고리 필터
        if (currentSlug === 'one-plus-one') {
          if (!p.isOnePlusOne) return false;
        } else if (currentSlug === 'best') {
          if (!p.isBest) return false;
        } else if (currentSlug === 'new') {
          if (!p.isNew) return false;
        } else if (currentSlug !== 'all' && currentCategory) {
          // 카테고리 매칭
          const matchCategory =
            p.categoryId === currentCategory.id ||
            p.categoryName.includes(currentCategory.name);
          if (!matchCategory) return false;
        }

        // 1+1 필터
        if (onlyOnePlusOne && !p.isOnePlusOne) return false;

        // 피부타입 필터
        if (selectedSkinType !== 'all') {
          if (!p.skinTypeRecommendation.some((st) => st.includes(selectedSkinType as any))) {
            return false;
          }
        }

        // 가격대 필터
        if (priceRange === 'under20k' && p.price >= 20000) return false;
        if (priceRange === '20k_30k' && (p.price < 20000 || p.price > 30000)) return false;
        if (priceRange === 'over30k' && p.price <= 30000) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.reviewCount - a.reviewCount;
        if (sortBy === 'new') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [products, currentSlug, currentCategory, searchQuery, onlyOnePlusOne, selectedSkinType, priceRange, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 1. 빵부스러기 (Breadcrumbs) */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition-colors">
          홈
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold">
          {searchQuery ? `검색: "${searchQuery}"` : currentCategory?.name || '전체 상품'}
        </span>
      </nav>

      {/* 2. 카테고리 헤더 */}
      <div className="border-b border-neutral-200 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 flex items-center gap-2">
              {currentSlug === 'one-plus-one' && <Flame className="w-7 h-7 text-rose-500 fill-rose-500" />}
              {searchQuery ? `"${searchQuery}" 검색 결과` : currentCategory?.name || '전체 상품 목록'}
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              총 <strong className="text-rose-600 font-bold">{filteredProducts.length}</strong>개의 화장품이 등록되어 있습니다.
            </p>
          </div>

          {/* 정렬 셀렉트 */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-neutral-100 text-xs font-semibold text-neutral-800 rounded-lg px-3 py-2 border-0 focus:ring-2 focus:ring-rose-500/30 cursor-pointer"
            >
              <option value="popular">인기순 (리뷰 많은순)</option>
              <option value="new">최신 등록순</option>
              <option value="rating">평점 높은순</option>
              <option value="price_asc">낮은 가격순</option>
              <option value="price_desc">높은 가격순</option>
            </select>
          </div>
        </div>

        {/* 하위 서브카테고리 칩 (있는 경우) */}
        {currentCategory?.children && currentCategory.children.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {currentCategory.children.map((sub) => (
              <Link
                key={sub.id}
                href={`/category/${sub.slug}`}
                className="text-xs font-medium bg-neutral-100 hover:bg-rose-50 hover:text-rose-600 text-neutral-700 px-3.5 py-1.5 rounded-full border border-neutral-200/80 transition-colors"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 3. 상단 필터 바 */}
      <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          {/* 1+1 필터 체크박스 */}
          <label className="flex items-center gap-1.5 font-bold text-rose-600 cursor-pointer select-none bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200">
            <input
              type="checkbox"
              checked={onlyOnePlusOne}
              onChange={(e) => setOnlyOnePlusOne(e.target.checked)}
              className="accent-rose-600 rounded"
            />
            <Flame className="w-3.5 h-3.5 fill-rose-600" />
            1+1 상품만 보기
          </label>

          {/* 피부타입 선택 */}
          <div className="flex items-center gap-1">
            <span className="text-neutral-500 font-medium">피부타입:</span>
            <select
              value={selectedSkinType}
              onChange={(e) => setSelectedSkinType(e.target.value)}
              className="bg-white border border-neutral-200 rounded-lg px-2.5 py-1 text-xs text-neutral-800"
            >
              <option value="all">전체</option>
              <option value="민감성">민감성</option>
              <option value="건성">건성</option>
              <option value="지성">지성</option>
              <option value="복합성">복합성</option>
              <option value="트러블">트러블</option>
            </select>
          </div>

          {/* 가격대 선택 */}
          <div className="flex items-center gap-1">
            <span className="text-neutral-500 font-medium">가격대:</span>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="bg-white border border-neutral-200 rounded-lg px-2.5 py-1 text-xs text-neutral-800"
            >
              <option value="all">전체 가격</option>
              <option value="under20k">2만원 미만</option>
              <option value="20k_30k">2만원 ~ 3만원</option>
              <option value="over30k">3만원 이상</option>
            </select>
          </div>
        </div>

        {/* 필터 초기화 */}
        {(onlyOnePlusOne || selectedSkinType !== 'all' || priceRange !== 'all') && (
          <button
            onClick={() => {
              setOnlyOnePlusOne(false);
              setSelectedSkinType('all');
              setPriceRange('all');
            }}
            className="text-neutral-500 hover:text-neutral-900 underline text-[11px]"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* 4. 상품 목록 그리드 */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
          <p className="text-neutral-400 text-sm font-medium">
            조건에 일치하는 상품이 없습니다.
          </p>
          <button
            onClick={() => {
              setOnlyOnePlusOne(false);
              setSelectedSkinType('all');
              setPriceRange('all');
            }}
            className="mt-3 text-xs bg-neutral-900 text-white font-bold px-4 py-2 rounded-lg hover:bg-neutral-800"
          >
            전체 상품 보러가기
          </button>
        </div>
      )}
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12 text-center text-xs text-neutral-400">상품 목록을 불러오는 중...</div>}>
      <CategoryPageContent />
    </Suspense>
  );
}
