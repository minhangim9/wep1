'use client';

import React from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { ChevronRight, Sparkles, PlusCircle, MinusCircle, Gift } from 'lucide-react';

export default function PointsPage() {
  const { user, pointLogs } = useShop();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 빵부스러기 */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition-colors">홈</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/mypage" className="hover:text-neutral-900 transition-colors">마이페이지</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold">포인트 / 적립금 내역</span>
      </nav>

      {/* 보유 포인트 요약 카드 */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> 나의 뷰티 마일리지
          </span>
          <h1 className="text-3xl sm:text-4xl font-black">
            {user?.points.toLocaleString() || 0} <span className="text-xl font-normal">P</span>
          </h1>
          <p className="text-xs text-rose-100">
            1P = 1원으로 주문 결제 시 현금처럼 사용 가능 (최대 50%까지)
          </p>
        </div>
      </div>

      {/* 포인트 적립 가이드 */}
      <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <strong className="text-neutral-900 block font-bold">🎁 신규 회원가입</strong>
          <p className="text-rose-600 font-bold text-sm">+3,000 P</p>
          <p className="text-neutral-500 text-[11px]">가입 즉시 자동 지급</p>
        </div>
        <div className="space-y-1">
          <strong className="text-neutral-900 block font-bold">📸 포토 후기 작성</strong>
          <p className="text-rose-600 font-bold text-sm">+1,500 P</p>
          <p className="text-neutral-500 text-[11px]">일반 텍스트 리뷰는 +500P</p>
        </div>
        <div className="space-y-1">
          <strong className="text-neutral-900 block font-bold">💳 결제금액 적립</strong>
          <p className="text-rose-600 font-bold text-sm">2% ~ 5%</p>
          <p className="text-neutral-500 text-[11px]">회원 등급별 차등 적립</p>
        </div>
      </div>

      {/* 포인트 변동 히스토리 */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-neutral-900">포인트 적립 / 사용 히스토리</h3>

        <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden shadow-xs">
          {pointLogs && pointLogs.length > 0 ? (
            pointLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {log.amount > 0 ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <PlusCircle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                      <MinusCircle className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-neutral-900">{log.reason}</p>
                    <span className="text-[10px] text-neutral-400">{log.createdAt}</span>
                  </div>
                </div>

                <div className="text-right">
                  <strong className={`text-sm font-black ${log.amount > 0 ? 'text-emerald-600' : 'text-neutral-900'}`}>
                    {log.amount > 0 ? `+${log.amount.toLocaleString()}` : log.amount.toLocaleString()} P
                  </strong>
                  <span className="text-[10px] text-neutral-400 block">잔액 {log.balanceAfter.toLocaleString()} P</span>
                </div>
              </div>
            ))
          ) : (
            <p className="p-8 text-center text-neutral-400 text-xs">포인트 변동 내역이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
