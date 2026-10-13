'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { AdminMenuKey } from '@/types';
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
  ShieldAlert,
  UserCheck,
  Lock,
  KeyRound,
  Smartphone,
  LogOut,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  key: AdminMenuKey;
  superAdminOnly?: boolean;
}

const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: '어드민 대시보드', icon: LayoutDashboard, key: 'dashboard' },
  { href: '/admin/members', label: '회원 관리 (권한/등급)', icon: Users, key: 'members' },
  { href: '/admin/products', label: '상품 등록 & 관리', icon: Package, key: 'products' },
  { href: '/admin/orders', label: '주문 & 발주 관리', icon: ShoppingCart, key: 'orders' },
  { href: '/admin/delivery', label: '배송 & 송장 관리', icon: Truck, key: 'delivery' },
  { href: '/admin/inventory', label: '재고 & 원부자재', icon: Boxes, key: 'inventory' },
  { href: '/admin/tax', label: '세금명세서/영수증', icon: Receipt, key: 'tax' },
  { href: '/admin/popups', label: '팝업 & 이벤트', icon: Sparkles, key: 'popups' },
  { href: '/admin/admins', label: '부관리자 & 권한 관리', icon: UserCheck, key: 'admins', superAdminOnly: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    isMounted,
    hasAdminMenuPermission,
    logout,
    changeSuperAdminPassword,
    adminSendSmsCode,
    adminVerifySmsCode,
  } = useShop();

  // 비밀번호 변경 및 SMS MFA 모달 상태
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [isSmsSent, setIsSmsSent] = useState(false);
  const [smsTimer, setSmsTimer] = useState(180);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // /admin/login 및 /admin/register 경로는 권한 차단 없이 자체 화면 렌더링
  if (pathname === '/admin/login' || pathname === '/admin/register') {
    return <>{children}</>;
  }

  // 관리자 권한 검사 (isMounted 이후 체크)
  if (isMounted && (!user || user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black mb-2">관리자 권한이 필요합니다</h1>
        <p className="text-neutral-400 text-xs max-w-sm mb-6 leading-relaxed">
          이 콘솔은 최고 관리자(Admin) 권한을 가진 계정만 접근할 수 있습니다. Supabase에 등록된 관리자 계정으로 로그인해주세요.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="bg-neutral-800 hover:bg-neutral-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors"
          >
            쇼핑몰 홈으로 이동
          </Link>
          <Link
            href="/admin/login"
            className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-lg shadow-rose-900/40"
          >
            관리자 콘솔 로그인
          </Link>
        </div>
      </div>
    );
  }

  // 요구사항 2: 계정이 승인중지(suspended)된 경우 즉시 차단
  if (isMounted && user && user.adminStatus === 'suspended') {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black mb-2 text-rose-500">계정이 승인중지되었습니다</h1>
        <p className="text-neutral-400 text-xs max-w-md mb-6 leading-relaxed">
          해당 관리자 계정({user.email})은 최고 관리자에 의해 <strong className="text-rose-400">[승인중지]</strong> 처리되어 접근 권한 및 세션이 만료되었습니다.
        </p>
        <button
          onClick={() => {
            logout();
            router.push('/admin/login');
          }}
          className="bg-neutral-800 hover:bg-neutral-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition"
        >
          확인 및 로그인 화면으로 이동
        </button>
      </div>
    );
  }

  // 요구사항 1: 메뉴별 접근 권한(Role) 확인
  const matchedNav = ADMIN_NAV.find((item) => item.href === pathname);
  const isSuperAdmin = user?.adminRole === 'super_admin' || user?.email === 'admin@piuda.kr';
  const hasCurrentMenuPermission = matchedNav ? hasAdminMenuPermission(matchedNav.key) : true;

  // 허용된 내비게이션 메뉴만 사이드바에 표시
  const accessibleNav = ADMIN_NAV.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    return hasAdminMenuPermission(item.key);
  });

  // SMS 인증번호 전송 핸들러
  const handleSendSms = () => {
    const phone = user?.phone || '010-9999-8888';
    adminSendSmsCode(phone);
    setIsSmsSent(true);
    setSmsTimer(180);
    setModalError(null);
  };

  // 비밀번호 변경 처리 (SMS MFA 검증 후)
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSuccess(null);

    if (!currentPassword) {
      setModalError('현재 비밀번호를 입력해주세요.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setModalError('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!mfaCode.trim()) {
      setModalError('휴대폰으로 전송된 SMS 2차 인증번호 6자리를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    // 1. SMS MFA 코드 검증
    const phone = user?.phone || '010-9999-8888';
    const mfaRes = adminVerifySmsCode(phone, mfaCode);
    if (!mfaRes.success) {
      setIsSubmitting(false);
      setModalError(mfaRes.message);
      return;
    }

    // 2. 비밀번호 변경 적용
    const changeRes = await changeSuperAdminPassword(currentPassword, newPassword);
    setIsSubmitting(false);

    if (changeRes.success) {
      setModalSuccess('최고 관리자 비밀번호가 안전하게 변경되었습니다! (해시 암호화 완료)');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMfaCode('');
      setIsSmsSent(false);
      setTimeout(() => {
        setIsSecurityModalOpen(false);
        setModalSuccess(null);
      }, 1800);
    } else {
      setModalError(changeRes.error || '비밀번호 변경에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col lg:flex-row text-neutral-900">
      {/* 관리자 좌측 사이드바 */}
      <aside className="w-full lg:w-64 bg-neutral-900 text-white flex flex-col justify-between shrink-0 shadow-xl">
        <div className="p-6">
          {/* 어드민 로고 */}
          <div className="flex items-center gap-2.5 pb-6 border-b border-neutral-800">
            <img src="/logo.jpg" alt="아빠사랑 로고" className="h-9 w-auto object-contain rounded-lg shadow-xs" />
            <div>
              <h2 className="font-black text-sm tracking-tight text-white">아빠사랑 피우다</h2>
              <span className="text-[10px] text-rose-400 font-mono font-bold">ADMIN CONSOLE</span>
            </div>
          </div>

          {/* 내비게이션 메뉴 (권한 기반 필터링) */}
          <nav className="mt-6 space-y-1 text-xs font-semibold">
            {accessibleNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-rose-600 text-white font-bold shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.superAdminOnly && (
                    <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-mono font-bold">
                      SUPER
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 사이드바 푸터 & 관리자 계정 상태 */}
        <div className="p-6 border-t border-neutral-800 space-y-3">
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${user?.adminStatus === 'suspended' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                {user?.name || '관리자'}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${isSuperAdmin ? 'bg-rose-500/20 text-rose-400' : 'bg-neutral-700 text-neutral-300'}`}>
                {isSuperAdmin ? '최고관리자' : '부관리자'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono truncate">{user?.email}</p>

            {/* 최고 관리자 보안 설정 (SMS MFA & 비밀번호 변경 버튼) */}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => {
                  setIsSecurityModalOpen(true);
                  setModalError(null);
                  setModalSuccess(null);
                }}
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-rose-300 hover:text-rose-200 text-[11px] font-bold py-1.5 px-2.5 rounded-lg transition cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>비밀번호 변경 & MFA 설정</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold py-2.5 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 쇼핑몰 홈
            </Link>
            <button
              onClick={() => {
                logout();
                router.push('/admin/login');
              }}
              title="로그아웃"
              className="p-2.5 bg-neutral-800 hover:bg-rose-600/80 text-neutral-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 메인 어드민 작업 영역 (메뉴별 접근 권한 가드) */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
        {!hasCurrentMenuPermission ? (
          <div className="bg-white rounded-3xl p-10 border border-neutral-200 shadow-sm text-center max-w-lg mx-auto mt-12 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-neutral-900">메뉴 접근 권한이 없습니다</h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              현재 로그인된 계정은 <strong className="text-neutral-800">[{matchedNav?.label}]</strong> 메뉴에 대한 접근 권한(Role)이 부여되지 않았습니다.
              권한이 필요하신 경우 최고 관리자(Super Admin)에게 권한 승인을 요청해주세요.
            </p>
            <div className="pt-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition"
              >
                <LayoutDashboard className="w-4 h-4" /> 대시보드로 돌아가기
              </Link>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      {/* 최고 관리자 비밀번호 변경 및 SMS 2차 인증(MFA) 모달 */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden">
            {/* 모달 헤더 */}
            <div className="bg-neutral-950 text-white p-6 relative">
              <button
                onClick={() => setIsSecurityModalOpen(false)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold mb-1">
                <Lock className="w-4 h-4" />
                <span>최고 관리자 계정 보안 센터</span>
              </div>
              <h3 className="text-lg font-black text-white">대표 계정 비밀번호 변경 & 2차 인증</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                안전을 위해 등록된 대표 휴대폰 SMS 2차 인증(MFA)이 필수로 요구됩니다.
              </p>
            </div>

            {/* 모달 본문 */}
            <form onSubmit={handleChangePasswordSubmit} className="p-6 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{modalError}</span>
                </div>
              )}
              {modalSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{modalSuccess}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-neutral-800 mb-1">현재 비밀번호</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="현재 비밀번호 입력"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">새 비밀번호 (해시 암호화 저장)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="최소 6자 이상 영문/숫자 포함"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">새 비밀번호 확인</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="새 비밀번호 재입력"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                />
              </div>

              {/* 휴대폰 SMS 2차 인증 영역 */}
              <div className="pt-2 border-t border-neutral-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-rose-600" />
                    휴대폰 SMS 2차 인증(MFA)
                  </label>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {user?.phone || '010-9999-8888'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="인증번호 6자리"
                    className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-mono tracking-widest focus:bg-white focus:border-rose-500 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleSendSms}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs whitespace-nowrap transition cursor-pointer"
                  >
                    {isSmsSent ? '인증번호 재전송' : '인증번호 발송'}
                  </button>
                </div>
                {isSmsSent && (
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    인증번호가 발송되었습니다. (테스트 프리셋: 123456 또는 알림창 코드)
                  </p>
                )}
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSecurityModalOpen(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-3 rounded-xl transition cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? '암호화 및 변경 중...' : '비밀번호 변경 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
