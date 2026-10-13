'use client';

import React from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { ChevronRight, FileText, Eye } from 'lucide-react';

export default function NoticePage() {
  const { boardPosts } = useShop();
  const notices = boardPosts.filter((p) => p.type === 'notice');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 빵부스러기 */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition-colors">홈</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/cs" className="hover:text-neutral-900 transition-colors">고객센터</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold">공지사항</span>
      </nav>

      {/* 헤더 */}
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 flex items-center gap-2">
          <FileText className="w-7 h-7 text-rose-500" />
          피우다(Piuda) 공지사항
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          쇼핑몰 주요 이벤트, 배송 일정, 혜택 안내를 확인하세요.
        </p>
      </div>

      {/* 공지사항 리스트 */}
      <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden shadow-xs">
        {notices.map((post) => (
          <div key={post.id} className="p-6 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                공지
              </span>
              <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
                <span>{post.authorName}</span>
                <span>•</span>
                <span>{post.createdAt.slice(0, 10)}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views}</span>
              </div>
            </div>

            <h3 className="font-bold text-sm sm:text-base text-neutral-900">
              {post.title}
            </h3>

            <div className="text-neutral-600 leading-relaxed whitespace-pre-line bg-neutral-50 p-4 rounded-xl border border-neutral-100">
              {post.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
