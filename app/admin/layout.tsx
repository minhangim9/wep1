'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Truck,
  Boxes,
  Receipt,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin', label: '어드민 대시보드', icon: LayoutDashboard },
  { href: '/admin/members', label: '회원 & 등급 관리', icon: Users },
  { href: '/admin/products', label: '상품 등록 & 관리', icon: Package },
  { href: '/admin/orders', label: '주문 & 발주 관리', icon: ShoppingCart },
  { href: '/admin/delivery', label: '배송 & 송장 관리', icon: Truck },
  { href: '/admin/inventory', label: '재고 & 원부자재', icon: Boxes },
  { href: '/admin/tax', label: '세금명세서/영수증', icon: Receipt },
  { href: '/admin/popups', label: '팝업 & 이벤트', icon: Sparkles },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useShop();

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col lg:flex-row text-neutral-900">
      {/* 관리자 좌측 사이드바 */}
      <aside className="w-full lg:w-64 bg-neutral-900 text-white flex flex-col justify-between shrink-0 shadow-xl">
        <div className="p-6">
          {/* 어드민 로고 */}
          <div className="flex items-center gap-2.5 pb-6 border-b border-neutral-800">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center font-black text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-sm tracking-tight">다써바 통합관리자</h2>
              <span className="text-[10px] text-rose-400 font-mono font-bold">ADMIN CONSOLE</span>
            </div>
          </div>

          {/* 내비게이션 메뉴 */}
          <nav className="mt-6 space-y-1 text-xs font-semibold">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-rose-600 text-white font-bold shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 사이드바 푸터 */}
        <div className="p-6 border-t border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>접속자 : <strong className="text-white">{user?.name || '관리자'}</strong></span>
            <span className="bg-rose-500/20 text-rose-400 text-[10px] px-2 py-0.5 rounded font-bold">SUPER</span>
          </div>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold py-2.5 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 쇼핑몰 메인으로 이동
          </Link>
        </div>
      </aside>

      {/* 메인 어드민 작업 영역 */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
