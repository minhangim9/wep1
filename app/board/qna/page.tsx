'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { ChevronRight, HelpCircle, Lock, Plus, MessageCircle } from 'lucide-react';

export default function QnaBoardPage() {
  const { boardPosts, addBoardPost, user, showToast } = useShop();
  const qnaPosts = boardPosts.filter((p) => p.type === 'qna');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSecret, setIsSecret] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('문의 작성을 위해 로그인해주세요.', 'error');
      return;
    }
    if (!title.trim() || !content.trim()) {
      showToast('제목과 내용을 입력해주세요.', 'error');
      return;
    }

    addBoardPost({
      type: 'qna',
      userId: user.id,
      authorName: user.name,
      title: title.trim(),
      content: content.trim(),
      isSecret,
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
        <Link href="/cs" className="hover:text-neutral-900 transition-colors">고객센터</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold">질문과 답변 (Q&A)</span>
      </nav>

      {/* 헤더 */}
      <div className="border-b border-neutral-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-rose-500" />
            질문과 답변 (Q&A)
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            상품, 결제, 배송에 관해 궁금한 점을 남겨주시면 담당자가 신속히 답변드립니다.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-neutral-900 hover:bg-rose-600 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> 질문하기
          </button>
          <a
            href="https://pf.kakao.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FEE500] text-[#3C1E1E] font-bold text-xs px-4 py-3 rounded-xl hover:bg-[#FDD835] transition-colors flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4 fill-[#3C1E1E]" /> 카카오 실시간 상담
          </a>
        </div>
      </div>

      {/* Q&A 목록 */}
      <div className="space-y-4">
        {qnaPosts.map((post) => (
          <div key={post.id} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  post.answer ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                }`}>
                  {post.answer ? '답변완료' : '답변대기'}
                </span>
                {post.productName && (
                  <span className="text-neutral-500 font-medium">[{post.productName}]</span>
                )}
                {post.isSecret && (
                  <span className="flex items-center gap-1 text-neutral-400">
                    <Lock className="w-3 h-3" /> 비밀글
                  </span>
                )}
              </div>
              <span className="text-neutral-400 text-[11px]">{post.createdAt.slice(0, 10)}</span>
            </div>

            <h3 className="font-bold text-base text-neutral-900">{post.title}</h3>
            <p className="text-neutral-700 leading-relaxed bg-neutral-50 p-4 rounded-xl">{post.content}</p>

            {post.answer && (
              <div className="mt-3 bg-rose-50/50 p-4 rounded-xl border border-rose-100 space-y-1">
                <p className="font-bold text-rose-600 text-xs">↳ 다써바 공식 답변 ({post.answeredAt?.slice(0, 10)})</p>
                <p className="text-neutral-800 leading-relaxed">{post.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 작성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-neutral-900">Q&A 질문 작성</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">제목</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="궁금한 점의 제목을 입력하세요."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">상세 내용</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="화장품 사용법, 배송 등 문의사항을 남겨주세요."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-neutral-600">
                <input
                  type="checkbox"
                  checked={isSecret}
                  onChange={(e) => setIsSecret(e.target.checked)}
                  className="accent-neutral-900 rounded"
                />
                비밀글로 작성 (관리자만 열람 가능)
              </label>

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
                  className="flex-1 py-2.5 bg-neutral-900 hover:bg-rose-600 text-white rounded-lg font-bold transition-colors"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
