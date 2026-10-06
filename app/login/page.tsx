'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { DEMO_USERS } from '@/lib/mockData';
import {
  Lock,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, showToast } = useShop();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('이메일과 비밀번호를 입력해주세요.', 'error');
      return;
    }

    // 데모 로그인 처리
    if (email.includes('admin')) {
      login('admin');
      router.push('/admin');
    } else {
      login('customer', { email });
      router.push('/mypage');
    }
  };

  // 카카오 간편로그인 시뮬레이션
  const handleKakaoLogin = () => {
    login('customer', {
      email: 'kakao_user@kakao.com',
      name: '카카오회원',
      skinType: '민감성',
    });
    router.push('/mypage');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      {/* 타이틀 헤더 */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block text-3xl font-black text-neutral-900 tracking-tight">
          다써바<span className="text-rose-500 font-serif">.</span>
        </Link>
        <h1 className="text-xl font-black text-neutral-900">로그인</h1>
        <p className="text-xs text-neutral-500">
          다써바 회원이 되시면 <strong>신규가입 3,000P & 1+1 쿠폰</strong>을 드립니다.
        </p>
      </div>

      {/* 로그인 폼 */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-neutral-700 block mb-1">이메일 (아이디)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@dasseoba.com"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl py-2.5 pl-10 pr-3.5 text-xs focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-neutral-700 block mb-1">비밀번호</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl py-2.5 pl-10 pr-3.5 text-xs focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-600">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-neutral-900 rounded"
              />
              로그인 상태 유지
            </label>

            <Link href="/find-account" className="hover:text-neutral-900 hover:underline">
              아이디 / 비밀번호 찾기
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-black py-3.5 rounded-xl text-sm transition-colors shadow-md mt-2"
          >
            로그인
          </button>
        </form>

        {/* 소셜 간편 로그인 */}
        <div className="space-y-3 pt-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={handleKakaoLogin}
            className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E] font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4 fill-[#3C1E1E]" />
            카카오 1초 간편 로그인
          </button>
        </div>

        {/* 원클릭 테스트 데모 계정 버튼들 */}
        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-2 text-xs">
          <p className="font-bold text-neutral-700 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-rose-500" /> 원클릭 빠른 체험 계정
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                login('customer');
                router.push('/mypage');
              }}
              className="bg-white border border-neutral-300 hover:border-neutral-500 text-neutral-800 py-2 rounded-lg font-semibold text-[11px] transition-colors"
            >
              일반 고객 (홍길동)
            </button>
            <button
              type="button"
              onClick={() => {
                login('admin');
                router.push('/admin');
              }}
              className="bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 py-2 rounded-lg font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3 h-3" />
              어드민 관리자
            </button>
          </div>
        </div>

        {/* 회원가입 유도 */}
        <div className="text-center text-xs text-neutral-500 pt-2">
          아직 다써바 회원이 아니신가요?{' '}
          <Link href="/register" className="font-bold text-rose-600 hover:underline ml-1">
            회원가입 (+3,000P)
          </Link>
        </div>
      </div>
    </div>
  );
}
