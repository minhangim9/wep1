'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { Reservation } from '@/types';
import {
  ChevronRight,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  User,
  Phone,
} from 'lucide-react';

export default function ReservationPage() {
  const { reservations, createReservation, user, showToast } = useShop();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceType, setServiceType] = useState<Reservation['serviceType']>('1:1 맞춤 스킨케어 진단');
  const [reservationDate, setReservationDate] = useState('2026-10-20');
  const [reservationTime, setReservationTime] = useState('14:00');
  const [applicantName, setApplicantName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [skinConcerns, setSkinConcerns] = useState('');

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !phone || !skinConcerns) {
      showToast('신청 정보를 모두 입력해주세요.', 'error');
      return;
    }

    createReservation({
      userId: user?.id || 'guest',
      applicantName,
      phone,
      serviceType,
      reservationDate,
      reservationTime,
      skinConcerns,
    });

    setIsModalOpen(false);
    setSkinConcerns('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 빵부스러기 */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition-colors">홈</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/cs" className="hover:text-neutral-900 transition-colors">고객센터</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold">피부진단 & 클래스 예약 확인</span>
      </nav>

      {/* 헤더 배너 */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-3xl p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-0.5 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> 다써바 플래그십 뷰티랩
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            1:1 피부 맞춤 진단 & 뷰티 클래스
          </h1>
          <p className="text-xs text-rose-100 max-w-md leading-relaxed">
            전문 뷰티 어드바이저가 첨단 진단 기기로 수분/유분/모공/주름을 정밀 분석하고 최적의 화장품 루틴을 무료로 컨설팅해 드립니다.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              showToast('예약을 위해 로그인해주세요.', 'error');
              return;
            }
            setIsModalOpen(true);
          }}
          className="bg-white text-rose-600 font-bold px-6 py-3.5 rounded-2xl hover:bg-neutral-100 transition-colors text-xs sm:text-sm whitespace-nowrap shadow-md self-start sm:self-center"
        >
          무료 예약 신청하기
        </button>
      </div>

      {/* 예약 확인 목록 */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-neutral-900">
          실시간 예약 신청 & 확정 내역 ({reservations.length}건)
        </h3>

        <div className="space-y-4">
          {reservations.map((res) => (
            <div
              key={res.id}
              className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-neutral-900">{res.serviceType}</span>
                  <span className="text-neutral-400">신청자: {res.applicantName}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  res.status === 'confirmed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : res.status === 'completed'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {res.status === 'confirmed' && '✓ 예약확정 (방문예정)'}
                  {res.status === 'pending' && '대기중 (상담실 배정중)'}
                  {res.status === 'completed' && '방문 및 진단 완료'}
                  {res.status === 'cancelled' && '예약 취소'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-600">
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  <strong>예약일자 :</strong> {res.reservationDate} ({res.reservationTime})
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <strong>연락처 :</strong> {res.phone}
                </p>
              </div>

              <div className="bg-neutral-50 p-3 rounded-xl">
                <strong className="text-neutral-700 block mb-1">상담 희망 피부 고민:</strong>
                <p className="text-neutral-600">{res.skinConcerns}</p>
              </div>

              {res.adminNotes && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 space-y-0.5">
                  <p className="font-bold text-[11px]">안내 메모 :</p>
                  <p>{res.adminNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 예약 신청 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-neutral-900">1:1 뷰티랩 무료 진단 예약</h3>
            <form onSubmit={handleCreateReservation} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">상담 프로그램 선택 *</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as any)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white cursor-pointer"
                >
                  <option value="1:1 맞춤 스킨케어 진단">1:1 맞춤 스킨케어 정밀 진단 (40분)</option>
                  <option value="퍼스널 컬러 & 메이크업 클래스">퍼스널 컬러 & 메이크업 클래스 (60분)</option>
                  <option value="비건 뷰티 팝업 쇼룸 방문">비건 뷰티 팝업 쇼룸 프라이빗 방문 (30분)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">희망 날짜 *</label>
                  <input
                    type="date"
                    required
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">희망 시간 *</label>
                  <select
                    value={reservationTime}
                    onChange={(e) => setReservationTime(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs cursor-pointer"
                  >
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">14:00 PM</option>
                    <option value="15:30">15:30 PM</option>
                    <option value="17:00">17:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">예약자명 *</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="성함"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">연락처 *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">피부 고민 및 요청사항 *</label>
                <textarea
                  required
                  rows={3}
                  value={skinConcerns}
                  onChange={(e) => setSkinConcerns(e.target.value)}
                  placeholder="예: 볼 부위 붉은 기와 속건조가 심해서 수분 진정 케어 진단 희망합니다."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-300 rounded-lg text-neutral-700 font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold transition-colors"
                >
                  예약 신청 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
