'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { INITIAL_CATEGORIES } from '@/lib/mockData';
import {
  X,
  User,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Sparkles,
  Heart,
  MessageSquare,
  Calendar,
  Headphones,
  FileText,
  ShieldCheck,
  Flame,
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, logout, wishlist, cart, openAuthModal } = useShop();
  const [activeTab, setActiveTab] = useState<'category' | 'community'>('category');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'cat-skincare': true,
    'cat-one-plus-one': true,
  });

  if (!isOpen) return null;

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* 사이드 드로어 본체 */}
      <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250">
        {/* 드로어 헤더 */}
        <div className="p-3.5 bg-neutral-900 text-white flex items-center justify-between">
          <Link href="/" onClick={onClose} className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg">
            <img src="/logo.jpg" alt="아빠사랑 로고" className="h-7 w-auto object-contain" />
            <span className="font-black text-xs text-neutral-900 tracking-tight">피우다 Piuda</span>
          </Link>
          <button onClick={onClose} className="p-1 hover:bg-neutral-800 rounded-full text-neutral-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 유저 상태 카드 */}
        <div className="p-4 bg-neutral-50 border-b border-neutral-200" suppressHydrationWarning>
          {user ? (
            <div suppressHydrationWarning>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold" suppressHydrationWarning>
                    {user.tier}
                  </span>
                  <span className="font-bold text-neutral-900" suppressHydrationWarning>{user.name}님</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="text-xs text-neutral-400 hover:text-neutral-700"
                >
                  로그아웃
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-neutral-200 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[11px]">적립 포인트</span>
                  <strong className="text-rose-600 font-bold text-sm">
                    {user.points.toLocaleString()} P
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">피부 타입</span>
                  <strong className="text-neutral-800 font-bold text-sm">
                    {user.skinType || '설정 필요'}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-neutral-600 mb-3">
                로그인하고 <strong>신규가입 3,000P 혜택</strong>을 받으세요!
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    openAuthModal('login');
                  }}
                  className="bg-neutral-900 text-white text-xs font-semibold py-2 rounded text-center hover:bg-neutral-800 cursor-pointer"
                >
                  로그인
                </button>
                <button
                  onClick={() => {
                    onClose();
                    openAuthModal('register');
                  }}
                  className="bg-rose-500 text-white text-xs font-semibold py-2 rounded text-center hover:bg-rose-600 cursor-pointer"
                >
                  회원가입 (+3,000P)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 탭 전환: 카테고리 vs 커뮤니티 */}
        <div className="flex border-b border-neutral-200 text-sm font-semibold text-center">
          <button
            onClick={() => setActiveTab('category')}
            className={`flex-1 py-3 border-b-2 transition-colors ${
              activeTab === 'category'
                ? 'border-neutral-900 text-neutral-900 bg-white'
                : 'border-transparent text-neutral-400 bg-neutral-50'
            }`}
          >
            상품 카테고리
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex-1 py-3 border-b-2 transition-colors ${
              activeTab === 'community'
                ? 'border-neutral-900 text-neutral-900 bg-white'
                : 'border-transparent text-neutral-400 bg-neutral-50'
            }`}
          >
            커뮤니티 / 고객센터
          </button>
        </div>

        {/* 탭 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === 'category' ? (
            <div className="space-y-1">
              {INITIAL_CATEGORIES.map((cat) => {
                const isExpanded = expandedCategories[cat.id];
                const hasChildren = cat.children && cat.children.length > 0;
                const isSpecial = cat.slug === 'one-plus-one';

                return (
                  <div key={cat.id} className="border-b border-neutral-100 last:border-0 pb-1">
                    <div className="flex items-center justify-between py-2">
                      <Link
                        href={`/category/${cat.slug}`}
                        onClick={onClose}
                        className={`font-semibold text-sm flex items-center gap-1.5 ${
                          isSpecial ? 'text-rose-600 font-bold' : 'text-neutral-800 hover:text-rose-600'
                        }`}
                      >
                        {isSpecial && <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />}
                        {cat.name}
                      </Link>
                      {hasChildren && (
                        <button
                          onClick={() => toggleCategory(cat.id)}
                          className="p-1 text-neutral-400 hover:text-neutral-700"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* 2단계 및 3단계 서브 카테고리 */}
                    {hasChildren && isExpanded && (
                      <div className="pl-3 py-1 space-y-1 bg-neutral-50/60 rounded-md">
                        {cat.children?.map((sub) => (
                          <div key={sub.id} className="py-1">
                            <Link
                              href={`/category/${sub.slug}`}
                              onClick={onClose}
                              className="text-xs text-neutral-600 hover:text-rose-600 block py-0.5"
                            >
                              • {sub.name}
                            </Link>
                            {sub.children && (
                              <div className="pl-3 space-y-0.5 mt-0.5">
                                {sub.children.map((third) => (
                                  <Link
                                    key={third.id}
                                    href={`/category/${third.slug}`}
                                    onClick={onClose}
                                    className="text-[11px] text-neutral-500 hover:text-neutral-900 block"
                                  >
                                    - {third.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <Link
                href="/board/notice"
                onClick={onClose}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-neutral-100 text-neutral-700 font-medium"
              >
                <FileText className="w-4 h-4 text-neutral-500" /> 공지사항
              </Link>
              <Link
                href="/board/free"
                onClick={onClose}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-neutral-100 text-neutral-700 font-medium"
              >
                <MessageSquare className="w-4 h-4 text-emerald-500" /> 뷰티 자유게시판 (소통)
              </Link>
              <Link
                href="/board/qna"
                onClick={onClose}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-neutral-100 text-neutral-700 font-medium"
              >
                <Sparkles className="w-4 h-4 text-amber-500" /> 상품 Q&A 게시판
              </Link>
              <Link
                href="/board/reservation"
                onClick={onClose}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-neutral-100 text-neutral-700 font-medium"
              >
                <Calendar className="w-4 h-4 text-rose-500" /> 피부 진단 / 클래스 예약
              </Link>
              <Link
                href="/cs"
                onClick={onClose}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-neutral-100 text-neutral-700 font-medium border-t border-neutral-100 pt-3"
              >
                <Headphones className="w-4 h-4 text-blue-500" /> 고객센터 FAQ
              </Link>
              <Link
                href="/mypage"
                onClick={onClose}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-neutral-100 text-neutral-900 font-bold border-t border-neutral-100 pt-3"
              >
                <User className="w-4 h-4 text-rose-500" /> 마이페이지 홈
              </Link>
              <Link
                href="/mypage/subscriptions"
                onClick={onClose}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-neutral-100 text-neutral-700 font-medium"
              >
                <Sparkles className="w-4 h-4 text-emerald-500" /> 화장품 정기배송(구독) 관리
              </Link>
              <Link
                href="/mypage/reviews"
                onClick={onClose}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-neutral-100 text-neutral-700 font-medium"
              >
                <Sparkles className="w-4 h-4 text-amber-500" /> 나의 리뷰 관리 (+1,500P)
              </Link>
              <Link
                href="/mypage/inquiries"
                onClick={onClose}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-neutral-100 text-neutral-700 font-medium"
              >
                <MessageSquare className="w-4 h-4 text-indigo-500" /> 1:1 맞춤 상담
              </Link>
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-neutral-100 hover:bg-rose-50 text-neutral-800 hover:text-rose-700 font-bold border border-neutral-200 hover:border-rose-200 mt-3 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-rose-600" /> 관리자 페이지 바로가기
                </Link>
              )}
            </div>
          )}
        </div>

        {/* 드로어 푸터 */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-200 text-xs text-neutral-600">
          <p className="font-bold text-neutral-900">아빠사랑 피우다 고객만족센터</p>
          <p className="text-rose-600 font-bold text-base mt-0.5">1588-0000</p>
          <p className="text-[11px] text-neutral-500">평일 09:30 ~ 18:00 (점심 12:30 ~ 13:30)</p>
          <a
            href="https://pf.kakao.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-center bg-[#FEE500] text-[#3C1E1E] font-bold py-2 rounded-md hover:bg-[#FDD835] transition-colors"
          >
            카카오톡 1초 실시간 상담
          </a>
        </div>
      </div>
    </div>
  );
};
