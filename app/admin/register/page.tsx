'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { AdminMenuKey, AdminRoleType } from '@/types';
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Database,
  Building,
} from 'lucide-react';

interface MenuOption {
  key: AdminMenuKey;
  label: string;
  desc: string;
}

const MENU_OPTIONS: MenuOption[] = [
  { key: 'dashboard', label: '어드민 대시보드', desc: '매출, 안전재고 현황 모니터링' },
  { key: 'members', label: '회원 & 등급 관리', desc: '회원 목록, 등급(VIP/GOLD), 적립금' },
  { key: 'products', label: '상품 등록 & 관리', desc: '화장품 신규 등록, 1+1 설정' },
  { key: 'orders', label: '주문 & 발주 관리', desc: '실시간 주문 접수, 발주 대기 처리' },
  { key: 'delivery', label: '배송 & 송장 관리', desc: '택배사 송장 등록, 실시간 배송 추적' },
  { key: 'inventory', label: '재고 & 원부자재', desc: '용기/단상자/원료 재고 수불 관리' },
  { key: 'tax', label: '세금명세서/영수증', desc: '전자세금계산서 및 영수증 발행' },
  { key: 'popups', label: '팝업 & 이벤트', desc: '쇼핑몰 공지 팝업, 특가 이벤트' },
];

// 직무 프리셋
const DEPT_PRESETS: { [dept: string]: AdminMenuKey[] } = {
  logistics: ['dashboard', 'orders', 'delivery', 'tax'],
  md: ['dashboard', 'products', 'inventory', 'popups'],
  cs: ['dashboard', 'members', 'orders', 'delivery'],
  all: ['dashboard', 'members', 'products', 'orders', 'delivery', 'inventory', 'tax', 'popups'],
};

const DEFAULT_SECURITY_CODE = 'PIUDA-ADMIN-2026';

export default function AdminRegisterPage() {
  const router = useRouter();
  const { createAdminAccount, adminLogin } = useShop();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('010-');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState<'logistics' | 'md' | 'cs' | 'all'>('logistics');
  const [permissions, setPermissions] = useState<AdminMenuKey[]>(DEPT_PRESETS.logistics);
  const [securityCode, setSecurityCode] = useState(DEFAULT_SECURITY_CODE);
  const [memo, setMemo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // 직무 변경 시 권한 프리셋 자동 반영
  const handleDepartmentChange = (dept: 'logistics' | 'md' | 'cs' | 'all') => {
    setDepartment(dept);
    setPermissions(DEPT_PRESETS[dept] || ['dashboard']);
  };

  // 개별 권한 체크박스 토글
  const handleTogglePermission = (key: AdminMenuKey) => {
    setPermissions((prev) => {
      if (prev.includes(key)) {
        if (key === 'dashboard' && prev.length === 1) return prev;
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 유효성 검사
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMessage('이름, 이메일, 휴대폰 번호, 비밀번호를 모두 입력해주세요.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (securityCode.trim() !== DEFAULT_SECURITY_CODE) {
      setErrorMessage(`관리자 등록 보안키가 올바르지 않습니다. (기본 보안키: ${DEFAULT_SECURITY_CODE})`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await createAdminAccount({
        email: email.trim(),
        plainPassword: password,
        name: name.trim(),
        phone: phone.trim(),
        role: department === 'all' ? 'super_admin' : 'sub_admin',
        status: 'active',
        permissions,
        memo: memo.trim() || `${department.toUpperCase()} 담당 관리자 가입`,
      });

      if (!res.success) {
        setErrorMessage(res.error || '관리자 계정 등록에 실패했습니다.');
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      // 자동 로그인 시도
      setTimeout(async () => {
        const loginRes = await adminLogin({
          email: email.trim(),
          password,
        });
        if (loginRes.data) {
          router.push('/admin');
        } else {
          router.push('/admin/login');
        }
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || '가입 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* 배경 장식 조명 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-neutral-800/20 rounded-full blur-2xl pointer-events-none" />

      {/* 상단 홈 및 로그인 링크 */}
      <div className="w-full max-w-lg mb-6 flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          쇼핑몰 메인
        </Link>
        <Link
          href="/admin/login"
          className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
        >
          이미 관리자 계정이 있으신가요? 로그인 ›
        </Link>
      </div>

      {/* 메인 가입 카드 */}
      <div className="w-full max-w-lg bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-3xl p-8 shadow-2xl relative z-10">
        {!isSuccess ? (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-lg shadow-rose-900/40 mb-3">
                <UserPlus className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-black text-white tracking-tight">아빠사랑 피우다 관리자 회원가입</h1>
              <p className="text-xs text-neutral-400 mt-1">
                본사 운영진 및 부관리자를 위한 전용 계정 등록 포털
              </p>
            </div>

            {/* Supabase 동시 저장 및 해시 암호화 안내 */}
            <div className="mb-5 p-3.5 rounded-2xl bg-neutral-800/70 border border-neutral-700/60 text-neutral-300 text-xs space-y-1">
              <div className="flex items-center justify-between text-emerald-400 font-bold text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  Supabase admin_accounts & members 동시 연동
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/40">
                  SHA-256
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                비밀번호는 SHA-256 해시 암호화 처리되며, 직무에 맞게 메뉴별 접근 권한(Role)이 안전하게 부여됩니다.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 이름 & 휴대폰 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    관리자 이름 *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="예: 김운영"
                      className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-hidden transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    휴대폰 번호 (MFA 인증용) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010-1234-5678"
                      className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-hidden transition"
                    />
                  </div>
                </div>
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  관리자 계정 이메일 (로그인 ID) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@piuda.kr"
                    className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-hidden transition"
                  />
                </div>
              </div>

              {/* 비밀번호 & 비밀번호 확인 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    비밀번호 (최소 6자) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-neutral-500 outline-hidden transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    비밀번호 확인 *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-hidden transition"
                    />
                  </div>
                </div>
              </div>

              {/* 담당 직무/부서 선택 */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  담당 직무 및 부서
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDepartmentChange('logistics')}
                    className={`p-2 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      department === 'logistics'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    물류 / 배송
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDepartmentChange('md')}
                    className={`p-2 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      department === 'md'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    상품 / MD
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDepartmentChange('cs')}
                    className={`p-2 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      department === 'cs'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    고객 / CS
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDepartmentChange('all')}
                    className={`p-2 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      department === 'all'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    총괄 운영
                  </button>
                </div>
              </div>

              {/* 메뉴별 접근 권한 (Role) 세부 지정 */}
              <div className="pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                    부여될 메뉴 접근 권한 ({permissions.length}개 선택됨)
                  </label>
                  <span className="text-[10px] text-neutral-500">체크박스로 변경 가능</span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-3 rounded-2xl border border-neutral-800/80">
                  {MENU_OPTIONS.map((item) => {
                    const isChecked = permissions.includes(item.key);
                    return (
                      <label
                        key={item.key}
                        className={`flex items-start gap-2 p-2 rounded-xl border transition cursor-pointer ${
                          isChecked
                            ? 'bg-rose-950/40 border-rose-700/60 text-white font-bold'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(item.key)}
                          className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                        />
                        <div className="leading-tight">
                          <p className="text-[11px]">{item.label}</p>
                          <span className="text-[9px] text-neutral-500 font-normal">{item.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 관리자 가입 보안키 인증 (무단 가입 방지) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-neutral-300 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    관리자 등록 보안키 (보안 인증) *
                  </label>
                  <span className="text-[10px] text-amber-400/90 font-mono">
                    기본키: {DEFAULT_SECURITY_CODE}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value)}
                  placeholder={DEFAULT_SECURITY_CODE}
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 outline-hidden transition"
                />
              </div>

              {/* 관리자 메모 */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  직무 메모 (선택)
                </label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="예: 2026 하반기 신규 물류 담당자"
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-hidden transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-lg shadow-rose-900/30 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>해시 암호화 및 관리자 등록 중...</span>
                  </>
                ) : (
                  <>
                    <span>관리자 계정 등록 완료 및 콘솔 접속</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* 가입 성공 완료 화면 */
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">관리자 회원가입 완료!</h2>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
              <strong className="text-white font-bold">{name}</strong> 관리자님의 계정이 Supabase 데이터베이스에 안전하게 등록되었습니다. (비밀번호 SHA-256 해시 암호화 완료)
            </p>
            <div className="p-3 bg-neutral-800/80 rounded-2xl border border-neutral-700 text-xs font-mono text-neutral-300">
              로그인 계정: {email}
            </div>
            <p className="text-[11px] text-emerald-400 flex items-center justify-center gap-1.5 pt-2">
              <div className="w-3.5 h-3.5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
              <span>관리자 콘솔로 자동 연결 중입니다...</span>
            </p>
          </div>
        )}
      </div>

      {/* 하단 시스템 상태 안내 */}
      <div className="mt-8 text-center text-[11px] text-neutral-500 z-10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Supabase PostgREST & Role-Based RBAC Active</span>
      </div>
    </div>
  );
}
