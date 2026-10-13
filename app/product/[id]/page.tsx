'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import {
  Star,
  Heart,
  ShoppingBag,
  CreditCard,
  Truck,
  ShieldCheck,
  Gift,
  Flame,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  MessageSquare,
  FileText,
  HelpCircle,
  Camera,
  Check,
  Share2,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const {
    products,
    reviews,
    addReview,
    boardPosts,
    addBoardPost,
    addToCart,
    wishlist,
    toggleWishlist,
    user,
    showToast,
  } = useShop();

  const product = products.find((p) => p.id === productId);

  // 옵션 및 수량 선택
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    product?.options[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'detail' | 'ingredients' | 'reviews' | 'qna' | 'delivery'>('detail');

  // 리뷰 필터
  const [reviewSkinFilter, setReviewSkinFilter] = useState<string>('all');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [newReviewPhoto, setNewReviewPhoto] = useState('');

  // Q&A 작성
  const [isQnaModalOpen, setIsQnaModalOpen] = useState(false);
  const [newQnaTitle, setNewQnaTitle] = useState('');
  const [newQnaContent, setNewQnaContent] = useState('');
  const [isQnaSecret, setIsQnaSecret] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-neutral-500 mb-4">존재하지 않거나 삭제된 상품입니다.</p>
        <Link href="/" className="bg-neutral-900 text-white px-6 py-2.5 rounded-lg text-xs font-bold">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const selectedOption = product.options.find((o) => o.id === selectedOptionId) || product.options[0];
  const unitPrice = product.price + (selectedOption?.additionalPrice || 0);
  const totalPrice = unitPrice * quantity;
  const isWishlisted = wishlist.includes(product.id);

  const productReviews = reviews.filter((r) => r.productId === product.id);
  const filteredReviews = productReviews.filter((r) => {
    if (reviewSkinFilter === 'all') return true;
    return r.userSkinType === reviewSkinFilter;
  });

  const productQnas = boardPosts.filter((p) => p.type === 'qna' && p.productId === product.id);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // 바로 구매하기
  const handleBuyNow = () => {
    addToCart(product, selectedOptionId, quantity);
    router.push('/checkout');
  };

  // 리뷰 등록
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('리뷰 작성을 위해 먼저 로그인해주세요.', 'error');
      router.push('/login');
      return;
    }
    if (!newReviewContent.trim()) {
      showToast('리뷰 내용을 입력해주세요.', 'error');
      return;
    }

    addReview({
      productId: product.id,
      productName: product.name,
      userId: user.id,
      userName: user.name,
      userSkinType: user.skinType,
      rating: newReviewRating,
      content: newReviewContent.trim(),
      photoUrls: newReviewPhoto.trim() ? [newReviewPhoto.trim()] : undefined,
    });

    setIsReviewModalOpen(false);
    setNewReviewContent('');
    setNewReviewPhoto('');
  };

  // Q&A 등록
  const handleSubmitQna = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('문의 작성을 위해 먼저 로그인해주세요.', 'error');
      router.push('/login');
      return;
    }
    if (!newQnaTitle.trim() || !newQnaContent.trim()) {
      showToast('문의 제목과 내용을 입력해주세요.', 'error');
      return;
    }

    addBoardPost({
      type: 'qna',
      productId: product.id,
      productName: product.name,
      userId: user.id,
      authorName: user.name,
      title: newQnaTitle.trim(),
      content: newQnaContent.trim(),
      isSecret: isQnaSecret,
    });

    setIsQnaModalOpen(false);
    setNewQnaTitle('');
    setNewQnaContent('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* 빵부스러기 */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition-colors">홈</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/category/${product.categoryId.replace('cat-', '')}`} className="hover:text-neutral-900 transition-colors">
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* 상품 상단 요약 정보 (2단 그리드) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* 좌측: 썸네일 이미지 갤러리 */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-200/80 shadow-xs">
            <img
              src={product.mainImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isOnePlusOne && (
              <span className="absolute top-4 left-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-black px-3.5 py-1 rounded-full shadow-md flex items-center gap-1.5 animate-pulse">
                <Flame className="w-4 h-4 fill-white" />
                1+1 본품 더블 증정
              </span>
            )}
          </div>

          {/* 추가 서브 썸네일 */}
          {product.detailImages && product.detailImages.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-rose-500 shrink-0">
                <img src={product.mainImage} alt="대표 썸네일" className="w-full h-full object-cover" />
              </div>
              {product.detailImages.map((img, i) => (
                <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-neutral-200 hover:border-neutral-400 shrink-0 cursor-pointer">
                  <img src={img} alt={`상세 이미지 ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 우측: 상품 옵션 & 구매 인터랙션 패널 */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* 브랜드 & 리뷰 요약 */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                {product.brand}
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <strong className="text-neutral-900">{product.rating}</strong>
                <span className="text-neutral-400">({product.reviewCount}개 리뷰)</span>
              </div>
            </div>

            {/* 상품 타이틀 */}
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 leading-snug">
              {product.name}
            </h1>

            {/* 한줄 요약 */}
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {product.summary}
            </p>

            {/* 1+1 혜택 배너 박스 */}
            {product.isOnePlusOne && (
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl flex items-center justify-between text-xs text-rose-800">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-rose-600 shrink-0" />
                  <span><strong>1+1 프로모션 적용 상품</strong> : 주문 시 동일 본품 1개가 함께 출고됩니다!</span>
                </div>
              </div>
            )}

            {/* 가격 정보 */}
            <div className="py-3 border-y border-neutral-200/80 space-y-1">
              <div className="flex items-baseline gap-3">
                {discountPercent > 0 && (
                  <span className="text-2xl sm:text-3xl font-black text-rose-600">
                    {discountPercent}%
                  </span>
                )}
                <span className="text-2xl sm:text-3xl font-black text-neutral-900">
                  {product.price.toLocaleString()}원
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-neutral-400 line-through text-sm sm:text-base">
                    {product.originalPrice.toLocaleString()}원
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">
                구매 시 약 <strong className="text-neutral-700">{Math.floor(product.price * 0.02).toLocaleString()}P</strong> 적립 (골드회원 3% 적립)
              </p>
            </div>

            {/* 배송 및 혜택 안내 */}
            <div className="grid grid-cols-2 gap-3 text-xs text-neutral-600 bg-neutral-50 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <p className="font-bold text-neutral-900">무료배송</p>
                  <p className="text-[11px] text-neutral-500">30,000원 이상 무료 (기본 3,000원)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold text-neutral-900">100% 정품보장</p>
                  <p className="text-[11px] text-neutral-500">피부 불만족 7일 내 무료환불</p>
                </div>
              </div>
            </div>

            {/* 옵션 선택 드롭다운 */}
            {product.options && product.options.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 block">
                  옵션 선택
                </label>
                <select
                  value={selectedOptionId}
                  onChange={(e) => setSelectedOptionId(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-3 text-xs font-medium text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 cursor-pointer"
                >
                  {product.options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} {opt.additionalPrice > 0 ? `(+${opt.additionalPrice.toLocaleString()}원)` : ''} (재고: {opt.stockQuantity}개)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 수량 조절 및 계산 박스 */}
            <div className="bg-neutral-100/80 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center border border-neutral-300 rounded-lg bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-neutral-100 text-neutral-600 transition-colors"
                  aria-label="수량 감소"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-bold text-xs text-neutral-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-neutral-100 text-neutral-600 transition-colors"
                  aria-label="수량 증가"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-neutral-500 block">총 상품 금액</span>
                <strong className="text-lg font-black text-rose-600">
                  {totalPrice.toLocaleString()}원
                </strong>
              </div>
            </div>
          </div>

          {/* 구매 액션 버튼 그룹 */}
          <div className="space-y-2 pt-2">
            <div className="flex gap-2">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-xl border transition-colors flex items-center justify-center ${
                  isWishlisted
                    ? 'border-rose-500 text-rose-500 bg-rose-50'
                    : 'border-neutral-300 text-neutral-600 hover:border-neutral-400'
                }`}
                aria-label="찜하기"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>

              <button
                onClick={() => addToCart(product, selectedOptionId, quantity)}
                className="flex-1 bg-white border-2 border-neutral-900 text-neutral-900 font-bold py-3.5 rounded-xl hover:bg-neutral-100 transition-colors text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                장바구니 담기
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 bg-neutral-900 hover:bg-rose-600 text-white font-black py-3.5 rounded-xl transition-colors text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <CreditCard className="w-4 h-4" />
                바로 구매하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5단 탭 내비게이션 */}
      <div className="border-t border-neutral-200 pt-8">
        <div className="flex border-b border-neutral-200 text-xs sm:text-sm font-bold text-center overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('detail')}
            className={`flex-1 py-4 border-b-2 transition-colors whitespace-nowrap px-4 ${
              activeTab === 'detail'
                ? 'border-neutral-900 text-neutral-900 bg-neutral-50/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            상세정보
          </button>
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`flex-1 py-4 border-b-2 transition-colors whitespace-nowrap px-4 ${
              activeTab === 'ingredients'
                ? 'border-neutral-900 text-neutral-900 bg-neutral-50/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            전성분 & 기능성 고시
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-4 border-b-2 transition-colors whitespace-nowrap px-4 ${
              activeTab === 'reviews'
                ? 'border-neutral-900 text-neutral-900 bg-neutral-50/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            구매 후기 ({productReviews.length})
          </button>
          <button
            onClick={() => setActiveTab('qna')}
            className={`flex-1 py-4 border-b-2 transition-colors whitespace-nowrap px-4 ${
              activeTab === 'qna'
                ? 'border-neutral-900 text-neutral-900 bg-neutral-50/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            상품 Q&A ({productQnas.length})
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`flex-1 py-4 border-b-2 transition-colors whitespace-nowrap px-4 ${
              activeTab === 'delivery'
                ? 'border-neutral-900 text-neutral-900 bg-neutral-50/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            배송/교환/반품
          </button>
        </div>

        {/* 탭 1: 상세정보 */}
        {activeTab === 'detail' && (
          <div className="py-10 max-w-3xl mx-auto space-y-8 text-neutral-700 leading-relaxed text-sm">
            <div
              className="prose prose-neutral max-w-none prose-headings:font-bold prose-headings:text-neutral-900"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* 제품 스펙 요약 테이블 */}
            <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200/80 space-y-3 text-xs">
              <h4 className="font-bold text-sm text-neutral-900">제품 핵심 스펙</h4>
              <div className="grid grid-cols-2 gap-y-2 border-t border-neutral-200 pt-3">
                <span className="text-neutral-500">용량 및 중량</span>
                <span className="font-medium text-neutral-800">{product.volume}</span>
                <span className="text-neutral-500">주요 기능성</span>
                <span className="font-medium text-neutral-800">{product.functions.join(', ')}</span>
                <span className="text-neutral-500">추천 피부타입</span>
                <span className="font-medium text-neutral-800">{product.skinTypeRecommendation.join(', ')}</span>
                <span className="text-neutral-500">제조국 / 책임판매업자</span>
                <span className="font-medium text-neutral-800">대한민국 / (주)아빠사랑 피우다 코스메틱</span>
              </div>
            </div>
          </div>
        )}

        {/* 탭 2: 전성분 & 기능성 고시 */}
        {activeTab === 'ingredients' && (
          <div className="py-10 max-w-3xl mx-auto space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl space-y-2">
              <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                EWG 그린 등급 & 비건 인증 포뮬러
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                피우다(Piuda)는 20가지 주의 성분(인공향료, 파라벤, 페녹시에탄올 등)을 엄격히 배제하며, 동물 실험을 하지 않는 100% 클린 비건 뷰티를 지향합니다.
              </p>
            </div>

            <div className="border border-neutral-200 rounded-2xl p-6 space-y-4 text-xs">
              <h4 className="font-bold text-sm text-neutral-900">화장품법에 따른 전성분 표시</h4>
              <p className="text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-xl border border-neutral-200 font-mono text-[11px]">
                {product.ingredients}
              </p>
            </div>
          </div>
        )}

        {/* 탭 3: 구매 후기 (리뷰) */}
        {activeTab === 'reviews' && (
          <div className="py-10 max-w-4xl mx-auto space-y-8">
            {/* 리뷰 통계 헤더 */}
            <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <span className="text-4xl font-black text-neutral-900">{product.rating}</span>
                  <div className="flex text-amber-400 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-neutral-400 mt-0.5 block">전체 {productReviews.length}건</span>
                </div>

                <div className="h-12 w-px bg-neutral-200 hidden sm:block" />

                <div className="text-xs text-neutral-600 space-y-1">
                  <p>✨ <strong>98%</strong>의 고객님이 "피부 진정 효과에 만족해요"라고 응답했습니다.</p>
                  <p>📸 포토 리뷰 작성 시 <strong>1,500P</strong> 즉시 지급!</p>
                </div>
              </div>

              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="bg-neutral-900 hover:bg-rose-600 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
              >
                <Camera className="w-4 h-4" />
                리뷰 작성하기 (+1,500P)
              </button>
            </div>

            {/* 피부타입별 리뷰 필터 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-neutral-400 font-bold shrink-0">피부타입 필터:</span>
              {['all', '민감성', '건성', '지성', '복합성'].map((st) => (
                <button
                  key={st}
                  onClick={() => setReviewSkinFilter(st)}
                  className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                    reviewSkinFilter === st
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {st === 'all' ? '전체 후기' : st}
                </button>
              ))}
            </div>

            {/* 리뷰 목록 */}
            <div className="space-y-4">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((rev) => (
                  <div key={rev.id} className="p-5 border border-neutral-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-neutral-900">{rev.userName}</span>
                        <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-medium">
                          {rev.userSkinType || '복합성'}
                        </span>
                        {rev.isBest && (
                          <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-200">
                            BEST
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    {rev.photoUrls && rev.photoUrls[0] && (
                      <div className="w-32 h-32 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                        <img src={rev.photoUrls[0]} alt="후기 사진" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <p className="text-xs text-neutral-700 leading-relaxed">{rev.content}</p>
                    <span className="text-[10px] text-neutral-400 block">{rev.createdAt}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-neutral-400 text-xs bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                  선택한 피부타입의 리뷰가 아직 없습니다. 첫 번째 리뷰를 작성하고 포인트를 받으세요!
                </div>
              )}
            </div>
          </div>
        )}

        {/* 탭 4: 상품 Q&A */}
        {activeTab === 'qna' && (
          <div className="py-10 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900">상품 문의 (Q&A)</h3>
                <p className="text-xs text-neutral-500">배송, 성분, 사용법에 대해 궁금한 점을 남겨주시면 빠르게 답변드립니다.</p>
              </div>
              <button
                onClick={() => setIsQnaModalOpen(true)}
                className="bg-neutral-900 hover:bg-rose-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
              >
                문의 작성하기
              </button>
            </div>

            <div className="space-y-3">
              {productQnas.length > 0 ? (
                productQnas.map((q) => (
                  <div key={q.id} className="p-4 border border-neutral-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">{q.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        q.answer ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {q.answer ? '답변완료' : '답변대기'}
                      </span>
                    </div>
                    <p className="text-neutral-600 leading-relaxed">{q.content}</p>
                    <div className="text-[10px] text-neutral-400 flex items-center justify-between pt-1">
                      <span>{q.authorName}</span>
                      <span>{q.createdAt}</span>
                    </div>

                    {/* 관리자 답변 */}
                    {q.answer && (
                      <div className="mt-3 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80 space-y-1">
                        <p className="font-bold text-rose-600 text-[11px] flex items-center gap-1">
                          ↳ 피우다(Piuda) CS팀 답변 ({q.answeredAt?.slice(0, 10)})
                        </p>
                        <p className="text-neutral-700 leading-relaxed text-xs">{q.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-neutral-400 text-xs bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                  등록된 상품 문의가 없습니다.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 탭 5: 배송/교환/반품 안내 */}
        {activeTab === 'delivery' && (
          <div className="py-10 max-w-3xl mx-auto space-y-6 text-xs text-neutral-600 leading-relaxed">
            <div className="border border-neutral-200 rounded-2xl p-6 space-y-3">
              <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-rose-500" /> 배송 안내
              </h4>
              <ul className="list-disc list-inside space-y-1 text-neutral-600">
                <li>배송사 : CJ대한통운 / 우체국택배</li>
                <li>배송비 : 기본 3,000원 (30,000원 이상 결제 시 무료배송, 제주/도서산간 3,000원 추가)</li>
                <li>출고 마감 : 평일 오후 2시 이전 결제 완료 시 당일 출고 (주말/공휴일 제외)</li>
              </ul>
            </div>

            <div className="border border-neutral-200 rounded-2xl p-6 space-y-3">
              <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> 교환 및 반품 / 100% 환불 정책
              </h4>
              <ul className="list-disc list-inside space-y-1 text-neutral-600">
                <li>단순 변심 : 상품 수령 후 7일 이내 (왕복 배송비 6,000원 고객 부담)</li>
                <li>피부 트러블 환불 : 제품 사용 후 피부 이상 발생 시 피부과 진단서 또는 사진 첨부 시 100% 무료 환불</li>
                <li>오배송 및 불량 : 100% 무료 교환/반품 처리</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 리뷰 작성 모달 */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-neutral-900">구매 후기 작성</h3>
            <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">별점 평가</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewReviewRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newReviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">포토 이미지 URL (선택, 작성 시 1,500P)</label>
                <input
                  type="text"
                  value={newReviewPhoto}
                  onChange={(e) => setNewReviewPhoto(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">솔직한 사용 후기</label>
                <textarea
                  rows={4}
                  value={newReviewContent}
                  onChange={(e) => setNewReviewContent(e.target.value)}
                  placeholder="발림성, 수분감, 트러블 개선 효과 등 상세한 후기를 남겨주세요."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-300 rounded-lg text-neutral-700 font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-neutral-900 hover:bg-rose-600 text-white rounded-lg font-bold transition-colors"
                >
                  리뷰 등록 (+1,500P)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Q&A 작성 모달 */}
      {isQnaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-neutral-900">상품 Q&A 문의 작성</h3>
            <form onSubmit={handleSubmitQna} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">문의 제목</label>
                <input
                  type="text"
                  value={newQnaTitle}
                  onChange={(e) => setNewQnaTitle(e.target.value)}
                  placeholder="문의 제목을 입력하세요."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">문의 내용</label>
                <textarea
                  rows={4}
                  value={newQnaContent}
                  onChange={(e) => setNewQnaContent(e.target.value)}
                  placeholder="궁금하신 내용을 입력해주세요."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-neutral-600">
                <input
                  type="checkbox"
                  checked={isQnaSecret}
                  onChange={(e) => setIsQnaSecret(e.target.checked)}
                  className="accent-neutral-900 rounded"
                />
                비밀글로 등록 (작성자와 관리자만 확인)
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQnaModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-300 rounded-lg text-neutral-700 font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-neutral-900 text-white rounded-lg font-bold"
                >
                  문의 접수
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
