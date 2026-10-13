'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { AdminAccount } from '@/types';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  Smartphone,
  ShieldAlert,
  Clock,
  RotateCcw,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const {
    user,
    adminLogin,
    adminCompleteMfaLogin,
    adminSendSmsCode,
    adminVerifySmsCode,
  } = useShop();

  // 1차 인증 폼 상태
  const [email, setEmail] = useState('admin@piuda.kr');
  const [password, setPassword] = useState('admin1234!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2차 MFA 인증 상태
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [pendingAccount, setPendingAccount] = useState<AdminAccount | null>(null);
  const [mfaPhone, setMfaPhone] = useState('010-9999-8888');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaTimer, setMfaTimer] = useState(180);
  const [lastSentCode, setLastSentCode] = useState('');

  // 3분 카운트다운 타이머
  useEffect(() => {
    let interval: any = null;
    if (isMfaStep && mfaTimer > 0) {
      interval = setInterval(() => {
        setMfaTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMfaStep, mfaTimer]);

  const handle1stSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminLogin({
        email: email.trim(),
        password,
      });

      if (res.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
        return;
      }

      // 최고 관리자 SMS MFA 2차 인증 요구 시
      if (res.requiresMfa && res.adminAccount) {
        setIsMfaStep(true);
        setPendingAccount(res.adminAccount);
        const targetPhone = res.phone || '010-9999-8888';
        setMfaPhone(targetPhone);
        const smsRes = adminSendSmsCode(targetPhone);
        setLastSentCode(smsRes.code);
        setMfaTimer(180);
        setIsLoading(false);
        return;
      }

      // 일반 부관리자 로그인 성공 시
      if (res.data) {
        router.push('/admin');
      }
    } catch (err: any) {
      setErrorMessage(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // SMS 2차 인증 제출 핸들러
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!mfaCode.trim()) {
      setErrorMessage('휴대폰으로 전송된 SMS 인증번호 6자리를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. 인증코드 검증
      const verifyRes = adminVerifySmsCode(mfaPhone, mfaCode);
      if (!verifyRes.success) {
        setErrorMessage(verifyRes.message);
        setIsLoading(false);
        return;
      }

      // 2. 최종 세션 발급
      if (pendingAccount) {
        const finalRes = await adminCompleteMfaLogin(pendingAccount);
        if (finalRes.success) {
          router.push('/admin');
        } else {
          setErrorMessage(finalRes.error || '세션 발급에 실패했습니다.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || '2차 인증 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // SMS 인증번호 재발송
  const handleResendSms = () => {
    const smsRes = adminSendSmsCode(mfaPhone);
    setLastSentCode(smsRes.code);
    setMfaTimer(180);
    setErrorMessage(null);
  };

  // 원클릭 계정 채우기 헬퍼들
  const handleFillAccount = (targetEmail: string, targetPass: string = 'admin1234!') => {
    setEmail(targetEmail);
    setPassword(targetPass);
    setErrorMessage(null);
    setIsMfaStep(false);
  };

  // 이미 관리자 로그인 상태인 경우
  if (user && user.role === 'admin' && user.adminStatus !== 'suspended') {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black mb-2">이미 관리자로 로그인되어 있습니다</h1>
        <p className="text-neutral-400 text-xs max-w-sm mb-6 leading-relaxed">
          현재 <strong className="text-white font-bold">{user.name}</strong> ({user.email}) 계정으로 관리자 콘솔 접근 권한이 활성화되어 있습니다.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="bg-neutral-800 hover:bg-neutral-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors"
          >
            쇼핑몰 홈
          </Link>
          <Link
            href="/admin"
            className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-lg shadow-rose-900/40"
          >
            어드민 대시보드 바로가기
          </Link>
        </div>
      </div>
    );
  }

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* 배경 장식 원형 조명 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-neutral-800/20 rounded-full blur-2xl pointer-events-none" />

      {/* 상단 홈 이동 */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          쇼핑몰 메인으로 돌아가기
        </Link>
        <span className="text-[11px] font-mono font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
          SECURE CONSOLE
        </span>
      </div>

      {/* 메인 로그인 카드 */}
      <div className="w-full max-w-md bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-3xl p-8 shadow-2xl relative z-10">
        {!isMfaStep ? (
          /* 1단계: 계정 이메일 및 비밀번호 입력 */
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-lg shadow-rose-900/40 mb-3">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-black text-white tracking-tight">아빠사랑 피우다 관리자 콘솔</h1>
              <p className="text-xs text-neutral-400 mt-1">
                Supabase DB와 실시간 연동되는 최고/부관리자 인증 포털
              </p>
            </div>

            {/* 보안 및 상태값 안내 배지 */}
            <div className="mb-5 p-3.5 rounded-2xl bg-neutral-800/70 border border-neutral-700/60 text-neutral-300 text-xs space-y-1">
              <div className="flex items-center justify-between text-emerald-400 font-bold text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  SHA-256 해시 암호화 & 실시간 상태 제어
                </span>
                <span className="text-neutral-400 font-normal">v2.4</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                비밀번호는 안전하게 해시 암호화 검증되며, <span className="text-rose-400 font-semibold">[승인중지]</span> 상태인 계정은 실시간으로 접속이 차단됩니다.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handle1stSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  관리자 계정 이메일
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@piuda.kr"
                    required
                    className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-500 outline-hidden transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-neutral-500 outline-hidden transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-lg shadow-rose-900/30 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>해시 비밀번호 검증 중...</span>
                  </>
                ) : (
                  <>
                    <span>관리자 시스템 로그인</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/admin/register"
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold hover:underline inline-flex items-center gap-1.5 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>관리자 계정이 없으신가요? 관리자로 회원가입 ›</span>
                </Link>
              </div>
            </form>
          </>
        ) : (
          /* 2단계: 최고 관리자 휴대폰 SMS 2차 인증 (MFA) 화면 */
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-900/40 mb-3">
                <Smartphone className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">휴대폰 SMS 2차 인증 (MFA)</h2>
              <p className="text-xs text-neutral-400 mt-1">
                최고 관리자 계정 보안을 위해 휴대폰 6자리 인증번호를 입력해주세요.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-800/80 border border-neutral-700 text-xs space-y-1">
              <div className="flex items-center justify-between text-neutral-300">
                <span className="text-neutral-400">인증 대상 휴대폰</span>
                <strong className="text-rose-400 font-mono text-sm">{mfaPhone}</strong>
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-700/60">
                <span>인증번호 유효시간</span>
                <span className="font-mono text-amber-400 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatTimer(mfaTimer)}
                </span>
              </div>
            </div>

            {lastSentCode && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] flex items-center justify-between">
                <span>SMS 모의 발송 번호:</span>
                <strong className="font-mono text-xs text-white tracking-wider bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                  {lastSentCode}
                </strong>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  SMS 6자리 인증코드 입력
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="예: 123456"
                    required
                    autoFocus
                    className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl px-4 py-3 text-lg font-mono text-center tracking-widest text-white placeholder-neutral-600 outline-hidden transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={handleResendSms}
                  className="text-neutral-400 hover:text-white flex items-center gap-1 font-semibold transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> 인증번호 재발송
                </button>
                <button
                  type="button"
                  onClick={() => setIsMfaStep(false)}
                  className="text-neutral-500 hover:text-neutral-300 transition cursor-pointer"
                >
                  다른 계정으로 로그인
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-lg shadow-rose-900/30 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>2차 MFA 인증 검증 중...</span>
                  </>
                ) : (
                  <>
                    <span>2차 인증 완료 및 콘솔 접속</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* 원클릭 테스트 계정 퀵 버튼들 */}
        <div className="mt-6 pt-5 border-t border-neutral-800 text-center space-y-2">
          <p className="text-[11px] text-neutral-500">
            테스트 계정 퀵 선택
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <button
              type="button"
              onClick={() => handleFillAccount('admin@piuda.kr')}
              className="inline-flex items-center gap-1 bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer"
            >
              <KeyRound className="w-3 h-3 text-rose-400" />
              <span>최고관리자 (MFA)</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillAccount('cs@piuda.kr')}
              className="inline-flex items-center gap-1 bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer"
            >
              <KeyRound className="w-3 h-3 text-blue-400" />
              <span>부관리자 (물류/CS)</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillAccount('stopped@piuda.kr')}
              className="inline-flex items-center gap-1 bg-rose-950/40 hover:bg-rose-950/60 border border-rose-800/50 text-rose-300 hover:text-rose-200 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer"
            >
              <ShieldAlert className="w-3 h-3 text-rose-500" />
              <span>승인중지 계정 (차단)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 하단 시스템 상태 안내 */}
      <div className="mt-8 text-center text-[11px] text-neutral-500 z-10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Supabase PostgREST & MFA Security Engine Active</span>
      </div>
    </div>
  );
}
