'use client';

import React from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { ProductCard } from '@/components/product/ProductCard';
import { ChevronRight, Heart, ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, products } = useShop();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 빵부스러기 */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition-colors">홈</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/mypage" className="hover:text-neutral-900 transition-colors">마이페이지</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold">찜한 상품 (위시리스트)</span>
      </nav>

      {/* 헤더 */}
      <div className="border-b border-neutral-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            찜한 화장품 목록
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            관심 있는 화장품 {wishlistedProducts.length}개가 저장되어 있습니다.
          </p>
        </div>
      </div>

      {wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200 space-y-4">
          <Heart className="w-12 h-12 text-neutral-300 mx-auto" />
          <p className="text-xs text-neutral-500">찜한 상품이 없습니다. 마음에 드는 상품에 하트를 눌러보세요!</p>
          <Link
            href="/category/all"
            className="inline-block bg-neutral-900 text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-neutral-800"
          >
            화장품 구경하러 가기
          </Link>
        </div>
      )}
    </div>
  );
}
