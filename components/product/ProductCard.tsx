'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useShop } from '@/context/ShopContext';
import { Heart, Star, ShoppingBag, Flame, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { wishlist, toggleWishlist, addToCart, addRecentProduct } = useShop();
  const isWishlisted = wishlist.includes(product.id);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-neutral-100 hover:border-neutral-300 hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* 썸네일 이미지 영역 */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-50">
        <Link
          href={`/product/${product.id}`}
          onClick={() => addRecentProduct(product)}
          className="block w-full h-full"
        >
          <img
            src={product.mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* 뱃지들 (1+1, BEST, NEW, SALE) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {product.isOnePlusOne && (
            <span className="bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 animate-pulse">
              <Flame className="w-3 h-3 fill-white" />
              1+1 증정
            </span>
          )}
          {product.isBest && (
            <span className="bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
              BEST
            </span>
          )}
          {product.isNew && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
              NEW
            </span>
          )}
        </div>

        {/* 찜하기 버튼 */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 hover:bg-white text-neutral-400 hover:text-rose-500 shadow-sm transition-colors backdrop-blur-xs"
          aria-label="찜하기"
        >
          <Heart
            className={`w-4 h-4 ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-neutral-600'
            }`}
          />
        </button>

        {/* 퀵 장바구니 담기 버튼 (호버 시 표시) */}
        <div className="absolute bottom-2.5 inset-x-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="w-full bg-neutral-900/90 hover:bg-neutral-900 text-white text-xs font-semibold py-2.5 rounded-lg shadow-md flex items-center justify-center gap-1.5 backdrop-blur-xs transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            빠른 장바구니 담기
          </button>
        </div>
      </div>

      {/* 상품 정보 영역 */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* 브랜드 & 기능성 태그 */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
            <span className="font-semibold text-neutral-500">{product.brand}</span>
            {product.functions && product.functions[0] && (
              <span className="text-rose-600 font-medium">#{product.functions[0]}</span>
            )}
          </div>

          {/* 상품명 */}
          <Link
            href={`/product/${product.id}`}
            onClick={() => addRecentProduct(product)}
            className="font-bold text-neutral-900 text-xs sm:text-sm line-clamp-2 hover:text-rose-600 transition-colors leading-snug mb-1.5"
          >
            {product.name}
          </Link>

          {/* 요약 설명 */}
          <p className="text-[11px] text-neutral-500 line-clamp-1 mb-2">
            {product.summary}
          </p>
        </div>

        <div>
          {/* 가격 영역 */}
          <div className="flex items-baseline gap-1.5">
            {discountPercent > 0 && (
              <span className="text-rose-600 font-black text-sm sm:text-base">
                {discountPercent}%
              </span>
            )}
            <span className="text-neutral-900 font-extrabold text-sm sm:text-base">
              {product.price.toLocaleString()}원
            </span>
            {product.originalPrice > product.price && (
              <span className="text-neutral-400 line-through text-xs">
                {product.originalPrice.toLocaleString()}원
              </span>
            )}
          </div>

          {/* 평점 & 리뷰 & 혜택 태그 */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-1 text-neutral-700 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-neutral-400 font-normal">({product.reviewCount})</span>
            </div>

            <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
              무료배송
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
