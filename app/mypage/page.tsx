'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { SkinType, ShippingAddress } from '@/types';
import {
  User,
  ShoppingBag,
  CreditCard,
  Truck,
  Package,
  RotateCcw,
  Sparkles,
  Heart,
  MessageSquare,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Settings,
  MapPin,
  Calendar,
  Check,
  Plus,
  Trash2,
  Edit2,
  Award,
  X,
  ExternalLink,
  Repeat,
  Star,
} from 'lucide-react';

const SKIN_TYPES: SkinType[] = ['건성', '지성', '복합성', '민감성', '중성', '약건성'];

const SKIN_CONCERNS_OPTIONS = [
  '여드름/트러블',
  '미백/잡티',
  '주름/탄력',
  '모공/피지',
  '속건조',
  '민감/홍조',
];

export default function MyPageDashboard() {
  const router = useRouter();
  const {
    user,
    orders,
    wishlist,
    coupons,
    subscriptions,
    shippingAddresses,
    updateSkinProfile,
    addShippingAddress,
    updateShippingAddress,
    deleteShippingAddress,
    setDefaultShippingAddress,
    showToast,
    openAuthModal,
  } = useShop();

  // 피부 프로필 로컬 상태
  const [selectedSkinType, setSelectedSkinType] = useState<SkinType>(user?.skinType || '복합성');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(user?.skinConcerns || ['여드름/트러블', '속건조']);
  const [isSavingSkin, setIsSavingSkin] = useState<boolean>(false);

  // 모달 상태
  const [isTierModalOpen, setIsTierModalOpen] = useState<boolean>(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);

  // 배송지 추가/수정 폼 상태
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);
  const [addrForm, setAddrForm] = useState({
    recipientName: '',
    phone: '',
    zipcode: '',
    address: '',
    detailAddress: '',
    isDefault: false,
    deliveryMemo: '부재 시 문 앞에 놓아주세요.',
  });

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto">
          <User className="w-8 h-8 text-neutral-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-neutral-900">로그인이 필요한 서비스입니다</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            마이페이지의 회원 등급, 적립금, 주문/배송 내역은<br />
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

  // 최근 30일 내 주문 필터링 및 3단계 배송 카운트
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const recent30DaysOrders = orders.filter((o) => {
    try {
      const orderDate = new Date(o.createdAt);
      return !isNaN(orderDate.getTime()) && orderDate >= thirtyDaysAgo;
    } catch {
      return true;
    }
  });

  // 1) 배송대기: 입금대기, 결제완료, 배송준비중
  const pendingOrPreparingCount = recent30DaysOrders.filter(
    (o) => o.status === 'pending_payment' || o.status === 'paid' || o.status === 'preparing'
  ).length;

  // 2) 배송중
  const shippedCount = recent30DaysOrders.filter((o) => o.status === 'shipped').length;

  // 3) 배송완료
  const deliveredCount = recent30DaysOrders.filter((o) => o.status === 'delivered').length;

  const availableCoupons = coupons.filter((c) => !c.isUsed).length;
  const activeSubsCount = subscriptions.filter((s) => s.status === 'active').length;

  // 피부 고민 체크박스 토글
  const toggleConcern = (concern: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]
    );
  };

  // 피부 프로필 저장 (Supabase 연동)
  const handleSaveSkinProfile = async () => {
    setIsSavingSkin(true);
    try {
      await updateSkinProfile(selectedSkinType, selectedConcerns);
    } finally {
      setIsSavingSkin(false);
    }
  };

  // 배송지 등록/수정 제출
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrForm.recipientName.trim() || !addrForm.phone.trim() || !addrForm.address.trim()) {
      showToast('받는 사람, 연락처, 주소를 모두 입력해주세요.', 'error');
      return;
    }

    if (editingAddress) {
      await updateShippingAddress({
        ...editingAddress,
        ...addrForm,
      });
    } else {
      await addShippingAddress({
        ...addrForm,
      });
    }

    setIsAddingAddress(false);
    setEditingAddress(null);
    setAddrForm({
      recipientName: '',
      phone: '',
      zipcode: '',
      address: '',
      detailAddress: '',
      isDefault: false,
      deliveryMemo: '부재 시 문 앞에 놓아주세요.',
    });
  };

  const openEditAddressModal = (addr: ShippingAddress) => {
    setEditingAddress(addr);
    setAddrForm({
      recipientName: addr.recipientName,
      phone: addr.phone,
      zipcode: addr.zipcode,
      address: addr.address,
      detailAddress: addr.detailAddress || '',
      isDefault: addr.isDefault,
      deliveryMemo: addr.deliveryMemo || '',
    });
    setIsAddingAddress(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 빵부스러기 네비게이션 */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition-colors">홈</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold">마이페이지</span>
      </nav>

      {/* MP-01-01: 대시보드 상단 요약 카드 */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* 회원 프로필 정보 */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-white/20">
              {user.name[0]}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTierModalOpen(true)}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                  title="등급 혜택 안내 보기"
                >
                  <Award className="w-3.5 h-3.5" />
                  {user.tier} 등급 혜택 안내 ›
                </button>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
                {user.name}님
                <span className="text-xs text-neutral-400 font-normal">
                  ({user.role === 'admin' ? '관리자' : '일반회원'})
                </span>
              </h1>
              <p className="text-xs text-neutral-400">{user.email} | {user.phone || '연락처 미등록'}</p>
            </div>
          </div>

          {/* 포인트 / 쿠폰 / 찜한상품 / 정기배송 요약 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
            <Link
              href="/mypage/points"
              className="bg-white/10 hover:bg-white/20 p-3.5 rounded-2xl backdrop-blur-xs transition-all border border-white/5"
            >
              <span className="text-neutral-400 block text-[11px]">보유 적립금</span>
              <strong className="text-rose-400 font-black text-base sm:text-lg block mt-0.5">
                {user.points.toLocaleString()} <span className="text-xs">P</span>
              </strong>
            </Link>

            <Link
              href="/mypage/coupons"
              className="bg-white/10 hover:bg-white/20 p-3.5 rounded-2xl backdrop-blur-xs transition-all border border-white/5"
            >
              <span className="text-neutral-400 block text-[11px]">보유 쿠폰</span>
              <strong className="text-white font-black text-base sm:text-lg block mt-0.5">
                {availableCoupons} <span className="text-xs">장</span>
              </strong>
            </Link>

            <Link
              href="/mypage/wishlist"
              className="bg-white/10 hover:bg-white/20 p-3.5 rounded-2xl backdrop-blur-xs transition-all border border-white/5"
            >
              <span className="text-neutral-400 block text-[11px]">찜한 상품</span>
              <strong className="text-white font-black text-base sm:text-lg block mt-0.5">
                {wishlist.length} <span className="text-xs">개</span>
              </strong>
            </Link>

            <Link
              href="/mypage/subscriptions"
              className="bg-white/10 hover:bg-white/20 p-3.5 rounded-2xl backdrop-blur-xs transition-all border border-white/5"
            >
              <span className="text-neutral-400 block text-[11px]">정기구독</span>
              <strong className="text-emerald-400 font-black text-base sm:text-lg block mt-0.5">
                {activeSubsCount} <span className="text-xs">건</span>
              </strong>
            </Link>
          </div>
        </div>

        {/* 하단 요약 바: 현재 등록된 배송지 & 퀵 모달 열기 */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              기본 배송지 :{' '}
              <strong className="text-white">
                {shippingAddresses.find((a) => a.isDefault)?.address || user.address || '등록된 기본 배송지가 없습니다.'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(true)}
              className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" /> 배송지 관리 ({shippingAddresses.length}/5)
            </button>
          </div>
        </div>
      </div>

      {/* MP-01-01: 최근 30일 주문 배송 현황 (3단계: 배송대기 / 배송중 / 배송완료) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-neutral-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-rose-500" />
              주문 / 배송 현황 (최근 30일)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              실시간 배송 조회 및 결제완료 건은 즉시 취소가 가능합니다.
            </p>
          </div>
          <Link
            href="/mypage/orders"
            className="text-xs font-bold text-neutral-700 hover:text-rose-600 flex items-center gap-1"
          >
            전체 주문내역 ({orders.length}) <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          {/* 배송대기 */}
          <div className="bg-neutral-50 p-4 sm:p-5 rounded-2xl border border-neutral-100 flex flex-col items-center justify-center space-y-1">
            <div className="w-12 h-12 rounded-xl bg-neutral-200/70 text-neutral-800 flex items-center justify-center font-black text-lg">
              {pendingOrPreparingCount}
            </div>
            <strong className="text-xs sm:text-sm font-bold text-neutral-800">배송대기</strong>
            <span className="text-[10px] text-neutral-400">결제완료 / 상품준비</span>
          </div>

          {/* 배송중 */}
          <div className="bg-blue-50/60 p-4 sm:p-5 rounded-2xl border border-blue-100 flex flex-col items-center justify-center space-y-1">
            <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black text-lg shadow-xs">
              {shippedCount}
            </div>
            <strong className="text-xs sm:text-sm font-bold text-blue-900">배송중</strong>
            <span className="text-[10px] text-blue-600 font-semibold">택배사 실시간 운송</span>
          </div>

          {/* 배송완료 */}
          <div className="bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center space-y-1">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-xs">
              {deliveredCount}
            </div>
            <strong className="text-xs sm:text-sm font-bold text-emerald-900">배송완료</strong>
            <span className="text-[10px] text-emerald-600 font-semibold">구매확정 & 리뷰작성</span>
          </div>
        </div>
      </div>

      {/* MP-01-02: 피부 프로필 설정 (화장품 특화 - Supabase 저장) */}
      <div className="bg-gradient-to-br from-rose-50/50 via-white to-pink-50/30 p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100/60 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" /> Cosmetic Personalization
            </span>
            <h3 className="text-lg font-black text-neutral-900">
              화장품 맞춤 피부 프로필 설정
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              회원님의 피부 타입과 피부 고민을 등록하시면 전성분 필터링 및 1:1 맞춤 화장품을 자동 추천해 드립니다.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveSkinProfile}
            disabled={isSavingSkin}
            className="self-start sm:self-auto bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSavingSkin ? 'Supabase 저장 중...' : '피부 프로필 저장하기'}
          </button>
        </div>

        <div className="space-y-5">
          {/* 1. 피부 타입 선택 (택 1) */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-neutral-900 flex items-center gap-1.5">
              <span>1. 피부 타입 선택 (택 1)</span>
              <span className="text-rose-500 text-[11px]">*필수</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {SKIN_TYPES.map((type) => {
                const isSelected = selectedSkinType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedSkinType(type)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500 text-white border-rose-500 shadow-sm scale-[1.02]'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. 피부 고민 선택 (다중 선택 가능) */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-neutral-900 flex items-center gap-1.5">
              <span>2. 주요 피부 고민 (다중 선택 가능)</span>
              <span className="text-neutral-400 font-normal text-[11px]">선택 ({selectedConcerns.length}개)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {SKIN_CONCERNS_OPTIONS.map((concern) => {
                const isChecked = selectedConcerns.includes(concern);
                return (
                  <button
                    key={concern}
                    type="button"
                    onClick={() => toggleConcern(concern)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-between transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <span>{concern}</span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isChecked ? 'bg-rose-500 text-white' : 'border border-neutral-300'
                    }`}>
                      {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-rose-200/70 text-xs text-neutral-600 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
            <span>
              현재 맞춤 진단 : <strong className="text-neutral-900 font-bold">{selectedSkinType}</strong> 피부를 위한{' '}
              <strong className="text-rose-600 font-bold">
                {selectedConcerns.length > 0 ? selectedConcerns.join(', ') : '전체'}
              </strong>{' '}
              맞춤 스킨케어 앰플 및 크림을 메인 화면과 쇼핑몰 상단에서 우선 추천합니다.
            </span>
          </div>
        </div>
      </div>

      {/* MP-04-04: 화장품 정기 구독(배송) 요약 카드 */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="bg-emerald-400 text-neutral-950 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <Repeat className="w-3 h-3" /> 정기구독 15% 상시 할인
          </span>
          <h3 className="text-xl sm:text-2xl font-black">
            화장품 정기배송(구독) 관리
          </h3>
          <p className="text-xs text-emerald-200/90">
            소진 주기에 맞춰 1~3개월 단위로 자동 무료배송! 결제 전 주기 변경 및 언제든 일시정지/해지 가능합니다.
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs font-semibold">
            <span>진행 중인 정기구독: <strong className="text-white font-black">{activeSubsCount}건</strong></span>
            {subscriptions.length > 0 && (
              <span>다음 배송 예정: <strong className="text-emerald-300 font-black">{subscriptions[0].nextDeliveryDate}</strong></span>
            )}
          </div>
        </div>

        <Link
          href="/mypage/subscriptions"
          className="bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-black px-6 py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 self-start md:self-auto"
        >
          정기구독 상세 관리 ›
        </Link>
      </div>

      {/* 마이페이지 핵심 메뉴 8선 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs font-bold">
        <Link
          href="/mypage/orders"
          className="bg-white hover:bg-neutral-50 p-5 rounded-2xl border border-neutral-200 transition-all flex flex-col items-center text-center gap-2 text-neutral-800 shadow-xs hover:border-neutral-300"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-neutral-900">주문 / 취소 / 반품</p>
            <span className="text-[11px] text-neutral-400 font-normal">배송조회 및 반품신청</span>
          </div>
        </Link>

        <Link
          href="/mypage/reviews"
          className="bg-white hover:bg-neutral-50 p-5 rounded-2xl border border-neutral-200 transition-all flex flex-col items-center text-center gap-2 text-neutral-800 shadow-xs hover:border-neutral-300"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-neutral-900">리뷰 관리</p>
            <span className="text-[11px] text-neutral-400 font-normal">포토 1,500P / 텍스트 500P</span>
          </div>
        </Link>

        <Link
          href="/mypage/coupons"
          className="bg-white hover:bg-neutral-50 p-5 rounded-2xl border border-neutral-200 transition-all flex flex-col items-center text-center gap-2 text-neutral-800 shadow-xs hover:border-neutral-300"
        >
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-neutral-900">쿠폰함 ({availableCoupons})</p>
            <span className="text-[11px] text-neutral-400 font-normal">코드 등록 및 만료임박</span>
          </div>
        </Link>

        <Link
          href="/mypage/points"
          className="bg-white hover:bg-neutral-50 p-5 rounded-2xl border border-neutral-200 transition-all flex flex-col items-center text-center gap-2 text-neutral-800 shadow-xs hover:border-neutral-300"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-neutral-900">적립금 히스토리</p>
            <span className="text-[11px] text-neutral-400 font-normal">{user.points.toLocaleString()} P 보유</span>
          </div>
        </Link>

        <Link
          href="/mypage/wishlist"
          className="bg-white hover:bg-neutral-50 p-5 rounded-2xl border border-neutral-200 transition-all flex flex-col items-center text-center gap-2 text-neutral-800 shadow-xs hover:border-neutral-300"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-neutral-900">찜한 화장품 ({wishlist.length})</p>
            <span className="text-[11px] text-neutral-400 font-normal">즉시 장바구니 담기</span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setIsAddressModalOpen(true)}
          className="bg-white hover:bg-neutral-50 p-5 rounded-2xl border border-neutral-200 transition-all flex flex-col items-center text-center gap-2 text-neutral-800 shadow-xs hover:border-neutral-300 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-neutral-900">배송지 관리 ({shippingAddresses.length})</p>
            <span className="text-[11px] text-neutral-400 font-normal">최대 5개 등록 가능</span>
          </div>
        </button>

        <Link
          href="/mypage/inquiries"
          className="bg-white hover:bg-neutral-50 p-5 rounded-2xl border border-neutral-200 transition-all flex flex-col items-center text-center gap-2 text-neutral-800 shadow-xs hover:border-neutral-300"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-neutral-900">1:1 문의 / Q&A</p>
            <span className="text-[11px] text-neutral-400 font-normal">답변대기/답변완료 확인</span>
          </div>
        </Link>

        <Link
          href="/board/reservation"
          className="bg-white hover:bg-neutral-50 p-5 rounded-2xl border border-neutral-200 transition-all flex flex-col items-center text-center gap-2 text-neutral-800 shadow-xs hover:border-neutral-300"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-neutral-900">피부 진단 예약</p>
            <span className="text-[11px] text-neutral-400 font-normal">1:1 맞춤 스킨케어 예약</span>
          </div>
        </Link>
      </div>

      {/* 최근 주문 내역 3건 요약 */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-neutral-900">최근 주문 내역</h3>
          <Link
            href="/mypage/orders"
            className="text-xs font-semibold text-neutral-500 hover:text-rose-600 flex items-center gap-1"
          >
            전체 내역 보기 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-4 divide-y divide-neutral-100">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} className="pt-4 first:pt-0 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-neutral-900">{order.orderNumber}</span>
                    <span className="text-neutral-400 ml-2">{order.createdAt}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    order.status === 'paid'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : order.status === 'shipped'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : order.status === 'delivered'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {order.status === 'paid' && '결제완료'}
                    {order.status === 'preparing' && '상품준비중'}
                    {order.status === 'shipped' && '배송중'}
                    {order.status === 'delivered' && '배송완료'}
                    {order.status === 'cancelled' && '주문취소'}
                    {order.status === 'refund_requested' && '환불접수'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-neutral-700">
                      <span>{item.productName} ({item.quantity}개)</span>
                      <strong className="text-neutral-900">{item.totalPrice.toLocaleString()}원</strong>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-1 text-[11px]">
                  <span className="text-neutral-500">
                    최종 결제액: <strong className="text-neutral-900 font-bold">{order.finalPaymentAmount.toLocaleString()}원</strong>
                  </span>
                  <Link
                    href="/mypage/orders"
                    className="font-bold text-neutral-900 hover:text-rose-600 underline"
                  >
                    주문 상세 및 취소/환불 신청 ›
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-neutral-400 text-xs">최근 주문 내역이 없습니다.</p>
        )}
      </div>

      {/* 등급별 혜택 안내 모달 (MP-01-01) */}
      {isTierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsTierModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-900 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block">
                MEMBERSHIP BENEFITS
              </span>
              <h3 className="text-xl font-black text-neutral-900">
                피우다(Piuda) 회원 등급별 혜택 안내
              </h3>
              <p className="text-xs text-neutral-500">
                회원님의 현재 등급은 <strong className="text-rose-600 font-bold">[{user.tier}]</strong> 입니다.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-neutral-900">🌱 WELCOME (신규 가입)</span>
                  <span className="text-rose-600">적립 1%</span>
                </div>
                <p className="text-neutral-500 text-[11px]">가입 축하 3,000P 지급, 15% 웰컴 할인 쿠폰</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-neutral-900">🥉 BRONZE (누적 5만원 이상)</span>
                  <span className="text-rose-600">적립 2%</span>
                </div>
                <p className="text-neutral-500 text-[11px]">생일 축하 5,000원 쿠폰, 무료배송 쿠폰 1장/분기</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-neutral-900">🥈 SILVER (누적 15만원 이상)</span>
                  <span className="text-rose-600">적립 3%</span>
                </div>
                <p className="text-neutral-500 text-[11px]">매월 1회 무료배송 쿠폰, 신상품 10% 추가할인 쿠폰</p>
              </div>

              <div className={`p-3.5 rounded-2xl border space-y-1 ${
                user.tier === 'GOLD' ? 'bg-amber-50 border-amber-300' : 'bg-neutral-50 border-neutral-200'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-amber-800">🥇 GOLD (누적 30만원 이상)</span>
                  <span className="text-rose-600">적립 4%</span>
                </div>
                <p className="text-neutral-600 text-[11px]">매월 2회 무료배송 쿠폰, 신제품 우선 체험단 지원 자격</p>
              </div>

              <div className={`p-3.5 rounded-2xl border space-y-1 ${
                user.tier === 'VIP' ? 'bg-rose-50 border-rose-300' : 'bg-neutral-50 border-neutral-200'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-rose-800">👑 VIP (누적 50만원 이상)</span>
                  <span className="text-rose-600">적립 5%</span>
                </div>
                <p className="text-neutral-600 text-[11px]">전 주문 상시 무료배송, VIP 전용 스페셜 기프트 세트 연 1회 발송</p>
              </div>
            </div>

            <button
              onClick={() => setIsTierModalOpen(false)}
              className="w-full bg-neutral-900 text-white font-bold py-3 rounded-xl text-xs hover:bg-neutral-800 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 배송지 관리 모달 (MP-01-03) */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsAddressModalOpen(false);
                setIsAddingAddress(false);
                setEditingAddress(null);
              }}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-900 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" />
                배송지 관리 (최대 5개)
              </h3>
              <p className="text-xs text-neutral-500">
                자주 사용하는 배송지를 등록해두시면 주문 시 기본 배송지로 자동 지정됩니다.
              </p>
            </div>

            {/* 배송지 등록/수정 폼 */}
            {isAddingAddress ? (
              <form onSubmit={handleAddressSubmit} className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-4 text-xs">
                <h4 className="font-bold text-neutral-900">
                  {editingAddress ? '배송지 정보 수정' : '신규 배송지 추가'}
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700">받는 분 성함</label>
                    <input
                      type="text"
                      required
                      value={addrForm.recipientName}
                      onChange={(e) => setAddrForm({ ...addrForm, recipientName: e.target.value })}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2.5"
                      placeholder="예: 홍길동"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700">연락처</label>
                    <input
                      type="text"
                      required
                      value={addrForm.phone}
                      onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2.5"
                      placeholder="010-0000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">우편번호</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={addrForm.zipcode}
                      onChange={(e) => setAddrForm({ ...addrForm, zipcode: e.target.value })}
                      className="w-32 bg-white border border-neutral-300 rounded-lg p-2.5 font-mono"
                      placeholder="우편번호"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const randomZip = '0' + (6000 + Math.floor(Math.random() * 900));
                        setAddrForm({ ...addrForm, zipcode: randomZip });
                        showToast('우편번호 검색 연동 완료', 'info');
                      }}
                      className="bg-neutral-800 text-white px-3 py-2 rounded-lg font-bold hover:bg-neutral-700"
                    >
                      우편번호 찾기
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">기본 주소</label>
                  <input
                    type="text"
                    required
                    value={addrForm.address}
                    onChange={(e) => setAddrForm({ ...addrForm, address: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2.5"
                    placeholder="도로명 주소 입력"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">상세 주소</label>
                  <input
                    type="text"
                    value={addrForm.detailAddress}
                    onChange={(e) => setAddrForm({ ...addrForm, detailAddress: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2.5"
                    placeholder="동/호수, 건물명 등 상세 주소"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">배송 메모</label>
                  <input
                    type="text"
                    value={addrForm.deliveryMemo}
                    onChange={(e) => setAddrForm({ ...addrForm, deliveryMemo: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2.5"
                    placeholder="예: 부재 시 문 앞에 놓아주세요."
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isDefaultCheck"
                    checked={addrForm.isDefault}
                    onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                    className="rounded text-rose-500"
                  />
                  <label htmlFor="isDefaultCheck" className="font-bold text-neutral-800">
                    기본 배송지로 설정
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingAddress(false);
                      setEditingAddress(null);
                    }}
                    className="px-4 py-2 border border-neutral-300 rounded-lg font-bold text-neutral-600 hover:bg-neutral-100"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600 shadow-xs"
                  >
                    {editingAddress ? '수정 완료' : '등록하기'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {shippingAddresses.length < 5 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingAddress(true);
                      setEditingAddress(null);
                      setAddrForm({
                        recipientName: user.name,
                        phone: user.phone,
                        zipcode: '',
                        address: '',
                        detailAddress: '',
                        isDefault: shippingAddresses.length === 0,
                        deliveryMemo: '부재 시 문 앞에 놓아주세요.',
                      });
                    }}
                    className="w-full py-3 border-2 border-dashed border-neutral-300 hover:border-rose-500 text-neutral-600 hover:text-rose-600 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> 새 배송지 추가하기 ({shippingAddresses.length}/5)
                  </button>
                )}

                <div className="space-y-2.5 text-xs">
                  {shippingAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        addr.isDefault
                          ? 'border-rose-400 bg-rose-50/30'
                          : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                        <div className="flex items-center gap-2">
                          <strong className="font-bold text-neutral-900">{addr.recipientName}</strong>
                          <span className="text-neutral-500">{addr.phone}</span>
                          {addr.isDefault && (
                            <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                              기본 배송지
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={() => setDefaultShippingAddress(addr.id)}
                              className="text-[11px] text-neutral-500 hover:text-neutral-900 font-semibold underline"
                            >
                              기본배송지로 설정
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditAddressModal(addr)}
                            className="p-1 text-neutral-400 hover:text-neutral-900"
                            title="수정"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteShippingAddress(addr.id)}
                            className="p-1 text-neutral-400 hover:text-rose-600"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 text-neutral-600 space-y-0.5">
                        <p>({addr.zipcode}) {addr.address} {addr.detailAddress}</p>
                        {addr.deliveryMemo && (
                          <p className="text-[11px] text-neutral-400">메모: {addr.deliveryMemo}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
