'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, X } from 'lucide-react';

export const TopBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    const hiddenDate = localStorage.getItem('piuda_hide_top_banner');
    if (hiddenDate === new Date().toDateString()) {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    if (dontShowToday) {
      localStorage.setItem('piuda_hide_top_banner', new Date().toDateString());
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white text-xs md:text-sm py-2 px-4 shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 text-center font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-200 animate-pulse" />
          <Link href="/category/one-plus-one" className="hover:underline flex items-center gap-1.5">
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold">1+1 EVENT</span>
            <span>신규회원 첫 구매 시 <strong>피우다(Piuda) 듀얼 프리즈 세럼 1+1</strong> & <strong>3,000P 즉시 적립</strong>!</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 text-xs shrink-0">
          <label className="hidden sm:flex items-center gap-1 cursor-pointer select-none text-white/90 hover:text-white">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              className="rounded text-rose-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-rose-700"
            />
            <span>오늘 하루 보지 않기</span>
          </label>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
