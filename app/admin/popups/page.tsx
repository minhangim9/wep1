'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { PopupEvent } from '@/types';
import { Sparkles, Plus, Image as ImageIcon, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminPopupsPage() {
  const { popups, updatePopup, showToast } = useShop();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80');
  const [linkUrl, setLinkUrl] = useState('/category/one-plus-one');

  const toggleActive = (id: string, current: boolean) => {
    updatePopup(id, { isActive: !current });
    showToast(`팝업 노출 상태가 [${!current ? '활성' : '비활성'}]으로 변경되었습니다.`, 'success');
  };

  return (
    <div className="space-y-6 text-xs">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-rose-600" />
            팝업 & 이벤트 관리
          </h1>
          <p className="text-neutral-500 mt-1">
            메인 페이지 모달 팝업 및 기획전 배너의 노출 일시와 활성화를 제어합니다.
          </p>
        </div>
      </div>

      {/* 팝업 카드 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {popups.map((popup) => (
          <div
            key={popup.id}
            className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div className="flex gap-4 p-4">
              <img
                src={popup.imageUrl}
                alt={popup.title}
                className="w-28 h-36 object-cover rounded-xl bg-neutral-100 border border-neutral-200 shrink-0"
              />
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    popup.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {popup.isActive ? '현재 노출중' : '비활성화'}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-neutral-900">{popup.title}</h3>
                <p className="text-neutral-500 text-[11px]">
                  링크 : <span className="font-mono text-neutral-700">{popup.linkUrl}</span>
                </p>
                <p className="text-neutral-400 text-[11px]">
                  기간 : {popup.startDate} ~ {popup.endDate}
                </p>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-neutral-500">팝업 상태 전환</span>
              <button
                onClick={() => toggleActive(popup.id, popup.isActive)}
                className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                  popup.isActive
                    ? 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {popup.isActive ? '노출 중단' : '팝업 활성화'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
