'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { INITIAL_CATEGORIES } from '@/lib/mockData';
import { TopBanner } from './TopBanner';
import { TopUtil } from './TopUtil';
import { QuickSearch } from './QuickSearch';
import { MobileDrawer } from './MobileDrawer';
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  Sparkles,
  Flame,
  ChevronDown,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { cart, user } = useShop();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <TopBanner />
      <TopUtil />

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            {/* 좌측 모바일 햄버거 & 로고 */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="lg:hidden p-2 text-neutral-800 hover:text-rose-600 transition-colors"
                aria-label="전체 메뉴 열기"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link href="/" className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 flex items-center gap-1.5">
                  다써바<span className="text-rose-500 font-serif text-xl sm:text-2xl">.</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-semibold tracking-widest -mt-1 uppercase">
                  DASSEOBA BEAUTY
                </span>
              </Link>
            </div>

            {/* 중앙 GNB 카테고리 내비게이션 (PC 전용 3단계 메가 드롭다운) */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {INITIAL_CATEGORIES.map((cat) => {
                const isSpecial = cat.slug === 'one-plus-one';
                const hasChildren = cat.children && cat.children.length > 0;

                return (
                  <div
                    key={cat.id}
                    className="relative group py-6"
                    onMouseEnter={() => setHoveredCategory(cat.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <Link
                      href={`/category/${cat.slug}`}
                      className={`px-3 py-2 text-sm font-bold transition-colors flex items-center gap-1 rounded-md ${
                        isSpecial
                          ? 'text-rose-600 hover:text-rose-700 bg-rose-50/80 hover:bg-rose-100/80'
                          : 'text-neutral-800 hover:text-rose-600 hover:bg-neutral-50'
                      }`}
                    >
                      {isSpecial && <Flame className="w-4 h-4 text-rose-500 fill-rose-500 animate-bounce" />}
                      <span>{cat.name}</span>
                      {hasChildren && <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-500 transition-transform group-hover:rotate-180" />}
                    </Link>

                    {/* 메가 드롭다운 메뉴 (2단, 3단) */}
                    {hasChildren && (
                      <div className="absolute left-0 top-full hidden group-hover:block w-72 bg-white border border-neutral-200 rounded-xl shadow-xl py-3 px-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="space-y-1">
                          {cat.children?.map((sub) => (
                            <div key={sub.id} className="p-2 hover:bg-neutral-50 rounded-lg transition-colors group/sub">
                              <Link
                                href={`/category/${sub.slug}`}
                                className="text-xs font-bold text-neutral-800 hover:text-rose-600 flex items-center justify-between"
                              >
                                <span>{sub.name}</span>
                                {sub.children && <span className="text-[10px] text-neutral-400 font-normal">더보기 ›</span>}
                              </Link>

                              {/* 3단계 서브메뉴 */}
                              {sub.children && (
                                <div className="mt-1.5 pl-2 border-l-2 border-rose-100 space-y-1">
                                  {sub.children.map((third) => (
                                    <Link
                                      key={third.id}
                                      href={`/category/${third.slug}`}
                                      className="block text-[11px] text-neutral-500 hover:text-rose-600 hover:font-medium transition-colors"
                                    >
                                      {third.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* 우측 아이콘 액션 메뉴 */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* 퀵 검색 버튼 */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-neutral-700 hover:text-rose-600 hover:bg-neutral-100 rounded-full transition-colors relative"
                aria-label="상품 검색"
              >
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* 마이페이지 링크 */}
              <Link
                href="/mypage"
                className="p-2 text-neutral-700 hover:text-rose-600 hover:bg-neutral-100 rounded-full transition-colors relative"
                aria-label="마이페이지"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>

              {/* 장바구니 링크 & 실시간 뱃지 */}
              <Link
                href="/cart"
                className="p-2 text-neutral-700 hover:text-rose-600 hover:bg-neutral-100 rounded-full transition-colors relative"
                aria-label="장바구니"
              >
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                {totalCartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-scale-in">
                    {totalCartCount > 99 ? '99+' : totalCartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 모달 및 드로어 */}
      <QuickSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
