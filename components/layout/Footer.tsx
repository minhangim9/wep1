'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, PhoneCall, CreditCard, Clock, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-400 text-xs pt-12 pb-24 lg:pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* 상단 4단 그리드 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-neutral-800">
          {/* 1. 고객만족센터 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <PhoneCall className="w-4 h-4 text-rose-500" />
              <span>고객만족센터</span>
            </div>
            <p className="text-2xl font-black text-rose-400 tracking-tight">1588-0000</p>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              평일 : 09:30 ~ 18:00<br />
              점심 : 12:30 ~ 13:30<br />
              토/일/공휴일 휴무
            </p>
            <a
              href="https://pf.kakao.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#FEE500] text-[#3C1E1E] px-3 py-1.5 rounded text-xs font-bold hover:bg-[#FDD835] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-[#3C1E1E]" />
              카카오톡 실시간 상담
            </a>
          </div>

          {/* 2. 입금계좌 안내 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <CreditCard className="w-4 h-4 text-rose-500" />
              <span>무통장 입금 계좌</span>
            </div>
            <div className="bg-neutral-800/80 p-3 rounded-lg border border-neutral-700/60 space-y-1 text-[11px]">
              <p className="text-white font-semibold">국민은행 : 123402-04-567890</p>
              <p className="text-neutral-300">기업은행 : 987-654321-01-012</p>
              <p className="text-rose-400 font-medium pt-1">예금주 : (주)다써바코스메틱</p>
            </div>
            <p className="text-[11px] text-neutral-500">
              * 주문자명과 입금자명이 다를 경우 고객센터로 연락 부탁드립니다.
            </p>
          </div>

          {/* 3. 쇼핑 바로가기 */}
          <div className="space-y-2.5">
            <p className="text-white font-bold text-sm">쇼핑 가이드</p>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/category/one-plus-one" className="hover:text-white transition-colors">
                  🔥 1+1 기획전 & 타임특가
                </Link>
              </li>
              <li>
                <Link href="/board/reservation" className="hover:text-white transition-colors">
                  🌸 1:1 맞춤 피부진단 예약
                </Link>
              </li>
              <li>
                <Link href="/mypage/orders" className="hover:text-white transition-colors">
                  📦 실시간 주문 / 배송 조회
                </Link>
              </li>
              <li>
                <Link href="/cs" className="hover:text-white transition-colors">
                  ❓ 자주 묻는 질문 (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/board/free" className="hover:text-white transition-colors">
                  💬 뷰티 꿀팁 커뮤니티
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. 에스크로 & 소셜 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>KB 에스크로 구매안전서비스</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              고객님의 안전거래를 위해 현금 등으로 결제 시 저희 쇼핑몰에서 가입한 구매안전서비스를 이용하실 수 있습니다.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-neutral-800 hover:bg-rose-600 hover:text-white rounded-full transition-colors text-white"
                aria-label="인스타그램"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-neutral-800 hover:bg-red-600 hover:text-white rounded-full transition-colors text-white"
                aria-label="유튜브"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* 하단 회사 법적 정보 및 약관 */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div className="space-y-1">
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-neutral-400 font-medium">
              <Link href="/cs" className="hover:text-white transition-colors">회사소개</Link>
              <span>|</span>
              <Link href="/cs" className="hover:text-white transition-colors">이용약관</Link>
              <span>|</span>
              <Link href="/cs" className="hover:text-white font-bold text-white transition-colors">개인정보처리방침</Link>
              <span>|</span>
              <Link href="/cs" className="hover:text-white transition-colors">이용안내</Link>
            </div>
            <p className="pt-1">
              상호명: (주)다써바코스메틱 | 대표자: 홍길동 | 사업자등록번호: 123-45-67890 | 통신판매업신고: 제2026-서울강남-01234호
            </p>
            <p>
              주소: 서울특별시 강남구 테헤란로 123 다써바타워 7층 | 개인정보관리책임자: 김민지 (privacy@dasseoba.com)
            </p>
            <p className="text-neutral-600 pt-1">
              Copyright © DASSEOBA Cosmetics All Rights Reserved. Powered by Supabase & Next.js
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
