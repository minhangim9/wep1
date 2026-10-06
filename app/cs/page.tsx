'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Headphones,
  PhoneCall,
  MessageCircle,
  HelpCircle,
  Truck,
  RotateCcw,
  Sparkles,
  CreditCard,
  ChevronDown,
} from 'lucide-react';

const FAQ_LIST = [
  {
    category: '배송',
    question: '배송은 언제 출발하나요? 당일 출고 기준은 어떻게 되나요?',
    answer: '평일 오후 2시 이전 결제 완료 건은 당일 출고(CJ대한통운 / 우체국택배)되며, 평균 1~2영업일 이내에 안전하게 수령하실 수 있습니다. (주말/공휴일 제외)',
  },
  {
    category: '1+1 이벤트',
    question: '1+1 상품은 주문할 때 수량을 어떻게 선택해야 하나요?',
    answer: '1+1 표기 상품은 장바구니에서 수량 [1개]를 담아 결제하시면 본품 1개가 자동으로 함께 동봉되어 총 2개가 배송됩니다. 옵션 교차 증정의 경우 옵션 선택창에서 원하시는 세트 구성을 선택하실 수 있습니다.',
  },
  {
    category: '반품/환불',
    question: '화장품 사용 후 피부에 맞지 않는데 환불이 가능한가요?',
    answer: '다써바는 100% 피부 불만족 안심 환불 보장제를 운영하고 있습니다. 제품 수령 후 7일 이내에 피부 트러블이나 이상 반응이 있을 경우 고객센터 또는 마이페이지를 통해 환불을 신청해주시면 전액 환불해 드립니다.',
  },
  {
    category: '포인트/쿠폰',
    question: '적립금(포인트)은 어떻게 사용하며 유효기간이 있나요?',
    answer: '보유 포인트가 1,000P 이상일 경우 결제 단계에서 1P 단위로 자유롭게 사용하실 수 있으며, 1회 주문 시 상품 금액의 최대 50%까지 포인트로 결제하실 수 있습니다.',
  },
  {
    category: '성분/안전',
    question: '임산부나 청소년도 사용할 수 있는 순한 성분인가요?',
    answer: '다써바의 전 제품은 20가지 주의 성분을 배제하고 EWG 그린 등급 원료를 중심으로 설계된 저자극 비건 포뮬러입니다. 민감성 피부 대상 저자극 테스트를 완료하여 안심하고 사용하실 수 있습니다.',
  },
];

export default function CustomerServicePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQ_LIST.filter(
    (faq) => selectedCategory === 'all' || faq.category === selectedCategory
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* 빵부스러기 */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition-colors">홈</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold">고객센터</span>
      </nav>

      {/* 헤더 */}
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 flex items-center gap-2">
          <Headphones className="w-7 h-7 text-rose-500" />
          다써바 고객만족센터
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          궁금하신 사항을 가장 빠르고 정확하게 안내해 드립니다.
        </p>
      </div>

      {/* CS 연락처 카드 2단 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-neutral-900 text-white p-6 rounded-3xl space-y-3 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
              <PhoneCall className="w-4 h-4" /> 전화 상담 문의
            </div>
            <p className="text-3xl font-black text-white mt-1">1588-0000</p>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              평일 : 09:30 ~ 18:00 (점심 12:30 ~ 13:30)<br />
              토/일/공휴일 휴무
            </p>
          </div>
          <Link
            href="/mypage/inquiries"
            className="inline-block text-center bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
          >
            1:1 온라인 문의 남기기
          </Link>
        </div>

        <div className="bg-gradient-to-br from-[#FEE500] to-[#FDD835] text-[#3C1E1E] p-6 rounded-3xl space-y-3 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#3C1E1E] text-xs font-bold">
              <MessageCircle className="w-4 h-4 fill-[#3C1E1E]" /> 카카오톡 실시간 상담
            </div>
            <p className="text-2xl font-black mt-1">카카오톡 채널 상담</p>
            <p className="text-xs opacity-80 mt-2 leading-relaxed">
              365일 24시간 언제 어디서나 상담원과 1:1로 빠르게 대화하세요.
            </p>
          </div>
          <a
            href="https://pf.kakao.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-[#3C1E1E] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-black transition-colors"
          >
            카카오톡 상담창 바로가기
          </a>
        </div>
      </div>

      {/* 자주 묻는 질문 FAQ 섹션 */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-rose-500" />
            자주 묻는 질문 (FAQ)
          </h2>

          {/* 카테고리 칩 */}
          <div className="flex flex-wrap gap-1 text-xs">
            {['all', '배송', '1+1 이벤트', '반품/환불', '포인트/쿠폰', '성분/안전'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat === 'all' ? '전체보기' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* 아코디언 FAQ 목록 */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center shrink-0">
                      Q
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-neutral-900">{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-rose-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="p-5 pt-0 bg-neutral-50/50 border-t border-neutral-100 text-xs text-neutral-700 leading-relaxed animate-in fade-in duration-200">
                    <p className="pl-9">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
