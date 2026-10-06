'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { ProductCard } from '@/components/product/ProductCard';
import {
  Sparkles,
  Flame,
  Clock,
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
    title: '민감 피부를 위한 구원투수\n센텔라 시카 앰플 1+1 기획전',
    subtitle: '피부 자극 99.8% 진정 임상 완료! 한정 수량 본품 더블 증정',
    badge: '1+1 LIMITED TIME',
    bgColor: 'from-rose-900 via-rose-800 to-neutral-900',
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80',
    link: '/product/prod-001',
    buttonText: '1+1 특가로 구매하기',
  },
  {
    id: 2,
    title: '백탁 없이 생기 충전\n에어핏 비건 톤업 선크림',
    subtitle: '파데 프리 찰떡 밀착! 눈시림 제로 유무기 혼합자차',
    badge: 'NEW RELEASE',
    bgColor: 'from-amber-900 via-rose-900 to-neutral-900',
    imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=80',
    link: '/product/prod-003',
    buttonText: '신제품 만나보기',
  },
  {
    id: 3,
    title: '다써바 멤버십 웰컴 혜택\n신규가입 즉시 3,000P 지급',
    subtitle: '첫 구매 무료배송 쿠폰 & 전품목 15% 할인 쿠폰팩 증정',
    badge: 'MEMBER BENEFIT',
    bgColor: 'from-pink-900 via-purple-900 to-neutral-900',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    link: '/register',
    buttonText: '3초 회원가입 혜택받기',
  },
];

export default function HomePage() {
  const { products, reviews, user } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);
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

  // 롤링 슬라이드 자동 전환
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

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
      {/* 1. 메인 히어로 슬라이드 배너 */}
      <section className="relative overflow-hidden bg-neutral-900 text-white min-h-[460px] md:min-h-[520px] flex items-center">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 flex items-center ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* 배경 이미지 & 그라데이션 */}
            <div className="absolute inset-0">
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover opacity-40 scale-105 transition-transform duration-10000"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} opacity-85`} />
            </div>

            {/* 슬라이드 텍스트 컨텐츠 */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full py-12">
              <div className="max-w-2xl space-y-4">
                <span className="inline-flex items-center gap-1.5 bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  {slide.badge}
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight whitespace-pre-line drop-shadow-md">
                  {slide.title}
                </h1>
                <p className="text-sm sm:text-base text-neutral-200 leading-relaxed drop-shadow-xs">
                  {slide.subtitle}
                </p>
                <div className="pt-2">
                  <Link
                    href={slide.link}
                    className="inline-flex items-center gap-2 bg-white text-neutral-900 font-bold px-6 py-3 rounded-full hover:bg-rose-500 hover:text-white transition-all duration-200 shadow-lg text-sm sm:text-base group"
                  >
                    <span>{slide.buttonText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* 슬라이드 인디케이터 도트 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-8 bg-rose-500' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
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
                다써바 뷰티랩 전문가가 수분도, 유분도, 모공, 색소침착을 정밀 측정해 최적의 스킨케어 루틴을 제안합니다.
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
                다써바 뷰티 꿀팁 &<br />화장품 공병 솔직 후기
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
