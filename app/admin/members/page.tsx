'use client';

import React, { useState, useEffect } from 'react';
import { useShop } from '@/context/ShopContext';
import { UserProfile, MembershipTier, AdminMenuKey } from '@/types';
import {
  Users,
  Search,
  RefreshCw,
  Sparkles,
  Database,
  Loader2,
  UserCheck,
  ShieldCheck,
  ShieldX,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  fetchMembers,
  updateMemberTier,
  updateMemberPoints,
  updateMemberRoleInSupabase,
} from '@/lib/supabase';

const MENU_OPTIONS: { key: AdminMenuKey; label: string; desc: string }[] = [
  { key: 'dashboard', label: '어드민 대시보드', desc: '매출, 통계, 감사 기록' },
  { key: 'members', label: '회원 & 등급 관리', desc: '회원 목록, 등급/포인트' },
  { key: 'products', label: '상품 등록 & 관리', desc: '신규 상품, 1+1, 품절 관리' },
  { key: 'orders', label: '주문 & 발주 관리', desc: '주문 접수, 상태 변경' },
  { key: 'delivery', label: '배송 & 송장 관리', desc: '송장 등록, 배송 추적' },
  { key: 'inventory', label: '재고 & 원부자재', desc: '용기/단상자/원료 재고' },
  { key: 'tax', label: '세금명세서/영수증', desc: '세금계산서, 영수증 출력' },
  { key: 'popups', label: '팝업 & 이벤트', desc: '공지 팝업, 이벤트 배너' },
];

const DEFAULT_MEMBERS: UserProfile[] = [
  {
    id: 'user-001',
    name: '홍길동',
    email: 'customer@piuda.kr',
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
];

export default function AdminMembersPage() {
  const {
    user,
    addPoints,
    showToast,
    openSupabaseModal,
    adminAccounts,
    assignMemberAsSubAdmin,
    revokeSubAdmin,
  } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [membersList, setMembersList] = useState<UserProfile[]>(DEFAULT_MEMBERS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  // 포인트 지급 모달 상태
  const [pointModalMember, setPointModalMember] = useState<UserProfile | null>(null);
  const [pointAmount, setPointAmount] = useState<number>(1000);
  const [pointReason, setPointReason] = useState('관리자 특별 감사 포인트');

  // 부관리자 지정 모달 상태
  const [assignModalMember, setAssignModalMember] = useState<UserProfile | null>(null);
  const [assignPermissions, setAssignPermissions] = useState<AdminMenuKey[]>([
    'dashboard',
    'orders',
    'delivery',
  ]);
  const [assignMemo, setAssignMemo] = useState('회원 관리 콘솔에서 부관리자 임명');
  const [isAssignSubmitting, setIsAssignSubmitting] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Supabase 회원 데이터 불러오기
  const loadSupabaseMembers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await fetchMembers();
      if (data && data.length > 0) {
        setMembersList(data);
        setIsSupabaseConnected(true);
      } else {
        if (error) {
          console.warn('fetchMembers notice:', error);
        }
        setIsSupabaseConnected(false);
      }
    } catch (err) {
      console.error('Failed to load members from Supabase', err);
      setIsSupabaseConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSupabaseMembers();
  }, []);

  const filteredMembers = membersList.filter((m) => {
    if (selectedTierFilter !== 'all' && m.tier !== selectedTierFilter) return false;
    if (selectedRoleFilter !== 'all') {
      const isTargetAdmin = selectedRoleFilter === 'admin';
      const isMemberAdmin = m.role === 'admin';
      if (isTargetAdmin !== isMemberAdmin) return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.includes(q)
      );
    }
    return true;
  });

  // 회원 권한 (Role) 직접 변경 핸들러 (Supabase members 테이블 및 Authentication 동시 저장)
  const handleUpdateRole = async (member: UserProfile, newRole: 'customer' | 'admin') => {
    if (member.role === newRole) return;

    if (member.email === 'admin@piuda.kr' && newRole === 'customer') {
      alert('총괄 최고 관리자 계정(admin@piuda.kr)은 일반회원으로 강등할 수 없습니다.');
      return;
    }

    const roleLabel = newRole === 'admin' ? '관리자' : '일반회원';
    const confirmMsg = `'${member.name}' 회원의 권한을 [${roleLabel}]으로 변경하시겠습니까?\n\n- Supabase members 테이블의 role 컬럼이 갱신됩니다.\n- Supabase Authentication (Users 메타데이터)에 변경된 권한이 동기화됩니다.`;
    if (!confirm(confirmMsg)) {
      return;
    }

    setUpdatingRoleId(member.id);
    try {
      const defaultPerms: AdminMenuKey[] =
        newRole === 'admin' ? ['dashboard', 'members', 'products', 'orders', 'delivery'] : [];

      const res = await updateMemberRoleInSupabase({
        memberId: member.id,
        email: member.email,
        role: newRole,
        name: member.name,
        phone: member.phone,
        permissions: defaultPerms,
      });

      if (res.success) {
        setMembersList((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, role: newRole } : m))
        );
        showToast(
          `'${member.name}' 회원의 권한이 [${roleLabel}]으로 성공적으로 변경되었습니다. (Supabase members & Authentication 저장 완료)`,
          'success'
        );
      } else {
        alert(res.error || '권한 변경에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Role update error:', err);
      alert('권한 변경 중 예외가 발생했습니다.');
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleUpdateTier = async (id: string, newTier: MembershipTier) => {
    setMembersList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, tier: newTier } : m))
    );
    await updateMemberTier(id, newTier);
    showToast(`회원 등급이 [${newTier}]로 변경되었습니다. (DB 동기화 완료)`, 'success');
  };

  const handleGrantPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointModalMember) return;

    const updatedPoints = pointModalMember.points + pointAmount;
    setMembersList((prev) =>
      prev.map((m) =>
        m.id === pointModalMember.id ? { ...m, points: updatedPoints } : m
      )
    );

    await updateMemberPoints(pointModalMember.id, updatedPoints);

    if (user && user.id === pointModalMember.id) {
      addPoints(pointAmount, pointReason, 'ADMIN_ADJUST');
    }

    showToast(
      `${pointModalMember.name} 회원에게 ${pointAmount.toLocaleString()}P가 지급되었습니다. (DB 동기화 완료)`,
      'success'
    );
    setPointModalMember(null);
  };

  // 부관리자 지정 모달 열기
  const handleOpenAssignModal = (member: UserProfile) => {
    const existingAdmin = adminAccounts.find((a) => a.email === member.email);
    if (existingAdmin && existingAdmin.permissions) {
      setAssignPermissions(existingAdmin.permissions);
      setAssignMemo(existingAdmin.memo || '부관리자 권한 수정');
    } else {
      setAssignPermissions(['dashboard', 'orders', 'delivery']);
      setAssignMemo(`${member.name} 부관리자 임명 (주문/배송/CS 담당)`);
    }
    setAssignError(null);
    setAssignModalMember(member);
  };

  // 부관리자 권한 토글
  const handleToggleAssignPerm = (key: AdminMenuKey) => {
    setAssignPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // 부관리자 지정 제출
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalMember) return;
    if (assignPermissions.length === 0) {
      setAssignError('최소 1개 이상의 메뉴 접근 권한을 선택해주세요.');
      return;
    }

    setIsAssignSubmitting(true);
    setAssignError(null);

    const res = await assignMemberAsSubAdmin({
      memberId: assignModalMember.id,
      email: assignModalMember.email,
      name: assignModalMember.name,
      phone: assignModalMember.phone,
      permissions: assignPermissions,
      memo: assignMemo.trim(),
    });
    setIsAssignSubmitting(false);

    if (res.success) {
      // 로컬 멤버 리스트의 role도 업데이트
      setMembersList((prev) =>
        prev.map((m) =>
          m.id === assignModalMember.id ? { ...m, role: 'admin' } : m
        )
      );
      showToast(`'${assignModalMember.name}'님이 부관리자로 지정되었습니다!`, 'success');
      setAssignModalMember(null);
    } else {
      setAssignError(res.error || '부관리자 지정에 실패했습니다.');
    }
  };

  // 부관리자 해제
  const handleRevoke = async (member: UserProfile) => {
    if (confirm(`'${member.name}'님의 부관리자 권한을 해제하시겠습니까?`)) {
      const res = await revokeSubAdmin(member.email);
      if (res.success) {
        setMembersList((prev) =>
          prev.map((m) =>
            m.id === member.id ? { ...m, role: 'customer' } : m
          )
        );
        showToast(`'${member.name}'님의 부관리자 권한이 해제되었습니다.`, 'info');
      } else {
        alert(res.error || '해제 처리에 실패했습니다.');
      }
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-rose-600" />
              회원 관리 (권한 / 등급 / 포인트)
            </h1>
            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Database className="w-3 h-3 text-emerald-600" />
              Supabase members & Auth 실시간 연동
            </span>
          </div>
          <p className="text-neutral-500 mt-1">
            신규 가입 회원을 확인하고, [일반회원] ⇄ [관리자] 권한을 즉시 수정할 수 있습니다. 변경된 권한은 Supabase members 테이블과 Authentication(Users)에 실시간 자동 동기화됩니다.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={openSupabaseModal}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
          >
            <Database className="w-3.5 h-3.5 text-rose-600" />
            <span>Supabase API Key 설정</span>
          </button>
          <button
            type="button"
            onClick={loadSupabaseMembers}
            disabled={isLoading}
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>DB 새로고침</span>
          </button>
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

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-600">권한 필터:</span>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-xs font-semibold cursor-pointer"
            >
              <option value="all">전체 권한</option>
              <option value="customer">👤 일반회원만</option>
              <option value="admin">🛡️ 관리자만</option>
            </select>
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
      </div>

      {/* 회원 테이블 */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-neutral-200">
            <thead className="bg-neutral-50 text-neutral-500 font-bold">
              <tr>
                <th className="p-4">회원명 / 아이디(이메일)</th>
                <th className="p-4">연락처</th>
                <th className="p-4">피부타입</th>
                <th className="p-4">회원 등급</th>
                <th className="p-4">보유 포인트</th>
                <th className="p-4">권한 수정 (Role)</th>
                <th className="p-4 text-right">관리 액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-400">
                    검색 조건에 일치하는 회원이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const isAdminRole = member.role === 'admin';
                  const adminAcc = adminAccounts.find((a) => a.email === member.email);

                  return (
                    <tr key={member.id} className="hover:bg-neutral-50/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <strong className="text-neutral-900 block">{member.name}</strong>
                            <span className="text-neutral-400 text-[11px] font-mono">
                              {member.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono">{member.phone || '-'}</td>
                      <td className="p-4">
                        <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[11px] font-bold">
                          {member.skinType || '민감성'}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={member.tier}
                          onChange={(e) =>
                            handleUpdateTier(member.id, e.target.value as MembershipTier)
                          }
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
                        <strong className="text-rose-600 font-bold">
                          {member.points.toLocaleString()} P
                        </strong>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <select
                            value={isAdminRole ? 'admin' : 'customer'}
                            disabled={updatingRoleId === member.id || member.email === 'admin@piuda.kr'}
                            onChange={(e) =>
                              handleUpdateRole(member, e.target.value as 'customer' | 'admin')
                            }
                            className={`text-xs font-bold rounded-lg px-2.5 py-1.5 transition cursor-pointer border shadow-2xs ${
                              isAdminRole
                                ? 'bg-neutral-900 text-amber-300 border-neutral-700'
                                : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-400'
                            }`}
                          >
                            <option value="customer">👤 일반회원 (customer)</option>
                            <option value="admin">🛡️ 관리자 (admin)</option>
                          </select>

                          {updatingRoleId === member.id && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                          )}
                        </div>
                        {member.email === 'admin@piuda.kr' && (
                          <span className="block text-[10px] text-neutral-400 mt-0.5">
                            (최고 총괄 관리자)
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 포인트 지급/차감 버튼 */}
                          <button
                            onClick={() => setPointModalMember(member)}
                            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold px-2.5 py-1.5 rounded-lg text-[11px] transition cursor-pointer"
                          >
                            포인트 관리
                          </button>

                          {/* 관리자인 경우 세부 메뉴 권한 수정 버튼 */}
                          {(isAdminRole || adminAcc) && (
                            <button
                              onClick={() => handleOpenAssignModal(member)}
                              className="inline-flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-2.5 py-1.5 rounded-lg text-[11px] transition shadow-xs cursor-pointer"
                              title="세부 메뉴 접근 권한 설정"
                            >
                              <ShieldCheck className="w-3 h-3 text-amber-400" />
                              <span>메뉴 권한 상세</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
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
                <label className="font-bold text-neutral-700 block mb-1">
                  지급/차감 포인트 금액 (음수는 차감)
                </label>
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
                  className="flex-1 py-2.5 border border-neutral-300 rounded-lg font-bold hover:bg-neutral-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-500 cursor-pointer"
                >
                  적용 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 총괄 관리자의 부관리자 지정 모달 */}
      {assignModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-neutral-950 text-white p-6 relative">
              <button
                onClick={() => setAssignModalMember(null)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold mb-1">
                <UserCheck className="w-4 h-4" />
                <span>총괄 관리자 권한</span>
              </div>
              <h3 className="text-xl font-black text-white">
                [{assignModalMember.name}] 회원 부관리자 임명
              </h3>
              <p className="text-xs text-neutral-400 mt-1 font-mono">
                {assignModalMember.email} · {assignModalMember.phone}
              </p>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {assignError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{assignError}</span>
                </div>
              )}

              {/* 메뉴 권한 선택 */}
              <div className="space-y-2">
                <label className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  부여할 메뉴별 접근 권한 (Role) 선택 *
                </label>
                <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                  {MENU_OPTIONS.map((item) => {
                    const isChecked = assignPermissions.includes(item.key);
                    return (
                      <label
                        key={item.key}
                        className={`flex items-start gap-2 p-2 rounded-xl border transition cursor-pointer ${
                          isChecked
                            ? 'bg-rose-50/70 border-rose-300 text-rose-950 font-bold'
                            : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleAssignPerm(item.key)}
                          className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                        />
                        <div className="leading-tight">
                          <p className="text-xs">{item.label}</p>
                          <span className="text-[10px] text-neutral-400 font-normal">
                            {item.desc}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 메모 */}
              <div>
                <label className="block font-bold text-neutral-800 mb-1">담당 업무 / 메모</label>
                <input
                  type="text"
                  value={assignMemo}
                  onChange={(e) => setAssignMemo(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalMember(null)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-3 rounded-xl transition cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isAssignSubmitting}
                  className="flex-1 bg-neutral-950 hover:bg-neutral-800 text-white font-bold py-3 rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-rose-400" />
                  <span>{isAssignSubmitting ? '임명 처리 중...' : '부관리자로 임명 완료'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
