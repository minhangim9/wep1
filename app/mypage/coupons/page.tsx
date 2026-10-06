'use client';

import React from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { ChevronRight, Ticket, Sparkles, Clock } from 'lucide-react';

export default function CouponsPage() {
  const { coupons } = useShop();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 빵부스러기 */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition-colors">홈</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/mypage" className="hover:text-neutral-900 transition-colors">마이페이지</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold">나의 쿠폰함</span>
      </nav>

      {/* 헤더 */}
      <div className="border-b border-neutral-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 flex items-center gap-2">
            <Ticket className="w-7 h-7 text-rose-500" />
            나의 보유 쿠폰
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            주문 시 바로 사용 가능한 쿠폰 목록입니다.
          </p>
        </div>
      </div>

      {/* 쿠폰 카드 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`p-6 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
              coupon.isUsed
                ? 'bg-neutral-100 border-neutral-200 text-neutral-400 opacity-60'
                : 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md font-mono">
                  {coupon.code}
                </span>
                <span className="text-xs font-bold text-neutral-500">
                  {coupon.isUsed ? '사용완료' : '사용가능'}
                </span>
              </div>

              <h3 className="font-black text-base text-neutral-900 mb-1">
                {coupon.name}
              </h3>
              <p className="text-2xl font-black text-rose-600">
                {coupon.discountType === 'fixed'
                  ? `${coupon.discountValue.toLocaleString()}원 할인`
                  : `${coupon.discountValue}% 할인`}
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-rose-200/60 text-[11px] text-neutral-500 flex items-center justify-between">
              <span>최소 {coupon.minOrderAmount.toLocaleString()}원 이상 구매 시</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> ~{coupon.expiresAt}까지
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
