'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Gift,
  Truck,
  ArrowRight,
  Flame,
  ChevronRight,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    toggleCartSelect,
    toggleAllCartSelect,
  } = useShop();

  const selectedItems = cart.filter((item) => item.selected);
  const isAllSelected = cart.length > 0 && selectedItems.length === cart.length;

  // 금액 계산
  const totalItemPrice = selectedItems.reduce((sum, item) => {
    const unitPrice = item.product.price + (item.selectedOption?.additionalPrice || 0);
    return sum + unitPrice * item.quantity;
  }, 0);

  const freeShippingThreshold = 30000;
  const shippingFee = totalItemPrice >= freeShippingThreshold || totalItemPrice === 0 ? 0 : 3000;
  const finalPrice = totalItemPrice + shippingFee;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - totalItemPrice);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert('주문할 상품을 선택해주세요.');
      return;
    }
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 빵부스러기 */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition-colors">홈</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold">장바구니</span>
      </nav>

      {/* 헤더 & 진행 단계 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">장바구니</h1>
          <p className="text-xs text-neutral-500 mt-1">담긴 상품 {cart.length}개</p>
        </div>

        {/* 3단계 스텝 인디케이터 */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            01 장바구니
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
          <span className="text-neutral-400">02 주문/결제</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
          <span className="text-neutral-400">03 주문완료</span>
        </div>
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 좌측: 장바구니 리스트 (2열) */}
          <div className="lg:col-span-2 space-y-4">
            {/* 무료배송 달성 프로그레스 바 */}
            <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 text-xs">
              <div className="flex items-center justify-between font-bold mb-2">
                <span className="flex items-center gap-1.5 text-rose-800">
                  <Truck className="w-4 h-4 text-rose-600" />
                  {remainingForFreeShipping === 0 ? (
                    <span className="text-emerald-700">🎉 무료배송 혜택이 적용되었습니다!</span>
                  ) : (
                    <span>
                      <strong className="text-rose-600 font-black">{remainingForFreeShipping.toLocaleString()}원</strong> 더 담으면 무료배송!
                    </span>
                  )}
                </span>
                <span className="text-neutral-500 text-[11px]">30,000원 이상 무료배송</span>
              </div>
              <div className="w-full bg-rose-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (totalItemPrice / freeShippingThreshold) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* 전체 선택 바 */}
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 font-bold text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => toggleAllCartSelect(e.target.checked)}
                  className="accent-neutral-900 rounded"
                />
                전체선택 ({selectedItems.length}/{cart.length})
              </label>

              <button
                onClick={() => {
                  selectedItems.forEach((i) => removeFromCart(i.id));
                }}
                className="text-neutral-500 hover:text-rose-600 text-xs font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> 선택삭제
              </button>
            </div>

            {/* 장바구니 아이템 목록 */}
            <div className="space-y-3">
              {cart.map((item) => {
                const unitPrice = item.product.price + (item.selectedOption?.additionalPrice || 0);
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      item.selected ? 'border-neutral-300 bg-white' : 'border-neutral-200 bg-neutral-50/50 opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleCartSelect(item.id)}
                        className="accent-neutral-900 rounded mt-1 cursor-pointer"
                      />

                      <img
                        src={item.product.mainImage}
                        alt={item.product.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-neutral-100 border border-neutral-200 shrink-0"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/product/${item.product.id}`}
                            className="font-bold text-xs sm:text-sm text-neutral-900 hover:text-rose-600 line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-neutral-400 hover:text-neutral-700 p-1"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* 옵션 정보 */}
                        {item.selectedOption && (
                          <p className="text-[11px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded w-max">
                            옵션 : {item.selectedOption.name}
                          </p>
                        )}

                        {/* 1+1 뱃지 */}
                        {item.product.isOnePlusOne && (
                          <p className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                            <Flame className="w-3 h-3 fill-rose-600" />
                            1+1 행사 적용 (본품 1개 무료 추가 증정)
                          </p>
                        )}

                        {/* 가격 및 수량 조절 */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center border border-neutral-200 rounded-lg bg-white overflow-hidden text-xs">
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 hover:bg-neutral-100 text-neutral-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 hover:bg-neutral-100 text-neutral-600"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <strong className="text-sm sm:text-base font-black text-neutral-900">
                              {itemTotal.toLocaleString()}원
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 우측: 결제 금액 요약 박스 (1열 고정) */}
          <div className="space-y-4">
            <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 space-y-4 text-xs">
              <h3 className="text-base font-black text-neutral-900 pb-3 border-b border-neutral-200">
                주문 결제 요약
              </h3>

              <div className="space-y-2.5 text-neutral-600">
                <div className="flex justify-between">
                  <span>선택 상품 총액</span>
                  <strong className="text-neutral-900">{totalItemPrice.toLocaleString()}원</strong>
                </div>
                <div className="flex justify-between">
                  <span>기본 배송비</span>
                  <span className="text-neutral-900">
                    {shippingFee === 0 ? '무료' : `+${shippingFee.toLocaleString()}원`}
                  </span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>1+1 증정 혜택</span>
                  <span>무료 본품 증정</span>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex items-baseline justify-between">
                <span className="text-sm font-bold text-neutral-900">최종 결제 예상액</span>
                <strong className="text-2xl font-black text-rose-600">
                  {finalPrice.toLocaleString()}원
                </strong>
              </div>

              <button
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
                className="w-full bg-neutral-900 hover:bg-rose-600 disabled:opacity-50 text-white font-black py-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <span>총 {selectedItems.length}개 상품 주문하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                * 쿠폰 및 포인트는 다음 주문서 작성 단계에서 적용하실 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-24 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200 space-y-4">
          <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-neutral-700">장바구니가 비어 있습니다.</h3>
            <p className="text-xs text-neutral-400 mt-1">
              다써바의 인기 1+1 화장품과 베스트 상품을 둘러보세요!
            </p>
          </div>
          <Link
            href="/category/all"
            className="inline-block bg-neutral-900 text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            쇼핑 계속하기
          </Link>
        </div>
      )}
    </div>
  );
}
