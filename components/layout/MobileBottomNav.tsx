'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { QuickSearch } from './QuickSearch';
import { MobileDrawer } from './MobileDrawer';
import {
  Menu,
  Search,
  Home,
  User,
  ShoppingBag,
  ArrowUp,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { cart } = useShop();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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

  return (
    <>
      {/* 모바일 하단 고정 탭바 */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-lg px-2 py-1.5 flex items-center justify-around text-neutral-600">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 text-neutral-600 hover:text-rose-600 transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">카테고리</span>
        </button>

        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 text-neutral-600 hover:text-rose-600 transition-colors"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">검색</span>
        </button>

        <Link
          href="/"
          className={`flex flex-col items-center justify-center p-1.5 transition-colors ${
            pathname === '/' ? 'text-rose-600 font-bold' : 'text-neutral-600 hover:text-rose-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">홈</span>
        </Link>

        <Link
          href="/mypage"
          className={`flex flex-col items-center justify-center p-1.5 transition-colors ${
            pathname.startsWith('/mypage') ? 'text-rose-600 font-bold' : 'text-neutral-600 hover:text-rose-600'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">마이</span>
        </Link>

        <Link
          href="/cart"
          className={`flex flex-col items-center justify-center p-1.5 relative transition-colors ${
            pathname === '/cart' ? 'text-rose-600 font-bold' : 'text-neutral-600 hover:text-rose-600'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">장바구니</span>
          {totalCartCount > 0 && (
            <span className="absolute top-0.5 right-2 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalCartCount}
            </span>
          )}
        </Link>

        {showTopBtn && (
          <button
            onClick={scrollToTop}
            className="flex flex-col items-center justify-center p-1.5 text-neutral-800 hover:text-rose-600 transition-colors animate-in fade-in duration-150"
            aria-label="맨 위로"
          >
            <ArrowUp className="w-5 h-5 text-rose-500" />
            <span className="text-[10px] font-medium mt-0.5 text-rose-500 font-bold">TOP</span>
          </button>
        )}
      </nav>

      {/* 퀵서치 및 드로어 모달 */}
      <QuickSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
