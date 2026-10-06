'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { ChevronDown, Sparkles, User, ShieldCheck } from 'lucide-react';

export const TopUtil: React.FC = () => {
  const { user, logout, recentProducts } = useShop();
  const [isCsOpen, setIsCsOpen] = useState(false);

  return (
    <div className="hidden lg:block bg-neutral-100 border-b border-neutral-200/80 text-neutral-600 text-[12px] py-1.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* 좌측 정보 */}
        <div className="flex items-center gap-4 text-neutral-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            당일출고 마감 <strong>14:00</strong>
          </span>
          <span className="text-neutral-300">|</span>
          <Link href="/board/reservation" className="hover:text-neutral-900 transition-colors flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            1:1 피부 맞춤 진단 예약
          </Link>
          {user?.role === 'admin' && (
            <>
              <span className="text-neutral-300">|</span>
              <Link
                href="/admin"
                className="text-rose-600 font-semibold hover:text-rose-700 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                관리자 모드 접속
              </Link>
            </>
          )}
        </div>

        {/* 우측 유틸 메뉴 */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-neutral-900 font-medium flex items-center gap-1">
                <span className="bg-neutral-800 text-white text-[10px] px-1.5 py-0.2 rounded font-bold">
                  {user.tier}
                </span>
                <strong>{user.name}</strong>님
                <span className="text-rose-600 font-semibold ml-1">({user.points.toLocaleString()}P)</span>
              </span>
              <button
                onClick={logout}
                className="hover:text-neutral-900 transition-colors text-neutral-500"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/register" className="hover:text-rose-600 font-medium transition-colors">
                회원가입 (+3,000P)
              </Link>
              <span className="text-neutral-300">|</span>
              <Link href="/login" className="hover:text-neutral-900 transition-colors">
                로그인
              </Link>
            </div>
          )}

          <span className="text-neutral-300">|</span>
          <Link href="/mypage/orders" className="hover:text-neutral-900 transition-colors">
            주문/배송조회
          </Link>

          <span className="text-neutral-300">|</span>
          <Link href="/mypage/wishlist" className="hover:text-neutral-900 transition-colors">
            최근본상품 ({recentProducts.length})
          </Link>

          <span className="text-neutral-300">|</span>

          {/* 고객센터 드롭다운 */}
          <div
            className="relative"
            onMouseEnter={() => setIsCsOpen(true)}
            onMouseLeave={() => setIsCsOpen(false)}
          >
            <button className="flex items-center gap-1 hover:text-neutral-900 transition-colors py-1">
              고객센터
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {isCsOpen && (
              <div className="absolute right-0 top-full pt-1 w-36 z-50">
                <div className="bg-white border border-neutral-200 rounded shadow-lg py-1 text-[12px] text-neutral-700">
                  <Link
                    href="/board/notice"
                    className="block px-3 py-1.5 hover:bg-neutral-50 hover:text-rose-600 transition-colors"
                  >
                    공지사항
                  </Link>
                  <Link
                    href="/cs"
                    className="block px-3 py-1.5 hover:bg-neutral-50 hover:text-rose-600 transition-colors"
                  >
                    자주 묻는 질문(FAQ)
                  </Link>
                  <Link
                    href="/board/qna"
                    className="block px-3 py-1.5 hover:bg-neutral-50 hover:text-rose-600 transition-colors"
                  >
                    질문과 답변 (Q&A)
                  </Link>
                  <Link
                    href="/board/free"
                    className="block px-3 py-1.5 hover:bg-neutral-50 hover:text-rose-600 transition-colors"
                  >
                    자유 게시판 (소통)
                  </Link>
                  <Link
                    href="/board/reservation"
                    className="block px-3 py-1.5 hover:bg-neutral-50 hover:text-rose-600 transition-colors"
                  >
                    피부진단/클래스 예약
                  </Link>
                  <Link
                    href="/mypage/inquiries"
                    className="block px-3 py-1.5 hover:bg-neutral-50 hover:text-rose-600 transition-colors border-t border-neutral-100"
                  >
                    1:1 맞춤 상담
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
