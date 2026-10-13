'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { Review, SkinType } from '@/types';
import {
  ChevronRight,
  Star,
  Camera,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  X,
  Plus,
  MessageSquare,
  Package,
  Lock,
} from 'lucide-react';

export default function MyReviewsPage() {
  const { user, orders, reviews, addReview, deleteReview, showToast, openAuthModal } = useShop();

  const [activeTab, setActiveTab] = useState<'writable' | 'written'>('writable');

  // 리뷰 작성 모달 상태
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    productId: string;
    productName: string;
    productImage: string;
  } | null>(null);

  // 모달 폼 상태
  const [rating, setRating] = useState<number>(5);
  const [texture, setTexture] = useState<'촉촉해요' | '보통이에요' | '매트해요'>('촉촉해요');
  const [content, setContent] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-neutral-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-neutral-900">로그인이 필요한 서비스입니다</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            마이페이지 리뷰 관리 및 작성은<br />
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

  // 1. 내가 작성한 리뷰 목록
  const myWrittenReviews = reviews.filter((r) => r.userId === user?.id || r.userName === user?.name);

  // 2. 작성 가능한 리뷰 (배송완료된 주문의 상품 중 아직 리뷰를 작성하지 않은 상품들)
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const deliveredItems: {
    productId: string;
    productName: string;
    productImage: string;
    orderDate: string;
    orderNumber: string;
  }[] = [];

  deliveredOrders.forEach((o) => {
    o.items.forEach((item) => {
      const alreadyReviewed = myWrittenReviews.some((r) => r.productId === item.productId);
      if (!alreadyReviewed) {
        deliveredItems.push({
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          orderDate: o.createdAt,
          orderNumber: o.orderNumber,
        });
      }
    });
  });

  const handleOpenWriteModal = (item: { productId: string; productName: string; productImage: string }) => {
    setSelectedProduct(item);
    setRating(5);
    setTexture('촉촉해요');
    setContent('');
    setPhotoUrl('');
    setIsWriteModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !user) return;
    if (content.trim().length < 10) {
      showToast('리뷰 내용은 최소 10자 이상 정성스럽게 작성해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addReview({
        productId: selectedProduct.productId,
        productName: selectedProduct.productName,
        userId: user.id,
        userName: user.name,
        userSkinType: user.skinType || '복합성',
        rating,
        content: content.trim(),
        texture,
        photoUrls: photoUrl ? [photoUrl] : [],
        isBest: false,
      });

      setIsWriteModalOpen(false);
      setSelectedProduct(null);
      setActiveTab('written');
    } finally {
      setIsSubmitting(false);
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
        <span className="text-neutral-900 font-semibold">나의 리뷰 관리</span>
      </nav>

      {/* 헤더 */}
      <div className="border-b border-neutral-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 flex items-center gap-2">
            <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
            나의 리뷰 관리
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            배송 완료된 화장품의 솔직한 후기를 남겨주시면 최대 1,500P의 뷰티 마일리지를 적립해 드립니다.
          </p>
        </div>

        {/* 적립금 혜택 뱃지 */}
        <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl text-amber-900 font-bold self-start sm:self-auto">
          <span>📸 포토 리뷰 <strong className="text-amber-700 font-black">+1,500P</strong></span>
          <span className="text-amber-300">|</span>
          <span>✍️ 텍스트 리뷰 <strong className="text-amber-700 font-black">+500P</strong></span>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-neutral-200 text-xs sm:text-sm font-bold text-center">
        <button
          onClick={() => setActiveTab('writable')}
          className={`flex-1 py-3.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'writable'
              ? 'border-neutral-900 text-neutral-900 bg-neutral-50/50'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          작성 가능한 리뷰 ({deliveredItems.length})
        </button>
        <button
          onClick={() => setActiveTab('written')}
          className={`flex-1 py-3.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'written'
              ? 'border-neutral-900 text-neutral-900 bg-neutral-50/50'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          작성한 리뷰 ({myWrittenReviews.length})
        </button>
      </div>

      {/* 탭 내용 */}
      {activeTab === 'writable' ? (
        <div className="space-y-4">
          {deliveredItems.length > 0 ? (
            deliveredItems.map((item, idx) => (
              <div
                key={`${item.productId}-${idx}`}
                className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-xl border border-neutral-200 bg-neutral-100 shrink-0"
                  />
                  <div className="space-y-1 text-xs">
                    <span className="text-emerald-700 bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                      배송완료 · 구매확정
                    </span>
                    <h3 className="font-bold text-neutral-900 text-sm">{item.productName}</h3>
                    <p className="text-[11px] text-neutral-400">
                      주문번호: {item.orderNumber} ({item.orderDate})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenWriteModal(item)}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> 리뷰 쓰기 (+1,500P)
                </button>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-neutral-200 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-neutral-800 text-sm">작성 가능한 리뷰가 없습니다.</p>
              <p className="text-xs text-neutral-400">
                상품 배송이 완료되면 이곳에서 리뷰를 작성하고 포인트를 받으실 수 있습니다.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {myWrittenReviews.length > 0 ? (
            myWrittenReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm">{rev.productName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-amber-400' : 'text-neutral-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-neutral-400 text-[11px]">{rev.createdAt}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteReview(rev.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors"
                    title="리뷰 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* 화장품 특화 옵션: 발림성 평가 태그 */}
                {rev.texture && (
                  <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-rose-200">
                    <Sparkles className="w-3 h-3" /> 발림성: {rev.texture}
                  </div>
                )}

                <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                  {rev.content}
                </p>

                {rev.photoUrls && rev.photoUrls.length > 0 && (
                  <div className="flex gap-2 pt-1">
                    {rev.photoUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="리뷰 사진"
                        className="w-20 h-20 object-cover rounded-xl border border-neutral-200"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-neutral-200 space-y-2">
              <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto" />
              <p className="font-bold text-neutral-800 text-sm">작성한 리뷰가 없습니다.</p>
              <p className="text-xs text-neutral-400">
                구매하신 화장품의 후기를 남기고 포인트를 적립해보세요.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 리뷰 작성 모달 */}
      {isWriteModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsWriteModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-900 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block">
                화장품 솔직 후기 작성
              </span>
              <h3 className="text-xl font-black text-neutral-900">
                {selectedProduct.productName}
              </h3>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              {/* 1. 별점 평가 */}
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-800 block">상품 만족도 (별점)</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-neutral-900 ml-2 text-sm">{rating}점</span>
                </div>
              </div>

              {/* 2. 화장품 특화 필수 옵션: 발림성 평가 */}
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-800 flex items-center gap-1.5">
                  <span>발림성이 어떤가요? (화장품 특화 필수값)</span>
                  <span className="text-rose-500 text-[10px]">*필수</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['촉촉해요', '보통이에요', '매트해요'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setTexture(opt)}
                      className={`py-2.5 rounded-xl font-bold border transition-all text-center cursor-pointer ${
                        texture === opt
                          ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. 리뷰 내용 */}
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-800 block">리뷰 상세 내용</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="사용감, 제형, 피부 변화 등 솔직한 사용 후기를 최소 10자 이상 남겨주세요."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:bg-white focus:border-rose-500 outline-hidden"
                />
              </div>

              {/* 4. 포토 첨부 (포토 리뷰 1,500P) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-800 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-rose-500" />
                    사진 첨부 (포토 후기 작성 시 +1,500P 적립!)
                  </label>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-[10px] text-rose-600 underline"
                    >
                      사진 삭제
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="사진 이미지 URL 입력 또는 아래 샘플 버튼 클릭"
                    className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoUrl(selectedProduct.productImage);
                      showToast('제품 사진이 포토 리뷰로 첨부되었습니다.', 'info');
                    }}
                    className="bg-neutral-800 text-white px-3 py-2 rounded-xl font-bold text-[11px] hover:bg-neutral-700 shrink-0"
                  >
                    본품사진 등록
                  </button>
                </div>

                {photoUrl && (
                  <div className="pt-2">
                    <img
                      src={photoUrl}
                      alt="첨부 사진 미리보기"
                      className="w-20 h-20 object-cover rounded-xl border border-neutral-200"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2.5 border border-neutral-200 rounded-xl font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Supabase 저장 중...' : '리뷰 등록 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
