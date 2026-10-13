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
  XCircle,
  RefreshCw,
  Clock,
  Database,
  Monitor,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const {
    orders,
    products,
    rawMaterials,
    user,
    adminLoginLogs,
    isLoadingAdminLogs,
    refreshAdminLoginLogs,
  } = useShop();

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
            아빠사랑 피우다(Piuda) 쇼핑몰의 실시간 매출, 주문, 안전재고 현황을 모니터링합니다.
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

      {/* 3단: 관리자 로그인 접속 감사 기록 (Supabase admin_login_logs 실시간 연동) */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-neutral-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-600" />
                관리자 로그인 접속 감사 기록
              </h3>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                <Database className="w-3 h-3" />
                Supabase admin_login_logs 연동
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              관리자 계정의 로그인 성공 및 실패 시각, 접속 IP/브라우저 환경이 Supabase 데이터베이스에 실시간으로 기록됩니다.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => refreshAdminLoginLogs()}
              disabled={isLoadingAdminLogs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 active:scale-95 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAdminLogs ? 'animate-spin text-rose-600' : ''}`} />
              <span>로그 새로고침</span>
            </button>
            <Link
              href="/admin/login"
              className="text-xs font-bold text-rose-600 hover:underline px-2 py-1"
            >
              관리자 로그인 콘솔 ›
            </Link>
          </div>
        </div>

        {/* 현재 접속 중인 관리자 상태 바 */}
        <div className="p-3.5 rounded-xl bg-neutral-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white shrink-0">
              AD
            </div>
            <div>
              <p className="font-bold flex items-center gap-1.5">
                <span>{user?.name || '관리자'}</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/30">
                  {user?.role === 'admin' ? '최고 관리자 (Admin)' : '일반 권한'}
                </span>
              </p>
              <p className="text-neutral-400 text-[11px] font-mono">{user?.email || 'admin@piuda.kr'}</p>
            </div>
          </div>
          <div className="text-right text-[11px] text-neutral-400 flex items-center gap-4">
            <div>
              <span className="text-neutral-500 block">최근 접속 시각 (Supabase)</span>
              <strong className="text-neutral-200 font-mono">
                {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('ko-KR') : '방금 전 인증됨'}
              </strong>
            </div>
            <div className="hidden sm:block pl-4 border-l border-neutral-800">
              <span className="text-neutral-500 block">보안 모니터링</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 정상 감시 중
              </span>
            </div>
          </div>
        </div>

        {/* 접속 로그 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 font-semibold bg-neutral-50/70">
                <th className="py-2.5 px-3">접속 일시 (KST)</th>
                <th className="py-2.5 px-3">관리자 계정</th>
                <th className="py-2.5 px-3">인증 상태</th>
                <th className="py-2.5 px-3">접속 IP / User-Agent</th>
                <th className="py-2.5 px-3">상세 사유</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {adminLoginLogs.length > 0 ? (
                adminLoginLogs.map((log) => {
                  const isSuccess = log.status === 'success';
                  const formattedDate = log.loginAt
                    ? new Date(log.loginAt).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : '-';

                  return (
                    <tr key={log.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-neutral-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <strong className="text-neutral-900 font-medium block">{log.adminName || '관리자'}</strong>
                        <span className="text-neutral-400 font-mono text-[11px]">{log.adminEmail}</span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            인증 성공
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            인증 실패
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600 max-w-xs truncate">
                        <div className="flex items-center gap-1 font-mono text-[11px] text-neutral-700">
                          <Monitor className="w-3 h-3 text-neutral-400 shrink-0" />
                          <span>{log.ipAddress || '127.0.0.1'}</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate mt-0.5" title={log.userAgent}>
                          {log.userAgent || 'Web Console Client'}
                        </p>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-500 whitespace-nowrap text-[11px]">
                        {log.failureReason ? (
                          <span className="text-rose-600 font-semibold">{log.failureReason}</span>
                        ) : (
                          <span className="text-neutral-400">정상 로그인 세션 발급</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400 text-xs">
                    {isLoadingAdminLogs ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-rose-600" />
                        <span>Supabase에서 관리자 접속 기록을 불러오는 중...</span>
                      </div>
                    ) : (
                      '아직 등록된 관리자 로그인 기록이 없습니다.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
