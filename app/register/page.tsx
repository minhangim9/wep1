'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useShop } from '@/context/ShopContext';
import { SkinType } from '@/types';
import {
  Sparkles,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
  Database,
  AlertCircle,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login, signUp, signIn, openSupabaseModal, showToast } = useShop();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [skinType, setSkinType] = useState<SkinType>('민감성');

  // 로그인 상태
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name || !email || !password || !phone) {
      setFormError('필수 정보를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    const res = await signUp({
      name,
      email,
      password,
      phone,
      skinType,
      marketingAgreed: true,
    });
    setIsLoading(false);

    if (res.success) {
      try {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#fb7185', '#34d399', '#fbbf24'],
        });
      } catch (err) {
        console.error(err);
      }
      router.push('/mypage');
    } else {
      setFormError(res.error || '회원가입에 실패했습니다.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!loginEmail || !loginPassword) {
      setFormError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    const res = await signIn({
      email: loginEmail,
      password: loginPassword,
    });
    setIsLoading(false);

    if (res.success) {
      if (res.user?.role === 'admin' || loginEmail.includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/mypage');
      }
    } else {
      setFormError(res.error || '로그인에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden">
        {/* 상단 다크 헤더 */}
        <div className="bg-neutral-950 text-white p-6 sm:p-7 relative">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="피우다 로고" className="h-6 w-auto object-contain rounded" />
              <span className="text-xs font-black tracking-widest text-neutral-300 uppercase">
                PIUDA · DADDY'S LOVE
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {activeTab === 'register' ? '신규 회원가입' : '로그인'}
            </h1>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {activeTab === 'register'
                ? '지금 가입하고 3,000P 적립금과 첫 구매 무료배송 혜택을 받으세요.'
                : '피우다 회원 전용 적립금과 1+1 특별 혜택을 누려보세요.'}
            </p>
          </div>
        </div>

        {/* 탭 바 */}
        <div className="flex border-b border-neutral-200 bg-white text-sm font-bold text-center">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setFormError(null);
            }}
            className={`flex-1 py-3.5 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'border-b-2 border-neutral-950 text-neutral-950 font-black'
                : 'border-b-2 border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setFormError(null);
            }}
            className={`flex-1 py-3.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'register'
                ? 'border-b-2 border-neutral-950 text-neutral-950 font-black'
                : 'border-b-2 border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <span>회원가입</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
              +3,000P
            </span>
          </button>
        </div>

        {/* 폼 영역 */}
        <div className="p-6 sm:p-7 space-y-5 text-xs">
          {/* 에러 안내 바 */}
          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-[11px] leading-relaxed font-semibold">
                  {formError}
                </div>
              </div>
              {(formError.includes('API Key') || formError.includes('members 테이블') || formError.includes('Supabase')) && (
                <button
                  type="button"
                  onClick={openSupabaseModal}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3 rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Supabase API Key 설정 및 진단 열기</span>
                </button>
              )}
            </div>
          )}

          {activeTab === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="font-bold text-neutral-800 block mb-1">이름 *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pl-10 pr-3 text-xs focus:bg-white focus:border-rose-400 text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">이메일 주소 *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pl-10 pr-3 text-xs focus:bg-white focus:border-rose-400 text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">비밀번호 *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="영문, 숫자 포함 8자 이상"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pl-10 pr-3 text-xs focus:bg-white focus:border-rose-400 text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">휴대폰 번호 *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-1234-5678"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pl-10 pr-3 text-xs focus:bg-white focus:border-rose-400 text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1.5">
                  맞춤 케어 피부타입
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['민감성', '건성', '지성', '복합성'] as SkinType[]).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setSkinType(type)}
                      className={`py-2 rounded-lg border text-center font-bold text-[11px] transition-all cursor-pointer ${
                        skinType === type
                          ? 'border-rose-500 bg-rose-50 text-rose-700'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-neutral-950 hover:bg-rose-600 disabled:bg-neutral-400 text-white font-black py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer mt-2 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Supabase DB 등록 중...</span>
                  </>
                ) : (
                  <span>가입 완료하고 3,000P 받기</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-neutral-800 block mb-1.5">이메일 주소</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-neutral-50/80 border border-neutral-200 rounded-xl py-3 pl-10 pr-3.5 text-xs focus:bg-white focus:border-rose-400 text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1.5">비밀번호</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-50/80 border border-neutral-200 rounded-xl py-3 pl-10 pr-3.5 text-xs focus:bg-white focus:border-rose-400 text-neutral-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-black py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>로그인 중...</span>
                  </>
                ) : (
                  <span>로그인</span>
                )}
              </button>
            </form>
          )}

          {/* 빠른 기능 체험 (원클릭 테스트) */}
          <div className="space-y-2.5 pt-2 border-t border-neutral-100">
            <p className="text-center font-bold text-[11px] text-neutral-400">
              빠른 기능 체험 (원클릭 테스트)
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  login('customer');
                  showToast('일반회원(홍길동)으로 로그인되었습니다.', 'success');
                  router.push('/mypage');
                }}
                className="bg-amber-50/70 border border-amber-300/80 hover:bg-amber-100/80 text-amber-900 font-bold py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>일반회원 (3,000P)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  login('admin');
                  showToast('관리자로 로그인되었습니다.', 'success');
                  router.push('/admin');
                }}
                className="bg-indigo-50/70 border border-indigo-200/80 hover:bg-indigo-100/80 text-indigo-900 font-bold py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>관리자 (어드민권한)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
