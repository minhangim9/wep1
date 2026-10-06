'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useShop } from '@/context/ShopContext';
import { SkinType } from '@/types';
import { Sparkles, Gift, Check, ShieldCheck, Mail, Lock, User, Phone, MapPin } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login, showToast } = useShop();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [skinType, setSkinType] = useState<SkinType>('민감성');
  const [marketingAgreed, setMarketingAgreed] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !phone) {
      showToast('필수 정보를 모두 입력해주세요.', 'error');
      return;
    }

    // 신규 회원 등록 및 3,000P 지급
    login('customer', {
      name,
      email,
      phone,
      address,
      skinType,
      marketingAgreed,
      points: 3000,
      tier: 'WELCOME',
    });

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#34d399', '#fbbf24'],
    });

    showToast(`회원가입이 완료되었습니다! 신규가입 축하 적립금 3,000P가 지급되었습니다 🎉`, 'success');
    router.push('/mypage');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16 space-y-8">
      {/* 상단 타이틀 */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block text-3xl font-black text-neutral-900 tracking-tight">
          다써바<span className="text-rose-500 font-serif">.</span>
        </Link>
        <h1 className="text-2xl font-black text-neutral-900">신규 회원가입</h1>
        <p className="text-xs text-neutral-500">
          가입 즉시 <strong>3,000P 웰컴 마일리지</strong>와 <strong>15% 할인 쿠폰</strong>을 드립니다.
        </p>
      </div>

      {/* 웰컴 혜택 배너 박스 */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-5 rounded-2xl shadow-md flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <strong className="text-sm font-bold block">신규회원 첫 만남 혜택</strong>
            <p className="text-rose-100">3,000P 적립 + 첫 구매 무료배송 쿠폰</p>
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-yellow-200 animate-bounce" />
      </div>

      {/* 가입 폼 */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* 기본 계정 정보 */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-neutral-900 pb-2 border-b border-neutral-100">
              기본 정보 입력
            </h3>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">이름 *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">이메일 (아이디) *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@dasseoba.com"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">비밀번호 *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="영문, 숫자 포함 8자 이상"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">휴대폰 번호 *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">기본 배송 주소</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="서울특별시 강남구 테헤란로 123"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs focus:bg-white"
              />
            </div>
          </div>

          {/* 뷰티 맞춤 케어를 위한 피부타입 설문 */}
          <div className="space-y-3 pt-3 border-t border-neutral-100">
            <h3 className="font-bold text-sm text-neutral-900">
              맞춤 화장품 추천을 위한 피부타입 선택 *
            </h3>
            <p className="text-neutral-500 text-[11px]">
              선택하신 피부타입에 맞는 저자극 화장품과 리뷰를 우선적으로 큐레이션해 드립니다.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { type: '민감성', desc: '쉽게 붉어지고 자극에 민감한 피부' },
                { type: '건성', desc: '당김이 심하고 보습이 필요한 피부' },
                { type: '지성', desc: '유분/피지 분비가 많은 피부' },
                { type: '복합성', desc: 'T존 지성 & U존 건성' },
                { type: '약건성', desc: '환절기 계절성 건조 피부' },
                { type: '중성', desc: '유수분 밸런스가 건강한 피부' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => setSkinType(item.type as any)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    skinType === item.type
                      ? 'border-rose-500 bg-rose-50/80 text-rose-900 ring-2 ring-rose-500/20'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-white'
                  }`}
                >
                  <strong className="text-xs">{item.type}</strong>
                  <span className="text-[10px] text-neutral-500 mt-1">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 약관 동의 */}
          <div className="space-y-2 pt-3 border-t border-neutral-100 text-neutral-600">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-800">
              <input type="checkbox" required defaultChecked className="accent-neutral-900 rounded" />
              [필수] 이용약관 및 개인정보 처리방침 동의
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={marketingAgreed}
                onChange={(e) => setMarketingAgreed(e.target.checked)}
                className="accent-neutral-900 rounded"
              />
              [선택] 1+1 타임특가 및 할인 이벤트 알림톡 수신 동의
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-neutral-900 hover:bg-rose-600 text-white font-black py-4 rounded-xl text-sm transition-colors shadow-lg mt-4"
          >
            가입 완료하고 3,000P 받기
          </button>
        </form>
      </div>
    </div>
  );
}
