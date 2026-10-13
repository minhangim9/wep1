'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { SubscriptionItem } from '@/types';
import {
  ChevronRight,
  Repeat,
  Calendar,
  Truck,
  Sparkles,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  XCircle,
  Clock,
  Plus,
  X,
  MapPin,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export default function MySubscriptionsPage() {
  const {
    user,
    subscriptions,
    products,
    updateSubscriptionStatus,
    updateSubscriptionInterval,
    addSubscription,
    showToast,
    openAuthModal,
  } = useShop();

  // 주기 변경 모달
  const [selectedSub, setSelectedSub] = useState<SubscriptionItem | null>(null);
  const [isIntervalModalOpen, setIsIntervalModalOpen] = useState<boolean>(false);
  const [newInterval, setNewInterval] = useState<number>(1);

  // 신규 정기구독 상품 추가 모달
  const [isNewSubModalOpen, setIsNewSubModalOpen] = useState<boolean>(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-neutral-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-neutral-900">로그인이 필요한 서비스입니다</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            마이페이지 정기구독 관리는<br />
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

  const handleOpenIntervalModal = (sub: SubscriptionItem) => {
    setSelectedSub(sub);
    setNewInterval(sub.intervalMonths);
    setIsIntervalModalOpen(true);
  };

  const handleSaveInterval = async () => {
    if (!selectedSub) return;
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + newInterval);
    const dateStr = nextDate.toISOString().slice(0, 10);

    await updateSubscriptionInterval(selectedSub.id, newInterval, dateStr);
    setIsIntervalModalOpen(false);
    setSelectedSub(null);
  };

  const handleAddSubscriptionProduct = async (product: any) => {
    if (!user) return;
    const discountedPrice = Math.floor(product.price * 0.85);
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);

    await addSubscription({
      productId: product.id,
      productName: `[정기구독 15% OFF] ${product.name}`,
      productImage: product.mainImage,
      intervalMonths: 1,
      nextDeliveryDate: nextDate.toISOString().slice(0, 10),
      shippingAddress: user.address || '서울특별시 강남구 테헤란로 152 강남파이낸스센터 12층',
      shippingRecipient: user.name,
      shippingPhone: user.phone || '010-1234-5678',
      status: 'active',
      discountRate: 15,
      pricePerDelivery: discountedPrice,
    });
    setIsNewSubModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 빵부스러기 */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition-colors">홈</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/mypage" className="hover:text-neutral-900 transition-colors">마이페이지</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold">정기 구독(배송) 관리</span>
      </nav>

      {/* 헤더 */}
      <div className="border-b border-neutral-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 flex items-center gap-2">
            <Repeat className="w-7 h-7 text-emerald-600" />
            화장품 정기 구독(배송) 관리
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            떨어지기 전에 알아서 무료배송! 15% 특별 할인과 맞춤 배송 주기를 자유롭게 관리하세요.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewSubModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-colors shadow-md flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> 정기구독 상품 추가
        </button>
      </div>

      {/* 정기구독 혜택 배너 */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl p-6 sm:p-7 shadow-lg grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <strong className="text-emerald-100 block font-bold">💎 15% 상시 특별 할인</strong>
          <p className="text-base font-black">매회차 15% 할인 적용</p>
          <span className="text-[11px] text-emerald-100">단품 구매 대비 연간 최대 12만원 절약</span>
        </div>
        <div className="space-y-1">
          <strong className="text-emerald-100 block font-bold">🚚 전 회차 무료 배송</strong>
          <p className="text-base font-black">금액 상관없이 배송비 0원</p>
          <span className="text-[11px] text-emerald-100">원하는 날짜에 안전하게 문 앞 도착</span>
        </div>
        <div className="space-y-1">
          <strong className="text-emerald-100 block font-bold">⚙️ 언제든 자유로운 변경</strong>
          <p className="text-base font-black">주기변경 · 일시정지 자유</p>
          <span className="text-[11px] text-emerald-100">위약금 없이 1클릭으로 간편 해지 가능</span>
        </div>
      </div>

      {/* 구독 목록 */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-neutral-900">
          이용 중인 정기구독 ({subscriptions.length}건)
        </h3>

        {subscriptions.length > 0 ? (
          <div className="space-y-4">
            {subscriptions.map((sub) => {
              const isActive = sub.status === 'active';
              const isPaused = sub.status === 'paused';

              return (
                <div
                  key={sub.id}
                  className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                    isActive
                      ? 'border-neutral-200'
                      : isPaused
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-neutral-200 opacity-60 bg-neutral-50'
                  }`}
                >
                  {/* 상단 상태 바 */}
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPaused
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {isActive && '● 구독 진행중'}
                        {isPaused && '⏸️ 일시 정지중'}
                        {sub.status === 'cancelled' && '✕ 구독 해지완료'}
                      </span>
                      <span className="text-neutral-400">배송 주기: {sub.intervalMonths}개월마다</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive && (
                        <button
                          type="button"
                          onClick={() => updateSubscriptionStatus(sub.id, 'paused')}
                          className="text-neutral-500 hover:text-amber-700 font-bold underline"
                        >
                          일시정지
                        </button>
                      )}
                      {isPaused && (
                        <button
                          type="button"
                          onClick={() => updateSubscriptionStatus(sub.id, 'active')}
                          className="text-emerald-700 hover:text-emerald-900 font-bold underline"
                        >
                          구독 재개
                        </button>
                      )}
                      {sub.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('정기배송 구독을 해지하시겠습니까?')) {
                              updateSubscriptionStatus(sub.id, 'cancelled');
                            }
                          }}
                          className="text-neutral-400 hover:text-rose-600 font-bold"
                        >
                          해지하기
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 본문 상품 정보 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={sub.productImage}
                        alt={sub.productName}
                        className="w-20 h-20 object-cover rounded-2xl border border-neutral-200 bg-neutral-100 shrink-0"
                      />
                      <div className="space-y-1 text-xs">
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-200">
                          {sub.discountRate}% 상시 할인
                        </span>
                        <h4 className="font-black text-neutral-900 text-sm sm:text-base">
                          {sub.productName}
                        </h4>
                        <p className="text-neutral-500 flex items-center gap-1.5 pt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          다음 배송 예정일 : <strong className="text-neutral-900">{sub.nextDeliveryDate}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-neutral-400 block">회차당 결제금액 (무료배송)</span>
                      <strong className="text-lg sm:text-xl font-black text-rose-600">
                        {sub.pricePerDelivery.toLocaleString()}원
                      </strong>
                    </div>
                  </div>

                  {/* 배송지 및 주기 변경 버튼 바 */}
                  <div className="bg-neutral-50 p-3.5 rounded-xl text-xs text-neutral-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>배송지: {sub.shippingRecipient} ({sub.shippingPhone}) | {sub.shippingAddress}</span>
                    </div>

                    {sub.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => handleOpenIntervalModal(sub)}
                        className="bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 font-bold px-3 py-1.5 rounded-lg shrink-0 self-end sm:self-auto cursor-pointer"
                      >
                        배송 주기 변경
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-neutral-200 space-y-3">
            <Repeat className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="font-bold text-neutral-800 text-sm">현재 이용 중인 정기구독이 없습니다.</p>
            <p className="text-xs text-neutral-400">
              자주 쓰는 앰플, 클렌징폼 등을 정기구독하여 15% 할인 혜택을 받아보세요.
            </p>
            <button
              type="button"
              onClick={() => setIsNewSubModalOpen(true)}
              className="inline-block bg-neutral-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-neutral-800"
            >
              인기 화장품 정기구독 둘러보기
            </button>
          </div>
        )}
      </div>

      {/* 배송 주기 변경 모달 */}
      {isIntervalModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsIntervalModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-900 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block">
                배송 주기 변경
              </span>
              <h3 className="text-lg font-black text-neutral-900">
                {selectedSub.productName}
              </h3>
              <p className="text-xs text-neutral-500">
                고객님의 화장품 사용 속도에 맞춰 배송 주기를 선택해주세요.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-xs font-bold">
              {[1, 2, 3].map((month) => (
                <button
                  key={month}
                  type="button"
                  onClick={() => setNewInterval(month)}
                  className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                    newInterval === month
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <p className="text-sm font-black">{month}개월 주기</p>
                  <span className="text-[10px] opacity-80 mt-1 block">
                    {month === 1 ? '데일리 집중 케어' : month === 2 ? '표준 사용 주기' : '여유로운 사용'}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setIsIntervalModalOpen(false)}
                className="px-4 py-2.5 border border-neutral-300 rounded-xl font-bold text-neutral-600 hover:bg-neutral-100"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveInterval}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
              >
                주기 변경 적용
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 신규 정기구독 상품 선택 모달 */}
      {isNewSubModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsNewSubModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-900 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block">
                SUBSCRIPTION CATALOG
              </span>
              <h3 className="text-xl font-black text-neutral-900">
                정기구독 신청 추천 베스트 화장품
              </h3>
              <p className="text-xs text-neutral-500">
                정기구독 신청 즉시 15% 할인가가 적용되며, 1개월 주기로 자동 무료배송됩니다.
              </p>
            </div>

            <div className="space-y-3">
              {products.slice(0, 5).map((prod) => {
                const subPrice = Math.floor(prod.price * 0.85);
                const isAlready = subscriptions.some((s) => s.productId === prod.id && s.status === 'active');

                return (
                  <div
                    key={prod.id}
                    className="p-4 rounded-2xl border border-neutral-200 hover:border-emerald-500/50 flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.mainImage}
                        alt={prod.name}
                        className="w-16 h-16 object-cover rounded-xl border border-neutral-100 bg-neutral-100 shrink-0"
                      />
                      <div className="space-y-0.5 text-xs">
                        <span className="text-[10px] font-bold text-neutral-400">{prod.categoryName}</span>
                        <h4 className="font-bold text-neutral-900 text-sm">{prod.name}</h4>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="line-through text-neutral-400">{prod.price.toLocaleString()}원</span>
                          <strong className="text-rose-600 font-black">
                            {subPrice.toLocaleString()}원 <span className="text-[10px] text-emerald-600">(15% OFF)</span>
                          </strong>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isAlready}
                      onClick={() => handleAddSubscriptionProduct(prod)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs shrink-0 transition-colors cursor-pointer ${
                        isAlready
                          ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      {isAlready ? '구독중' : '정기구독 신청'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
