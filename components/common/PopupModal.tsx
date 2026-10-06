'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { X, Sparkles, Gift } from 'lucide-react';

export const PopupModal: React.FC = () => {
  const { popups, isPopupOpen, closePopup } = useShop();

  const activePopup = popups.find((p) => p.isActive);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hideDate = localStorage.getItem('dasseoba_cosmetics_hide_popup_day');
      if (hideDate === new Date().toDateString()) {
        closePopup(false);
      }
    }
  }, []);

  if (!isPopupOpen || !activePopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 animate-in zoom-in-95 duration-200">
        {/* 팝업 이미지 및 콘텐츠 */}
        <Link href={activePopup.linkUrl} onClick={() => closePopup(false)} className="block relative group">
          <div className="relative h-80 w-full overflow-hidden bg-rose-100">
            <img
              src={activePopup.imageUrl}
              alt={activePopup.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="inline-flex items-center gap-1.5 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-2 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" /> 1+1 SPECIAL EVENT
              </span>
              <h3 className="text-xl font-black leading-snug drop-shadow-md">
                {activePopup.title}
              </h3>
              <p className="text-xs text-neutral-200 mt-1 drop-shadow-xs">
                신규 가입 즉시 3,000P 지급 + 인기 스킨케어 본품 1+1 혜택!
              </p>
            </div>
          </div>
        </Link>

        {/* 팝업 하단 제어 바 */}
        <div className="bg-neutral-900 text-white p-3.5 flex items-center justify-between text-xs">
          <button
            onClick={() => closePopup(true)}
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span className="w-3.5 h-3.5 rounded border border-neutral-600 inline-block"></span>
            오늘 하루 보지 않기
          </button>

          <button
            onClick={() => closePopup(false)}
            className="font-bold text-white hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            <span>닫기</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
