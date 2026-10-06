'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import {
  ChevronRight,
  MessageSquare,
  Plus,
  Eye,
  Heart,
  Sparkles,
  User,
} from 'lucide-react';

export default function FreeBoardPage() {
  const { boardPosts, addBoardPost, user, showToast } = useShop();

  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const freePosts = boardPosts.filter((p) => p.type === 'free');

  const handleWriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('글 작성을 위해 로그인해주세요.', 'error');
      return;
    }
    if (!title.trim() || !content.trim()) {
      showToast('제목과 내용을 입력해주세요.', 'error');
      return;
    }

    addBoardPost({
      type: 'free',
      userId: user.id,
      authorName: user.name,
      title: title.trim(),
      content: content.trim(),
    });

    setIsWriteModalOpen(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 빵부스러기 */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition-colors">홈</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold">자유 게시판 (뷰티 커뮤니티)</span>
      </nav>

      {/* 헤더 */}
      <div className="border-b border-neutral-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-rose-500" />
            뷰티 꿀팁 & 자유 게시판
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            화장품 솔직 후기, 피부 고민 해결 꿀조합, 일상 뷰티 팁을 자유롭게 나눠보세요.
          </p>
        </div>

        <button
          onClick={() => setIsWriteModalOpen(true)}
          className="bg-neutral-900 hover:bg-rose-600 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" /> 글쓰기
        </button>
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {freePosts.map((post) => (
          <div
            key={post.id}
            className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3 text-xs hover:border-neutral-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
                  {post.authorName[0]}
                </div>
                <span className="font-bold text-neutral-900">{post.authorName}</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
                <span>{post.createdAt.slice(0, 10)}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views}</span>
              </div>
            </div>

            <h3 className="font-bold text-base text-neutral-900">{post.title}</h3>
            <p className="text-neutral-700 leading-relaxed whitespace-pre-line bg-neutral-50 p-4 rounded-xl">
              {post.content}
            </p>
          </div>
        ))}
      </div>

      {/* 글쓰기 모달 */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-neutral-900">커뮤니티 글 작성</h3>
            <form onSubmit={handleWriteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">제목</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 지성 피부를 위한 시카 앰플 꿀조합 추천!"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">내용</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="뷰티 팁, 화장품 사용 꿀조합, 피부 고민을 공유해주세요."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
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
