'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { ChevronRight, MessageSquare, Plus, MessageCircle, Lock } from 'lucide-react';

export default function InquiriesPage() {
  const { user, boardPosts, addBoardPost, showToast, openAuthModal } = useShop();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-neutral-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-neutral-900">로그인이 필요한 서비스입니다</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            1:1 맞춤 문의 작성 및 상담 내역 확인은<br />
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

  const myInquiries = boardPosts.filter(
    (p) => p.userId === user.id || p.type === 'qna'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('제목과 내용을 입력해주세요.', 'error');
      return;
    }

    addBoardPost({
      type: 'qna',
      userId: user?.id || 'guest',
      authorName: user?.name || '고객',
      title: title.trim(),
      content: content.trim(),
      isSecret: true,
    });

    setIsModalOpen(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 빵부스러기 */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition-colors">홈</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/mypage" className="hover:text-neutral-900 transition-colors">마이페이지</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold">1:1 맞춤 상담 내역</span>
      </nav>

      {/* 헤더 */}
      <div className="border-b border-neutral-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-rose-500" />
            1:1 맞춤 문의 내역
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            피부 고민, 주문/배송, 제품 상담 내역을 비공개로 확인하실 수 있습니다.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> 새로운 1:1 문의 작성
          </button>
          <a
            href="https://pf.kakao.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FEE500] text-[#3C1E1E] font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#FDD835] transition-colors flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4 fill-[#3C1E1E]" /> 카카오 실시간 상담
          </a>
        </div>
      </div>

      {/* 문의 목록 */}
      <div className="space-y-4">
        {myInquiries.length > 0 ? (
          myInquiries.map((inq) => (
            <div key={inq.id} className="bg-white p-5 rounded-2xl border border-neutral-200 space-y-3 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-neutral-900">{inq.title}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  inq.answer ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                }`}>
                  {inq.answer ? '답변완료' : '답변대기중'}
                </span>
              </div>

              <p className="text-neutral-700 leading-relaxed">{inq.content}</p>
              <span className="text-[10px] text-neutral-400 block">{inq.createdAt}</span>

              {inq.answer && (
                <div className="mt-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-1">
                  <p className="font-bold text-rose-600 text-xs">
                    ↳ 피우다 전문 상담원 답변 ({inq.answeredAt})
                  </p>
                  <p className="text-neutral-800 leading-relaxed">{inq.answer}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 text-neutral-400 text-xs">
            작성하신 1:1 문의 내역이 없습니다.
          </div>
        )}
      </div>

      {/* 작성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-neutral-900">1:1 맞춤 상담 문의</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">문의 제목</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 민감성 피부 앰플 사용 순서 문의"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">문의 상세 내용</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="상세한 상담 내용을 적어주시면 뷰티 전문 상담원이 빠르게 답변드립니다."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-300 rounded-lg text-neutral-700 font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-neutral-900 text-white rounded-lg font-bold hover:bg-neutral-800"
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
