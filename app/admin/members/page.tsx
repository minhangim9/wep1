'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { UserProfile, MembershipTier } from '@/types';
import { Users, Search, Plus, Minus, ShieldCheck, Award } from 'lucide-react';

export default function AdminMembersPage() {
  const { user, addPoints, showToast } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');

  // 데모 회원 리스트
  const [membersList, setMembersList] = useState<UserProfile[]>([
    {
      id: 'user-001',
      name: '홍길동',
      email: 'customer@dasseoba.com',
      phone: '010-5555-1234',
      role: 'customer',
      tier: 'GOLD',
      skinType: '복합성',
      points: 4500,
      marketingAgreed: true,
      createdAt: '2026-08-01',
    },
    {
      id: 'user-002',
      name: '김민지',
      email: 'minji@naver.com',
      phone: '010-1234-5678',
      role: 'customer',
      tier: 'VIP',
      skinType: '민감성',
      points: 12500,
      marketingAgreed: true,
      createdAt: '2026-07-15',
    },
    {
      id: 'user-003',
      name: '박서준',
      email: 'seojun@gmail.com',
      phone: '010-9876-5432',
      role: 'customer',
      tier: 'SILVER',
      skinType: '지성',
      points: 2000,
      marketingAgreed: false,
      createdAt: '2026-09-10',
    },
  ]);

  // 포인트 지급 모달 상태
  const [pointModalMember, setPointModalMember] = useState<UserProfile | null>(null);
  const [pointAmount, setPointAmount] = useState<number>(1000);
  const [pointReason, setPointReason] = useState('관리자 특별 감사 포인트');

  const filteredMembers = membersList.filter((m) => {
    if (selectedTierFilter !== 'all' && m.tier !== selectedTierFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.phone.includes(q);
    }
    return true;
  });

  const handleUpdateTier = (id: string, newTier: MembershipTier) => {
    setMembersList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, tier: newTier } : m))
    );
    showToast(`회원 등급이 [${newTier}]로 변경되었습니다.`, 'success');
  };

  const handleGrantPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointModalMember) return;

    setMembersList((prev) =>
      prev.map((m) =>
        m.id === pointModalMember.id ? { ...m, points: m.points + pointAmount } : m
      )
    );

    if (user && user.id === pointModalMember.id) {
      addPoints(pointAmount, pointReason, 'ADMIN_ADJUST');
    }

    showToast(`${pointModalMember.name} 회원에게 ${pointAmount.toLocaleString()}P가 지급되었습니다.`, 'success');
    setPointModalMember(null);
  };

  return (
    <div className="space-y-6 text-xs">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-600" />
            회원 및 등급 관리
          </h1>
          <p className="text-neutral-500 mt-1">
            등록된 고객 정보 조회, 등급 조정 및 적립금(포인트) 수동 지급을 관리합니다.
          </p>
        </div>
      </div>

      {/* 필터 및 검색 바 */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="회원 이름, 이메일, 휴대폰 번호 검색"
            className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-xs focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-600">등급 필터:</span>
          <select
            value={selectedTierFilter}
            onChange={(e) => setSelectedTierFilter(e.target.value)}
            className="bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-xs font-semibold cursor-pointer"
          >
            <option value="all">전체 등급</option>
            <option value="VIP">VIP</option>
            <option value="GOLD">GOLD</option>
            <option value="SILVER">SILVER</option>
            <option value="BRONZE">BRONZE</option>
            <option value="WELCOME">WELCOME</option>
          </select>
        </div>
      </div>

      {/* 회원 테이블 */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-neutral-200">
            <thead className="bg-neutral-50 text-neutral-500 font-bold">
              <tr>
                <th className="p-4">회원명 / 아이디</th>
                <th className="p-4">연락처</th>
                <th className="p-4">피부타입</th>
                <th className="p-4">회원 등급</th>
                <th className="p-4">보유 포인트</th>
                <th className="p-4">가입일</th>
                <th className="p-4 text-right">관리 액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-neutral-50/50">
                  <td className="p-4">
                    <strong className="text-neutral-900 block">{member.name}</strong>
                    <span className="text-neutral-400 text-[11px]">{member.email}</span>
                  </td>
                  <td className="p-4 font-mono">{member.phone}</td>
                  <td className="p-4">
                    <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[11px] font-bold">
                      {member.skinType || '미설정'}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={member.tier}
                      onChange={(e) => handleUpdateTier(member.id, e.target.value as MembershipTier)}
                      className="bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-lg px-2 py-1 text-xs cursor-pointer"
                    >
                      <option value="WELCOME">WELCOME (1% 적립)</option>
                      <option value="BRONZE">BRONZE (2% 적립)</option>
                      <option value="SILVER">SILVER (3% 적립)</option>
                      <option value="GOLD">GOLD (4% 적립)</option>
                      <option value="VIP">VIP (5% 적립 + 무료배송)</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <strong className="text-rose-600 font-bold">{member.points.toLocaleString()} P</strong>
                  </td>
                  <td className="p-4 text-neutral-400">{member.createdAt}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setPointModalMember(member)}
                      className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-3 py-1.5 rounded-lg text-[11px]"
                    >
                      포인트 지급/차감
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 포인트 지급 모달 */}
      {pointModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-neutral-900">
              [{pointModalMember.name}] 회원 포인트 수동 지급/차감
            </h3>
            <form onSubmit={handleGrantPoints} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">지급/차감 포인트 금액 (음수는 차감)</label>
                <input
                  type="number"
                  required
                  value={pointAmount}
                  onChange={(e) => setPointAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">지급 사유</label>
                <input
                  type="text"
                  required
                  value={pointReason}
                  onChange={(e) => setPointReason(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPointModalMember(null)}
                  className="flex-1 py-2.5 border border-neutral-300 rounded-lg font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-500"
                >
                  적용 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
