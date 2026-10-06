'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useShop } from '@/context/ShopContext';
import {
  MessageCircle,
  Sparkles,
  ArrowUp,
  Heart,
  ChevronUp,
  ChevronDown,
  Bot,
} from 'lucide-react';

export const QuickFloatingMenu: React.FC = () => {
  const { recentProducts, wishlist, setIsChatOpen } = useShop();
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [recentIndex, setRecentIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextRecent = () => {
    if (recentProducts.length > 0) {
      setRecentIndex((prev) => (prev + 1) % recentProducts.length);
    }
  };

  const prevRecent = () => {
    if (recentProducts.length > 0) {
      setRecentIndex((prev) => (prev - 1 + recentProducts.length) % recentProducts.length);
    }
  };

  const currentRecent = recentProducts[recentIndex];

  return (
    <div className="hidden lg:flex fixed right-6 bottom-8 z-40 flex-col items-center gap-3">
      {/* 24시간 AI 뷰티 챗봇 트리거 버튼 */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="group relative bg-gradient-to-r from-rose-500 to-pink-500 text-white p-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center border-2 border-white"
        aria-label="뷰티 챗봇 상담"
      >
        <Bot className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        {/* 호버 툴팁 */}
        <span className="absolute right-full mr-3 bg-neutral-900 text-white text-xs font-semibold px-2.5 py-1 rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          ✨ 24시간 AI 뷰티 맞춤 추천 챗봇
        </span>
      </button>

      {/* 카카오톡 1:1 상담 바로가기 */}
      <a
        href="https://pf.kakao.com"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative bg-[#FEE500] text-[#3C1E1E] p-3 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center"
        aria-label="카카오톡 실시간 상담"
      >
        <MessageCircle className="w-5 h-5 fill-[#3C1E1E]" />
        <span className="absolute right-full mr-3 bg-neutral-900 text-white text-xs font-semibold px-2.5 py-1 rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          💬 카카오톡 1:1 상담
        </span>
      </a>

      {/* 최근 본 상품 미니 플로팅 박스 */}
      {recentProducts.length > 0 && currentRecent && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-xl p-2.5 w-24 text-center">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mb-1.5 flex items-center justify-center gap-1">
            <span>최근 본 상품</span>
          </div>

          <div className="relative group/thumb">
            <Link href={`/product/${currentRecent.id}`} className="block relative w-full h-16 rounded-lg overflow-hidden bg-neutral-50 mb-1 border border-neutral-100">
              <img
                src={currentRecent.mainImage}
                alt={currentRecent.name}
                className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
              />
            </Link>

            <p className="text-[10px] font-semibold text-neutral-800 line-clamp-1 truncate">
              {currentRecent.name}
            </p>
            <p className="text-[10px] font-bold text-rose-600">
              {currentRecent.price.toLocaleString()}원
            </p>
          </div>

          {recentProducts.length > 1 && (
            <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-neutral-100 text-[10px] text-neutral-400">
              <button onClick={prevRecent} className="hover:text-neutral-800 p-0.5" aria-label="이전 상품">
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <span>{recentIndex + 1}/{recentProducts.length}</span>
              <button onClick={nextRecent} className="hover:text-neutral-800 p-0.5" aria-label="다음 상품">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 맨 위로 (Top) 버튼 */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="bg-neutral-800 hover:bg-neutral-900 text-white p-2.5 rounded-full shadow-md hover:scale-105 transition-all text-xs font-bold flex items-center justify-center animate-in fade-in"
          aria-label="최상단으로 스크롤"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
