'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { ChevronRight, Heart, ShoppingBag, Trash2, ArrowRight, Lock } from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const { user, wishlist, products, toggleWishlist, clearWishlist, addToCart, showToast, openAuthModal } = useShop();

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-neutral-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-neutral-900">로그인이 필요한 서비스입니다</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            찜한 상품(위시리스트) 목록은<br />
            로그인하신 후 확인하실 수 있습니다.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="bg-neutral-900 text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors shadow-md cursor-pointer"
          >
            로그인하기
          </button>
          <Link
            href="/"
            className="bg-neutral-100 text-neutral-700 text-xs font-bold px-5 py-3 rounded-xl hover:bg-neutral-200 transition-colors"
          >
            홈으로 이동
          </Link>
        </div>
      </div>
    );
  }

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleAddToCartAndGo = (product: any) => {
    addToCart(product);
    showToast(`[${product.name}]을 장바구니에 담았습니다.`, 'success');
  };

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
      <div className="border-b border-neutral-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            찜한 화장품 목록
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            관심 있는 화장품 {wishlistedProducts.length}개가 저장되어 있습니다. 바로 장바구니에 담아 주문하실 수 있습니다.
          </p>
        </div>

        {wishlistedProducts.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => {
                if (confirm('찜한 상품을 모두 삭제하시겠습니까?')) {
                  clearWishlist();
                }
              }}
              className="border border-neutral-300 hover:border-rose-400 hover:text-rose-600 px-3.5 py-2 rounded-xl font-bold text-neutral-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> 전체 삭제
            </button>
            <Link
              href="/cart"
              className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> 장바구니 이동
            </Link>
          </div>
        )}
      </div>

      {wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {wishlistedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-square overflow-hidden bg-neutral-100">
                <Link href={`/product/${product.id}`}>
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-rose-500 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                  title="찜 목록에서 삭제"
                >
                  <Heart className="w-4 h-4 fill-rose-500" />
                </button>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400">{product.categoryName}</span>
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-bold text-neutral-900 text-sm line-clamp-2 hover:text-rose-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm font-black text-rose-600 pt-1">
                    {product.price.toLocaleString()}원
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCartAndGo(product)}
                    className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> 장바구니 담기
                  </button>
                  <Link
                    href={`/product/${product.id}`}
                    className="px-3 py-2.5 border border-neutral-200 hover:border-neutral-400 rounded-xl font-bold text-neutral-600 flex items-center justify-center"
                    title="상세보기"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200 space-y-4">
          <Heart className="w-12 h-12 text-neutral-300 mx-auto" />
          <p className="text-xs text-neutral-500">찜한 상품이 없습니다. 마음에 드는 화장품에 하트를 눌러보세요!</p>
          <Link
            href="/category/all"
            className="inline-block bg-neutral-900 text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            화장품 구경하러 가기
          </Link>
        </div>
      )}
    </div>
  );
}
