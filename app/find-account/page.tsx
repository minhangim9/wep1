'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { ChevronRight, Mail, Phone, Lock, CheckCircle2 } from 'lucide-react';

export default function FindAccountPage() {
  const { showToast } = useShop();
  const [tab, setTab] = useState<'id' | 'pw'>('id');

  // 아이디 찾기 상태
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [foundId, setFoundId] = useState<string | null>(null);

  // 비밀번호 찾기 상태
  const [email, setEmail] = useState('');
  const [isSentLink, setIsSentLink] = useState(false);

  const handleFindId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      showToast('이름과 휴대폰 번호를 입력해주세요.', 'error');
      return;
    }
    setFoundId('customer@piuda.kr');
    showToast('회원님의 아이디가 조회되었습니다.', 'success');
  };

  const handleFindPw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('가입 이메일을 입력해주세요.', 'error');
      return;
    }
    setIsSentLink(true);
    showToast('비밀번호 재설정 링크가 이메일로 발송되었습니다.', 'success');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      {/* 타이틀 */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-3">
          <img src="/logo.jpg" alt="아빠사랑 로고" className="h-10 w-auto object-contain rounded-lg shadow-xs" />
          <div className="text-left flex flex-col">
            <span className="text-2xl font-black text-neutral-900 tracking-tight leading-tight">
              피우다<span className="text-rose-500 font-serif">.</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase">
              Piuda Beauty
            </span>
          </div>
        </Link>
        <h1 className="text-xl font-black text-neutral-900 pt-2">아이디 / 비밀번호 찾기</h1>
      </div>

      {/* 탭 전환 */}
      <div className="flex border-b border-neutral-200 text-xs font-bold text-center">
        <button
          onClick={() => {
            setTab('id');
            setFoundId(null);
          }}
          className={`flex-1 py-3 border-b-2 transition-colors ${
            tab === 'id'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-400'
          }`}
        >
          아이디 찾기
        </button>
        <button
          onClick={() => {
            setTab('pw');
            setIsSentLink(false);
          }}
          className={`flex-1 py-3 border-b-2 transition-colors ${
            tab === 'pw'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-400'
          }`}
        >
          비밀번호 재설정
        </button>
      </div>

      {/* 컨텐츠 폼 */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm text-xs">
        {tab === 'id' ? (
          <div>
            {!foundId ? (
              <form onSubmit={handleFindId} className="space-y-4">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">이름</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="가입 시 등록한 성함"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">휴대폰 번호</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3.5 rounded-xl text-xs transition-colors shadow-md mt-2"
                >
                  아이디 찾기
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center py-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-neutral-600">회원님의 가입 아이디는 다음과 같습니다.</p>
                <div className="bg-neutral-100 p-4 rounded-xl font-bold text-sm text-neutral-900 font-mono">
                  {foundId}
                </div>
                <Link
                  href="/login"
                  className="block w-full bg-neutral-900 text-white font-bold py-3 rounded-xl hover:bg-neutral-800"
                >
                  로그인하러 가기
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div>
            {!isSentLink ? (
              <form onSubmit={handleFindPw} className="space-y-4">
                <p className="text-neutral-500 leading-relaxed mb-3">
                  가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 발송해 드립니다.
                </p>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">가입 이메일</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@piuda.kr"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 rounded-xl text-xs transition-colors shadow-md mt-2"
                >
                  비밀번호 재설정 링크 발송
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center py-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-neutral-700 font-bold">재설정 이메일이 발송되었습니다!</p>
                <p className="text-neutral-500 text-[11px] leading-relaxed">
                  <strong className="text-neutral-900">{email}</strong> 메일함을 확인하시고 안내에 따라 새 비밀번호를 설정해주세요.
                </p>
                <Link
                  href="/login"
                  className="block w-full bg-neutral-900 text-white font-bold py-3 rounded-xl hover:bg-neutral-800"
                >
                  로그인으로 이동
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
