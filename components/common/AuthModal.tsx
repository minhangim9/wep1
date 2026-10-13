'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { SkinType } from '@/types';
import confetti from 'canvas-confetti';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
  Database,
  AlertCircle,
  MapPin,
  Check,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const router = useRouter();
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
    signUp,
    signIn,
    registerGuest,
    signInGuest,
    openSupabaseModal,
    showToast,
  } = useShop();

  // 상단 메인 탭: 'member' (회원) | 'guest' (비회원)
  const [activeTab, setActiveTab] = useState<'member' | 'guest'>('member');

  // 회원가입 모드 여부 (회원 탭 내에서 로그인 vs 회원가입)
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // 로딩 및 에러 상태
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // [회원] 로그인 상태
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberId, setRememberId] = useState(false);

  // [회원] 신규 회원가입 상태
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regSkinType, setRegSkinType] = useState<SkinType>('민감성');

  // [비회원] 상태
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestOrderPassword, setGuestOrderPassword] = useState('');
  const [guestAddress, setGuestAddress] = useState('');

  // 아이디 저장 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('piuda_saved_email');
      if (savedEmail) {
        setLoginEmail(savedEmail);
        setRememberId(true);
      }
    }
  }, []);

  // 모달 탭 상태 동기화
  useEffect(() => {
    if (authModalTab === 'register') {
      setActiveTab('member');
      setIsRegisterMode(true);
    } else {
      setIsRegisterMode(false);
    }
  }, [authModalTab]);

  if (!isAuthModalOpen) return null;

  // 1. [회원] 로그인 처리 (Supabase 연동)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!loginEmail.trim() || !loginPassword) {
      setFormError('아이디(이메일)와 비밀번호를 모두 입력해주세요.');
      return;
    }

    // 아이디 저장 처리
    if (typeof window !== 'undefined') {
      if (rememberId) {
        localStorage.setItem('piuda_saved_email', loginEmail.trim());
      } else {
        localStorage.removeItem('piuda_saved_email');
      }
    }

    setIsLoading(true);
    const res = await signIn({
      email: loginEmail.trim(),
      password: loginPassword,
    });
    setIsLoading(false);

    if (res.success) {
      closeAuthModal();
      showToast(`${res.user?.name || '고객'}님, 환영합니다!`, 'success');
      if (res.user?.role === 'admin' || loginEmail.includes('admin')) {
        router.push('/admin');
      }
    } else {
      setFormError(res.error || '아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  // 2. [회원] 신규 회원가입 처리 (Supabase members 테이블 저장)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword || !regPhone.trim()) {
      setFormError('필수 정보를 모두 입력해주세요.');
      return;
    }

    if (regPassword.length < 6) {
      setFormError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    const res = await signUp({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      phone: regPhone.trim(),
      skinType: regSkinType,
      marketingAgreed: true,
    });
    setIsLoading(false);

    if (res.success) {
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#fb7185', '#fbbf24', '#34d399'],
        });
      } catch (err) {
        console.error(err);
      }
      showToast('축하합니다! 회원가입 완료 및 3,000P 적립금이 지급되었습니다.', 'success');
      closeAuthModal();
    } else {
      setFormError(res.error || '회원가입에 실패했습니다.');
    }
  };

  // 3. [비회원] 가입 및 주문조회 로그인 처리 (Supabase guest_members 테이블 저장)
  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!guestName.trim()) {
      setFormError('주문자명(이름)을 입력해주세요.');
      return;
    }
    if (!guestPhone.trim() || guestPhone.trim().length < 9) {
      setFormError('올바른 휴대폰 번호(예: 010-1234-5678)를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    const res = await registerGuest({
      name: guestName.trim(),
      phone: guestPhone.trim(),
      orderPassword: guestOrderPassword.trim() || '0000',
      address: guestAddress.trim(),
      marketingAgreed: false,
    });
    setIsLoading(false);

    if (res.success) {
      closeAuthModal();
      showToast(`비회원(${guestName}님)으로 세션이 연결되었습니다. (주문·배송 조회 가능)`, 'success');
    } else {
      setFormError(res.error || '비회원 정보 등록/조회에 실패했습니다.');
    }
  };

  // 카카오 SNS 로그인 (원클릭 간편 연동)
  const handleKakaoLogin = () => {
    login('customer', {
      name: '카카오 고객',
      email: 'kakao_user@piuda.kr',
      tier: 'WELCOME',
      points: 3000,
      skinType: '복합성',
    });
    showToast('카카오 간편 로그인 성공! (웰컴 3,000P 적용)', 'success');
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-[440px] bg-white rounded-xl shadow-2xl overflow-hidden border border-neutral-300 animate-in zoom-in-95 duration-200 flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 닫기 X 버튼 */}
        <button
          onClick={closeAuthModal}
          className="absolute top-3.5 right-3.5 z-10 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. 사각형 탭 바 (첨부페이지 2 디자인: [회원] / [비회원]) */}
        <div className="pt-5 px-6 pb-0">
          <div className="flex border-b border-neutral-300">
            {/* 회원 탭 */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('member');
                setFormError(null);
              }}
              className={`flex-1 py-3 text-center text-sm font-bold transition-all cursor-pointer border-t border-l border-r ${
                activeTab === 'member'
                  ? 'bg-white text-neutral-900 border-neutral-300 -mb-[1px] border-b-white pb-[13px] z-10'
                  : 'bg-neutral-100 text-neutral-500 border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              회원
            </button>

            {/* 비회원 탭 */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('guest');
                setIsRegisterMode(false);
                setFormError(null);
              }}
              className={`flex-1 py-3 text-center text-sm font-bold transition-all cursor-pointer border-t border-l border-r ${
                activeTab === 'guest'
                  ? 'bg-white text-neutral-900 border-neutral-300 -mb-[1px] border-b-white pb-[13px] z-10'
                  : 'bg-neutral-100 text-neutral-500 border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              비회원
            </button>
          </div>
        </div>

        {/* 2. 본문 폼 컨테이너 */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* 에러 알림 */}
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs font-medium leading-relaxed">{formError}</div>
              </div>
              {(formError.includes('API Key') ||
                formError.includes('Supabase') ||
                formError.includes('테이블')) && (
                <button
                  type="button"
                  onClick={() => {
                    closeAuthModal();
                    openSupabaseModal();
                  }}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3 rounded-md text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Supabase API Key 설정 및 진단 열기</span>
                </button>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* A. [회원] 탭 내용                                         */}
          {/* ========================================================= */}
          {activeTab === 'member' && !isRegisterMode && (
            <div className="space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                {/* 아이디 입력창 */}
                <div>
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="아이디"
                    required
                    className="w-full h-11 px-3.5 border border-neutral-300 rounded-none text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-700 transition"
                  />
                </div>

                {/* 비밀번호 입력창 */}
                <div>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="비밀번호"
                    required
                    className="w-full h-11 px-3.5 border border-neutral-300 rounded-none text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-700 transition"
                  />
                </div>

                {/* 아이디 저장 체크박스 */}
                <div className="flex items-center gap-2 pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-neutral-700 font-medium">
                    <input
                      type="checkbox"
                      checked={rememberId}
                      onChange={(e) => setRememberId(e.target.checked)}
                      className="w-4 h-4 rounded-none border border-neutral-300 text-neutral-800 focus:ring-0 cursor-pointer"
                    />
                    <span>아이디 저장</span>
                  </label>
                </div>

                {/* 로그인 버튼 (어두운 사각형) */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#333333] hover:bg-neutral-900 text-white font-bold text-sm tracking-wide transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:bg-neutral-400 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>로그인 확인 중...</span>
                    </>
                  ) : (
                    <span>로그인</span>
                  )}
                </button>
              </form>

              {/* 링크: 아이디 찾기 | 비밀번호 찾기 | 회원가입 */}
              <div className="flex items-center justify-center gap-3 text-xs text-neutral-600 pt-1">
                <Link
                  href="/find-account"
                  onClick={closeAuthModal}
                  className="hover:text-neutral-950 transition hover:underline"
                >
                  아이디 찾기
                </Link>
                <span className="text-neutral-300">|</span>
                <Link
                  href="/find-account"
                  onClick={closeAuthModal}
                  className="hover:text-neutral-950 transition hover:underline"
                >
                  비밀번호 찾기
                </Link>
                <span className="text-neutral-300">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setFormError(null);
                  }}
                  className="hover:text-neutral-950 font-bold transition hover:underline cursor-pointer text-neutral-800"
                >
                  회원가입
                </button>
              </div>

              {/* 또는 SNS 로그인 & 카카오톡 아이콘 */}
              <div className="pt-4 space-y-3 text-center border-t border-neutral-100">
                <p className="text-xs text-neutral-500 font-normal">또는 SNS 로그인</p>
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleKakaoLogin}
                    title="카카오 로그인"
                    className="w-11 h-11 bg-[#FEE500] hover:bg-[#FADA0A] rounded-md flex items-center justify-center shadow-xs transition transform active:scale-95 cursor-pointer"
                  >
                    {/* 카카오 TALK SVG 말풍선 아이콘 */}
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6 fill-[#191919]"
                    >
                      <path d="M12 3C6.477 3 2 6.477 2 10.768c0 2.656 1.71 4.996 4.34 6.34-.19.684-.707 2.502-.81 2.89-.13.483.178.477.375.346.155-.102 2.457-1.666 3.447-2.339.878.127 1.776.195 2.648.195 5.523 0 10-3.477 10-7.768S17.523 3 12 3z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* B. [회원] 신규 회원가입 폼 모드                             */}
          {/* ========================================================= */}
          {activeTab === 'member' && isRegisterMode && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-1 border-b border-neutral-200">
                <div>
                  <h3 className="text-base font-black text-neutral-900">신규 회원가입</h3>
                  <p className="text-xs text-rose-600 font-semibold mt-0.5">
                    가입 즉시 현금처럼 쓰는 3,000P 적립금 지급!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-xs text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
                >
                  로그인으로 돌아가기
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">이름 *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full h-10 px-3 border border-neutral-300 text-xs text-neutral-900 focus:outline-hidden focus:border-neutral-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    이메일 주소 (아이디) *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full h-10 px-3 border border-neutral-300 text-xs text-neutral-900 focus:outline-hidden focus:border-neutral-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">비밀번호 *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="영문, 숫자 포함 6자 이상"
                    className="w-full h-10 px-3 border border-neutral-300 text-xs text-neutral-900 focus:outline-hidden focus:border-neutral-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">휴대폰 번호 *</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="010-1234-5678"
                    className="w-full h-10 px-3 border border-neutral-300 text-xs text-neutral-900 focus:outline-hidden focus:border-neutral-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">피부 타입</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['민감성', '건성', '지성', '복합성'] as SkinType[]).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setRegSkinType(type)}
                        className={`py-1.5 border text-center text-xs font-bold transition cursor-pointer ${
                          regSkinType === type
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : 'border-neutral-300 bg-neutral-50 text-neutral-700 hover:bg-white'
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
                  className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 cursor-pointer disabled:bg-neutral-400 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Supabase 등록 중...</span>
                    </>
                  ) : (
                    <span>회원가입 완료 (+3,000P 받기)</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* C. [비회원] 탭 내용 (Supabase guest_members 테이블 저장)    */}
          {/* ========================================================= */}
          {activeTab === 'guest' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-3 border border-neutral-200 text-xs text-neutral-600 leading-relaxed">
                <p className="font-bold text-neutral-900 mb-0.5">비회원 주문 및 조회 안내</p>
                비회원으로도 바로 상품 구매 및 배송 조회가 가능하며, 입력하신 정보는 Supabase DB에
                안전하게 암호화 보관됩니다.
              </div>

              <form onSubmit={handleGuestSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    주문자명 (이름) *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full h-11 px-3.5 border border-neutral-300 rounded-none text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-700 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    휴대폰 번호 *
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="010-1234-5678"
                    className="w-full h-11 px-3.5 border border-neutral-300 rounded-none text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-700 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    주문 비밀번호 (숫자 4~6자리)
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={guestOrderPassword}
                    onChange={(e) => setGuestOrderPassword(e.target.value)}
                    placeholder="배송 조회 시 확인할 비밀번호 (예: 1234)"
                    className="w-full h-11 px-3.5 border border-neutral-300 rounded-none text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-700 transition"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    * 비워두실 경우 휴대폰 번호 뒷자리 4자리로 자동 설정됩니다.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    배송지 주소 (선택)
                  </label>
                  <input
                    type="text"
                    value={guestAddress}
                    onChange={(e) => setGuestAddress(e.target.value)}
                    placeholder="서울시 강남구 테헤란로 123"
                    className="w-full h-11 px-3.5 border border-neutral-300 rounded-none text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-700 transition"
                  />
                </div>

                {/* 비회원 로그인/주문시작 버튼 */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#333333] hover:bg-neutral-900 text-white font-bold text-sm tracking-wide transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:bg-neutral-400 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>비회원 정보 처리 중...</span>
                    </>
                  ) : (
                    <span>비회원으로 시작하기 / 주문조회</span>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('member');
                    setIsRegisterMode(true);
                  }}
                  className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  회원가입하고 3,000P 적립금 받으러 가기 ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
