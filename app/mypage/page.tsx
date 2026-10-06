'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { SkinType } from '@/types';
import {
  User,
  ShoppingBag,
  CreditCard,
  Truck,
  Package,
  RotateCcw,
  Sparkles,
  Heart,
  MessageSquare,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Settings,
} from 'lucide-react';

export default function MyPageDashboard() {
  const router = useRouter();
  const { user, orders, wishlist, coupons, updateUserSkinType } = useShop();
  const [skinTypeSelect, setSkinTypeSelect] = useState<SkinType>(user?.skinType || '복합성');

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <User className="w-12 h-12 text-neutral-300 mx-auto" />
        <h2 className="text-xl font-black text-neutral-900">로그인이 필요합니다</h2>
        <p className="text-xs text-neutral-500">
          마이페이지를 확인하시려면 로그인해주세요.
        </p>
        <Link
          href="/login"
          className="inline-block bg-neutral-900 text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-neutral-800"
        >
          로그인 페이지로 이동
        </Link>
      </div>
    );
  }

  // 주문 상태별 카운트
  const pendingCount = orders.filter((o) => o.status === 'pending_payment').length;
  const paidCount = orders.filter((o) => o.status === 'paid').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const shippedCount = orders.filter((o) => o.status === 'shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const availableCoupons = coupons.filter((c) => !c.isUsed).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 빵부스러기 */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition-colors">홈</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold">마이페이지</span>
      </nav>

      {/* 1. 회원 프로필 & 혜택 요약 카드 */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* 좌측 유저 정보 */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-rose-500 text-white font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
              {user.name[0]}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-rose-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {user.tier} 등급
                </span>
                <h1 className="text-xl sm:text-2xl font-black">{user.name}님</h1>
              </div>
              <p className="text-xs text-neutral-400">{user.email}</p>
            </div>
          </div>

          {/* 우측 포인트, 쿠폰, 피부타입 카드 */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <Link
              href="/mypage/points"
              className="bg-white/10 hover:bg-white/20 p-3.5 rounded-2xl backdrop-blur-xs transition-colors"
            >
              <span className="text-neutral-400 block text-[11px]">보유 포인트</span>
              <strong className="text-rose-400 font-black text-base sm:text-lg">
                {user.points.toLocaleString()} P
              </strong>
            </Link>

            <Link
              href="/mypage/coupons"
              className="bg-white/10 hover:bg-white/20 p-3.5 rounded-2xl backdrop-blur-xs transition-colors"
            >
              <span className="text-neutral-400 block text-[11px]">할인 쿠폰</span>
              <strong className="text-white font-black text-base sm:text-lg">
                {availableCoupons} 장
              </strong>
            </Link>

            <Link
              href="/mypage/wishlist"
              className="bg-white/10 hover:bg-white/20 p-3.5 rounded-2xl backdrop-blur-xs transition-colors"
            >
              <span className="text-neutral-400 block text-[11px]">찜한 상품</span>
              <strong className="text-white font-black text-base sm:text-lg">
                {wishlist.length} 개
              </strong>
            </Link>
          </div>
        </div>

        {/* 피부타입 빠른 변경 바 */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>
              현재 등록된 피부타입 : <strong className="text-rose-400">{user.skinType || '미설정'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={skinTypeSelect}
              onChange={(e) => {
                const val = e.target.value as SkinType;
                setSkinTypeSelect(val);
                updateUserSkinType(val);
              }}
              className="bg-neutral-800 text-white border border-neutral-700 rounded-lg px-3 py-1.5 text-xs cursor-pointer"
            >
              <option value="민감성">민감성 (진정 케어)</option>
              <option value="건성">건성 (고보습 케어)</option>
              <option value="지성">지성 (피지 조절)</option>
              <option value="복합성">복합성 (유수분 밸런스)</option>
              <option value="약건성">약건성</option>
              <option value="중성">중성</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. 주문/배송 진행 현황 (5단계 프로세스) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-neutral-900">주문 / 배송 진행 현황</h3>
          <Link
            href="/mypage/orders"
            className="text-xs font-semibold text-neutral-500 hover:text-rose-600 flex items-center gap-1"
          >
            전체 주문내역 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center text-xs pt-2">
          <div className="space-y-1">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-700 font-bold text-sm">
              {pendingCount}
            </div>
            <p className="text-neutral-600 font-medium">입금대기</p>
          </div>
          <div className="space-y-1">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
              {paidCount}
            </div>
            <p className="text-neutral-900 font-bold">결제완료</p>
          </div>
          <div className="space-y-1">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-700 font-bold text-sm">
              {preparingCount}
            </div>
            <p className="text-neutral-600 font-medium">배송준비</p>
          </div>
          <div className="space-y-1">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              {shippedCount}
            </div>
            <p className="text-neutral-900 font-bold">배송중</p>
          </div>
          <div className="space-y-1">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              {deliveredCount}
            </div>
            <p className="text-neutral-900 font-bold">배송완료</p>
          </div>
        </div>
      </div>

      {/* 3. 마이페이지 퀵 서브 메뉴 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold">
        <Link
          href="/mypage/orders"
          className="bg-neutral-50 hover:bg-neutral-100 p-5 rounded-2xl border border-neutral-200 transition-colors flex flex-col items-center gap-2 text-neutral-800"
        >
          <Package className="w-6 h-6 text-rose-500" />
          <span>나의 주문/취소/반품</span>
        </Link>
        <Link
          href="/mypage/wishlist"
          className="bg-neutral-50 hover:bg-neutral-100 p-5 rounded-2xl border border-neutral-200 transition-colors flex flex-col items-center gap-2 text-neutral-800"
        >
          <Heart className="w-6 h-6 text-rose-500" />
          <span>찜한 화장품 ({wishlist.length})</span>
        </Link>
        <Link
          href="/mypage/inquiries"
          className="bg-neutral-50 hover:bg-neutral-100 p-5 rounded-2xl border border-neutral-200 transition-colors flex flex-col items-center gap-2 text-neutral-800"
        >
          <MessageSquare className="w-6 h-6 text-rose-500" />
          <span>1:1 문의 내역</span>
        </Link>
        <Link
          href="/board/reservation"
          className="bg-neutral-50 hover:bg-neutral-100 p-5 rounded-2xl border border-neutral-200 transition-colors flex flex-col items-center gap-2 text-neutral-800"
        >
          <Sparkles className="w-6 h-6 text-rose-500" />
          <span>피부 진단 예약 확인</span>
        </Link>
      </div>

      {/* 4. 최근 주문 내역 */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-4">
        <h3 className="text-base font-black text-neutral-900">최근 주문 내역</h3>
        {orders.length > 0 ? (
          <div className="space-y-4 divide-y divide-neutral-100">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} className="pt-4 first:pt-0 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-neutral-900">{order.orderNumber}</span>
                    <span className="text-neutral-400 ml-2">{order.createdAt}</span>
                  </div>
                  <span className="bg-rose-50 text-rose-700 font-bold px-2.5 py-1 rounded-full text-[11px] border border-rose-200">
                    {order.status === 'paid' && '결제완료'}
                    {order.status === 'shipped' && '배송중'}
                    {order.status === 'delivered' && '배송완료'}
                    {order.status === 'cancelled' && '주문취소'}
                    {order.status === 'refund_requested' && '환불접수'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-neutral-700">
                      <span>{item.productName} ({item.quantity}개)</span>
                      <strong className="text-neutral-900">{item.totalPrice.toLocaleString()}원</strong>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-1">
                  <Link
                    href="/mypage/orders"
                    className="text-[11px] font-bold text-neutral-900 hover:text-rose-600 underline"
                  >
                    주문 상세 및 취소/환불 신청 ›
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-neutral-400 text-xs">최근 주문 내역이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
