'use client';

import React from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  AlertTriangle,
  Package,
  Truck,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { orders, products, rawMaterials } = useShop();

  // 통계 계산
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.finalPaymentAmount : 0), 0);
  const paidOrdersCount = orders.filter((o) => o.status === 'paid').length;
  const shippedOrdersCount = orders.filter((o) => o.status === 'shipped').length;

  // 완제품 및 원부자재 안전재고 부족 알림
  const lowStockProducts = products.filter((p) => {
    const totalStock = p.options.reduce((sum, opt) => sum + opt.stockQuantity, 0);
    return totalStock <= p.safetyStock;
  });

  const lowStockMaterials = rawMaterials.filter((m) => m.currentStock <= m.safetyStock);

  return (
    <div className="space-y-8">
      {/* 대시보드 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">어드민 대시보드</h1>
          <p className="text-xs text-neutral-500 mt-1">
            다써바 쇼핑몰의 실시간 매출, 주문, 안전재고 현황을 모니터링합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            + 새 상품 등록
          </Link>
          <Link
            href="/admin/orders"
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            발주/주문 관리
          </Link>
        </div>
      </div>

      {/* 4대 주요 지표 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold">
            <span>누적 총 매출액</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-neutral-900">
            {totalRevenue.toLocaleString()}<span className="text-base font-normal">원</span>
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> 전월 대비 +28.4% 상승
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold">
            <span>신규 결제완료 (발주대기)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600">
            {paidOrdersCount}<span className="text-base font-normal">건</span>
          </p>
          <p className="text-[11px] text-neutral-400">당일 14:00 출고 대상</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold">
            <span>현재 배송중</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-neutral-900">
            {shippedOrdersCount}<span className="text-base font-normal">건</span>
          </p>
          <p className="text-[11px] text-blue-600 font-semibold">CJ대한통운 / 우체국</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold">
            <span>안전재고 경고</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">
            {lowStockProducts.length + lowStockMaterials.length}<span className="text-base font-normal">건</span>
          </p>
          <p className="text-[11px] text-amber-600 font-semibold">발주 긴급 필요</p>
        </div>
      </div>

      {/* 2단: 안전재고 부족 경고창 & 최근 주문 현황 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 안전재고 부족 경고 리스트 */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-neutral-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              안전재고 부족 경고 알림
            </h3>
            <Link href="/admin/inventory" className="text-xs font-bold text-rose-600 hover:underline">
              재고/자재관리 바로가기 ›
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {lowStockProducts.length > 0 || lowStockMaterials.length > 0 ? (
              <>
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-neutral-900">[완제품] {p.name}</p>
                      <p className="text-[11px] text-amber-800">
                        현재고 : {p.options.reduce((sum, o) => sum + o.stockQuantity, 0)}개 (안전재고: {p.safetyStock}개)
                      </p>
                    </div>
                    <span className="bg-amber-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                      생산요청
                    </span>
                  </div>
                ))}
                {lowStockMaterials.map((m) => (
                  <div key={m.id} className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-neutral-900">[자재] {m.name} ({m.code})</p>
                      <p className="text-[11px] text-rose-800">
                        현재고 : {m.currentStock}개 (안전재고: {m.safetyStock}개) | 공급사: {m.supplier}
                      </p>
                    </div>
                    <span className="bg-rose-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                      자재발주
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-neutral-400 py-6 text-center">모든 상품 및 원부자재의 재고가 충분합니다.</p>
            )}
          </div>
        </div>

        {/* 실시간 주문 접수 내역 */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-neutral-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-rose-500" />
              최근 주문 접수 현황
            </h3>
            <Link href="/admin/orders" className="text-xs font-bold text-rose-600 hover:underline">
              주문 전체보기 ›
            </Link>
          </div>

          <div className="space-y-3 text-xs divide-y divide-neutral-100">
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="pt-3 first:pt-0 flex items-center justify-between">
                <div>
                  <p className="font-mono font-bold text-neutral-900">{order.orderNumber}</p>
                  <p className="text-neutral-500 text-[11px]">
                    {order.receiverName} ({order.items.length}개 품목) | {order.createdAt}
                  </p>
                </div>
                <div className="text-right">
                  <strong className="text-neutral-900 block">{order.finalPaymentAmount.toLocaleString()}원</strong>
                  <span className="text-[10px] font-bold text-rose-600">{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
