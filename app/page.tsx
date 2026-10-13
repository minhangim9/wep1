'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { ProductCard } from '@/components/product/ProductCard';
import {
  Sparkles,
  Flame,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Gift,
  Star,
  Award,
  ArrowRight,
  MessageSquare,
  Calendar,
} from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 1,
    badge: 'PIUDA DUAL FREEZE SERUM',
    title: '천연성분으로\n당신의 본연을 깨우세요',
    subtitle: '피우다(Piuda) 듀얼 프리즈 세럼 — 연꽃 PDRN 5% & 마이크로 시카 펩타이드로 완성하는 맑고 투명한 피부 본연의 빛',
    imageUrl: '/hero_1.jpg',
    link: '/product/prod-001',
    buttonText: '듀얼 프리즈 세럼 만나보기',
    badgeBg: 'bg-amber-500/90 text-white',
  },
  {
    id: 2,
    badge: '1+1 LAUNCHING SPECIAL',
    title: '천연성분으로\n당신의 본연을 깨우세요',
    subtitle: '물 위에 피어난 백련의 순수한 생명력 그대로 — 저자극 비건 안심 포뮬러 1+1 런칭 특별 기획전',
    imageUrl: '/hero_2.jpg',
    link: '/category/one-plus-one',
    buttonText: '1+1 런칭 특가 구매하기',
    badgeBg: 'bg-rose-500/90 text-white',
  },
];

export default function HomePage() {
  const { products, reviews, user } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeBestTab, setActiveBestTab] = useState<'all' | 'skincare' | 'suncare' | 'makeup'>('all');
  const [selectedConcern, setSelectedConcern] = useState<'all' | '진정' | '보습' | '미백' | '남성'>('all');

  // 타임어택 카운트다운 타이머
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 우측에서 좌측으로 지나가는 캐러셀 자동 전환 (마우스 호버 시 일시정지)
  useEffect(() => {
    if (isHovered) return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, [isHovered]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  // 1+1 기획 상품들
  const onePlusOneProducts = products.filter((p) => p.isOnePlusOne);

  // BEST 탭 필터링
  const bestProducts = products.filter((p) => {
    if (activeBestTab === 'all') return true;
    if (activeBestTab === 'skincare') return p.categoryId === 'cat-skincare';
    if (activeBestTab === 'suncare') return p.categoryId === 'cat-suncare';
    if (activeBestTab === 'makeup') return p.categoryId === 'cat-makeup';
    return true;
  });

  // 피부 고민별 맞춤 추천
  const filteredByConcern = products.filter((p) => {
    if (selectedConcern === 'all') return true;
    if (selectedConcern === '진정') return p.functions.some((f) => f.includes('진정') || f.includes('트러블'));
    if (selectedConcern === '보습') return p.functions.some((f) => f.includes('보습') || f.includes('수분'));
    if (selectedConcern === '미백') return p.functions.some((f) => f.includes('미백') || f.includes('광채'));
    if (selectedConcern === '남성') return p.categoryId === 'cat-men';
    return true;
  });

  return (
    <div className="space-y-16 pb-16">
      {/* 1. 메인 히어로 슬라이드 배너 (부드러운 페이드 크로스 전환 캐러셀) */}
      <section
        className="relative overflow-hidden bg-neutral-950 text-white min-h-[480px] sm:min-h-[540px] md:min-h-[600px] flex items-center group select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 flex items-center transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* 배경 이미지 & 프리미엄 다크 그라데이션 오버레이 */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className={`w-full h-full object-cover object-center transition-transform duration-[7000ms] ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                />
                {/* 텍스트 가독성을 위한 그라데이션 */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent sm:max-w-[70%]" />
                <div className="absolute inset-0 bg-black/15" />
              </div>

              {/* 슬라이드 텍스트 컨텐츠 */}
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
                <div
                  className={`max-w-2xl space-y-4 sm:space-y-5 transition-all duration-700 delay-150 ${
                    isActive
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-4 opacity-0'
                  }`}
                >
                  <span
                    className={`inline-flex items-center gap-1.5 ${slide.badgeBg} text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-md`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {slide.badge}
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight whitespace-pre-line drop-shadow-xl text-white">
                    {slide.title}
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-neutral-200 leading-relaxed drop-shadow-md font-medium whitespace-pre-line max-w-xl">
                    {slide.subtitle}
                  </p>
                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    <Link
                      href={slide.link}
                      className="inline-flex items-center gap-2 bg-white text-neutral-950 font-black px-7 py-3.5 rounded-full hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-2xl text-xs sm:text-sm md:text-base group/btn"
                    >
                      <span>{slide.buttonText}</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform duration-200" />
                    </Link>
                    <Link
                      href="/category/all"
                      className="inline-flex items-center gap-2 bg-neutral-900/60 backdrop-blur-md text-white border border-white/30 font-bold px-6 py-3.5 rounded-full hover:bg-white hover:text-neutral-900 transition-all duration-300 text-xs sm:text-sm md:text-base"
                    >
                      전체 상품 보기
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* 좌우 화살표 버튼 */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all opacity-70 hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer"
          aria-label="이전 슬라이드"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all opacity-70 hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer"
          aria-label="다음 슬라이드"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* 슬라이드 인디케이터 도트 & 번호 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentSlide ? 'w-8 bg-rose-500 shadow-md' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
          <span className="text-[11px] font-mono font-bold text-neutral-300 ml-1">
            0{currentSlide + 1} / 0{HERO_SLIDES.length}
          </span>
        </div>
      </section>

      {/* 2. 쇼핑몰 특장점 4단 바 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-neutral-50 p-6 rounded-2xl border border-neutral-200/80 text-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <Truck className="w-5 h-5" />
            </div>
            <p className="font-bold text-xs sm:text-sm text-neutral-900">당일 14시 출고</p>
            <p className="text-[11px] text-neutral-500">우체국/CJ 빠른 안심 배송</p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
              <Gift className="w-5 h-5" />
            </div>
            <p className="font-bold text-xs sm:text-sm text-neutral-900">1+1 더블 증정</p>
            <p className="text-[11px] text-neutral-500">인기 화장품 1개 더 무료</p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="font-bold text-xs sm:text-sm text-neutral-900">100% 비건 & 저자극</p>
            <p className="text-[11px] text-neutral-500">피부 무자극 테스트 완료</p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <p className="font-bold text-xs sm:text-sm text-neutral-900">100% 환불 보장제</p>
            <p className="text-[11px] text-neutral-500">피부 불만족 시 7일 내 환불</p>
          </div>
        </div>
      </section>

      {/* 3. 1+1 타임특가 기획전 (카운트다운 타이머) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          {/* 상단 타이틀 & 타이머 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/20">
            <div>
              <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-2">
                <Flame className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                오늘의 타임어택 한정수량
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                1+1 SPECIAL TIME DEAL 🔥
              </h2>
              <p className="text-xs sm:text-sm text-rose-100 mt-1">
                주문 수량 1개당 본품 1개를 무료로 더 드립니다. 종료 후 가격이 인상됩니다.
              </p>
            </div>

            {/* 타이머 박스 */}
            <div className="flex items-center gap-2 text-neutral-900 font-mono font-black text-lg sm:text-xl">
              <Clock className="w-5 h-5 text-white" />
              <div className="bg-white px-3 py-2 rounded-xl shadow-xs">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <span className="text-white">:</span>
              <div className="bg-white px-3 py-2 rounded-xl shadow-xs">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <span className="text-white">:</span>
              <div className="bg-white px-3 py-2 rounded-xl shadow-xs text-rose-600">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* 상품 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6">
            {onePlusOneProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. BEST 화장품 랭킹 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-rose-600 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
              <Award className="w-4 h-4" /> 랭킹 차트
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              실시간 베스트 뷰티 랭킹
            </h2>
          </div>

          {/* 탭 버튼 */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl text-xs font-bold overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveBestTab('all')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeBestTab === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setActiveBestTab('skincare')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeBestTab === 'skincare'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              스킨케어
            </button>
            <button
              onClick={() => setActiveBestTab('suncare')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeBestTab === 'suncare'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              선케어
            </button>
            <button
              onClick={() => setActiveBestTab('makeup')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeBestTab === 'makeup'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              메이크업
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. 피부 고민별 맞춤 화장품 추천 */}
      <section className="bg-neutral-50 py-12 border-y border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
              CUSTOMIZED SOLUTION
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-1">
              내 피부 고민에 딱 맞는 처방
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              {user?.skinType ? `${user.name}님의 피부타입 [${user.skinType}]에 맞춘 추천 화장품입니다.` : '원하는 피부 고민을 선택해보세요.'}
            </p>

            {/* 고민 선택 알약 버튼들 */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {[
                { key: 'all', label: '전체보기' },
                { key: '진정', label: '🌿 진정/트러블' },
                { key: '보습', label: '💧 속건조/수분' },
                { key: '미백', label: '✨ 미백/톤업' },
                { key: '남성', label: '👔 옴므 올인원' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSelectedConcern(item.key as any)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    selectedConcern === item.key
                      ? 'bg-neutral-900 text-white shadow-md'
                      : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredByConcern.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. 리얼 포토 리뷰 피드 (고객 후기) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-rose-600 font-bold text-xs uppercase tracking-wider">
              REAL REVIEWS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              생생한 고객 포토 리뷰
            </h2>
          </div>
          <Link
            href="/board/free"
            className="text-xs font-semibold text-neutral-600 hover:text-rose-600 flex items-center gap-1"
          >
            커뮤니티 바로가기 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* 작성자 & 별점 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
                      {rev.userName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-neutral-900">{rev.userName}</p>
                      <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded font-medium">
                        {rev.userSkinType || '복합성'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {/* 포토 이미지 (있는 경우) */}
                {rev.photoUrls && rev.photoUrls[0] && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-neutral-100 mb-3 border border-neutral-100">
                    <img
                      src={rev.photoUrls[0]}
                      alt="리뷰 사진"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 리뷰 내용 */}
                <p className="text-xs text-neutral-700 leading-relaxed line-clamp-3">
                  {rev.content}
                </p>
              </div>

              {/* 상품명 & 작성일 */}
              <div className="pt-4 mt-3 border-t border-neutral-100 text-[11px] flex items-center justify-between text-neutral-400">
                <span className="truncate max-w-[180px] font-medium text-neutral-600">
                  {rev.productName}
                </span>
                <span>{rev.createdAt.slice(0, 10)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. 1:1 피부진단 예약 배너 & 고객센터 허브 배너 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 예약 배너 */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-100/60 p-8 rounded-3xl border border-rose-200/80 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 bg-rose-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-3">
                <Calendar className="w-3 h-3" /> OFFLINE LAB
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-neutral-900 leading-snug">
                1:1 맞춤 피부 정밀 진단 &<br />뷰티 클래스 사전 예약
              </h3>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                피우다(Piuda) 뷰티랩 전문가가 수분도, 유분도, 모공, 색소침착을 정밀 측정해 최적의 스킨케어 루틴을 제안합니다.
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/board/reservation"
                className="inline-flex items-center gap-2 bg-rose-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-rose-700 transition-colors shadow-sm"
              >
                무료 피부 진단 예약하기 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 뷰티 팁 & 커뮤니티 배너 */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 rounded-3xl text-white flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 bg-neutral-700 text-rose-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-3">
                <MessageSquare className="w-3 h-3" /> COMMUNITY
              </span>
              <h3 className="text-xl sm:text-2xl font-black leading-snug">
                피우다 뷰티 꿀팁 &<br />화장품 공병 솔직 후기
              </h3>
              <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                실제 회원들의 피부 변화 스토리와 앰플+수분크림 꿀조합을 확인하고 나만의 꿀팁을 공유해보세요!
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/board/free"
                className="inline-flex items-center gap-2 bg-white text-neutral-900 font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-rose-500 hover:text-white transition-colors shadow-sm"
              >
                커뮤니티 글 보러가기 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
