'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { ChevronRight, Ticket, Sparkles, Clock, AlertTriangle, Plus, CheckCircle2, Lock } from 'lucide-react';

export default function CouponsPage() {
  const { user, coupons, registerOfflineCoupon, showToast, openAuthModal } = useShop();

  const [activeTab, setActiveTab] = useState<'available' | 'used'>('available');
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-neutral-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-neutral-900">로그인이 필요한 서비스입니다</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            마이페이지 쿠폰함 조회 및 쿠폰 등록은<br />
            로그인하신 후 이용하실 수 있습니다.
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

  // 3일 이내 만료 임박 여부 계산
  const isExpiringSoon = (expiresAt: string) => {
    try {
      const expDate = new Date(expiresAt);
      const now = new Date();
      const diffMs = expDate.getTime() - now.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 3;
    } catch {
      return false;
    }
  };

  const isExpired = (expiresAt: string) => {
    try {
      const expDate = new Date(expiresAt);
      const now = new Date();
      return expDate < now;
    } catch {
      return false;
    }
  };

  const availableCoupons = coupons.filter((c) => !c.isUsed && !isExpired(c.expiresAt));
  const usedOrExpiredCoupons = coupons.filter((c) => c.isUsed || isExpired(c.expiresAt));

  const handleRegisterCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) {
      showToast('쿠폰 코드를 입력해주세요.', 'error');
      return;
    }

    setIsRegistering(true);
    try {
      const res = await registerOfflineCoupon(couponCodeInput.trim());
      if (res.success) {
        setCouponCodeInput('');
        setActiveTab('available');
      }
    } finally {
      setIsRegistering(false);
    }
  };

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
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 flex items-center gap-2">
          <Ticket className="w-7 h-7 text-rose-500" />
          나의 보유 쿠폰함
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          주문 시 바로 사용 가능한 쿠폰과 오프라인 프로모션 코드를 등록할 수 있습니다.
        </p>
      </div>

      {/* 상단: 오프라인 / 프로모션 쿠폰 코드 등록 인풋 창 (MP-03-01) */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white p-6 rounded-3xl shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
            <Sparkles className="w-4 h-4" />
            <span>오프라인 / 시크릿 프로모션 쿠폰 등록</span>
          </div>
          <span className="text-[11px] text-neutral-400 hidden sm:inline">
            추천 코드: WELCOME2026, BEAUTY10, VIPGIFT
          </span>
        </div>

        <form onSubmit={handleRegisterCoupon} className="flex gap-2">
          <input
            type="text"
            value={couponCodeInput}
            onChange={(e) => setCouponCodeInput(e.target.value)}
            placeholder="쿠폰 코드(예: WELCOME2026, BEAUTY10)를 입력하세요"
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-400 focus:outline-hidden focus:border-rose-400 font-mono tracking-wider"
          />
          <button
            type="submit"
            disabled={isRegistering}
            className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs px-6 py-3 rounded-xl transition-colors shadow-md shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isRegistering ? '등록 중...' : '쿠폰 등록'}
          </button>
        </form>
      </div>

      {/* 2단 탭: 사용 가능한 쿠폰 vs 사용 완료/만료된 쿠폰 */}
      <div className="flex border-b border-neutral-200 text-xs sm:text-sm font-bold text-center">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-3.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'available'
              ? 'border-neutral-900 text-neutral-900 bg-neutral-50/50'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          사용 가능한 쿠폰 ({availableCoupons.length})
        </button>
        <button
          onClick={() => setActiveTab('used')}
          className={`flex-1 py-3.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'used'
              ? 'border-neutral-900 text-neutral-900 bg-neutral-50/50'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          사용 완료 / 만료 ({usedOrExpiredCoupons.length})
        </button>
      </div>

      {/* 쿠폰 카드 목록 */}
      <div className="space-y-4">
        {activeTab === 'available' ? (
          availableCoupons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableCoupons.map((coupon) => {
                const expiring = isExpiringSoon(coupon.expiresAt);

                return (
                  <div
                    key={coupon.id}
                    className="p-6 rounded-3xl border bg-gradient-to-br from-rose-50/60 via-pink-50/30 to-white border-rose-200 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md font-mono">
                          {coupon.code}
                        </span>

                        {expiring ? (
                          <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> 만료 임박 (3일 이내)
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 사용 가능
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-base text-neutral-900 mb-1">
                        {coupon.name}
                      </h3>
                      <p className="text-2xl sm:text-3xl font-black text-rose-600">
                        {coupon.discountType === 'fixed'
                          ? `${coupon.discountValue.toLocaleString()}원 할인`
                          : `${coupon.discountValue}% 할인`}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-rose-200/60 text-[11px] text-neutral-500 flex items-center justify-between">
                      <span>최소 {coupon.minOrderAmount.toLocaleString()}원 이상 구매 시</span>
                      <span className={`flex items-center gap-1 font-bold ${
                        expiring ? 'text-rose-600' : 'text-neutral-500'
                      }`}>
                        <Clock className="w-3 h-3" /> ~{coupon.expiresAt}까지
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-neutral-200 space-y-2">
              <Ticket className="w-10 h-10 text-neutral-300 mx-auto" />
              <p className="font-bold text-neutral-800 text-sm">사용 가능한 쿠폰이 없습니다.</p>
              <p className="text-xs text-neutral-400">
                상단의 쿠폰 등록 창에서 프로모션 코드를 등록해보세요.
              </p>
            </div>
          )
        ) : (
          usedOrExpiredCoupons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {usedOrExpiredCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="p-6 rounded-3xl border bg-neutral-100 border-neutral-200 text-neutral-400 opacity-60 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-neutral-400 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md font-mono">
                        {coupon.code}
                      </span>
                      <span className="text-xs font-bold text-neutral-500">
                        {coupon.isUsed ? '사용완료' : '기간만료'}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-neutral-700 mb-1">
                      {coupon.name}
                    </h3>
                    <p className="text-xl font-bold text-neutral-500 line-through">
                      {coupon.discountType === 'fixed'
                        ? `${coupon.discountValue.toLocaleString()}원`
                        : `${coupon.discountValue}%`}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-neutral-200 text-[11px] text-neutral-400 flex items-center justify-between">
                    <span>최소 {coupon.minOrderAmount.toLocaleString()}원 구매조건</span>
                    <span>만료일: {coupon.expiresAt}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-neutral-200 space-y-2">
              <p className="font-bold text-neutral-800 text-sm">사용 완료 또는 만료된 쿠폰이 없습니다.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
