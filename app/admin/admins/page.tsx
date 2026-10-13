'use client';

import React, { useState, useEffect } from 'react';
import { useShop } from '@/context/ShopContext';
import { AdminAccount, AdminMenuKey, AdminRoleType, AdminAccountStatus, UserProfile } from '@/types';
import { fetchMembers } from '@/lib/supabase';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  Smartphone,
  Edit3,
  Ban,
  Check,
  RefreshCw,
  Search,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Database,
  UserCheck,
  Sparkles,
  ArrowRight,
  ShieldX,
} from 'lucide-react';

interface MenuOption {
  key: AdminMenuKey;
  label: string;
  category: string;
  desc: string;
}

const MENU_OPTIONS: MenuOption[] = [
  { key: 'dashboard', label: '어드민 대시보드', category: '핵심', desc: '매출, 안전재고 현황 및 접속 감사 기록' },
  { key: 'members', label: '회원 & 등급 관리', category: '고객', desc: '회원 목록, 등급(VIP/GOLD), 적립금 관리' },
  { key: 'products', label: '상품 등록 & 관리', category: '상품', desc: '화장품 신규 등록, 1+1 설정, 품절 관리' },
  { key: 'orders', label: '주문 & 발주 관리', category: '주문', desc: '실시간 주문 접수, 상태 변경, 취소/환불' },
  { key: 'delivery', label: '배송 & 송장 관리', category: '물류', desc: '택배사 송장 등록, 배송 추적, 주소지 관리' },
  { key: 'inventory', label: '재고 & 원부자재', category: '생산', desc: '용기/단상자/원료 재고 수불 및 안전재고' },
  { key: 'tax', label: '세금명세서/영수증', category: '회계', desc: '전자세금계산서 발행 및 현금영수증 출력' },
  { key: 'popups', label: '팝업 & 이벤트', category: '마케팅', desc: '쇼핑몰 공지 팝업, 이벤트 배너 관리' },
];

export default function AdminManagementPage() {
  const {
    adminAccounts,
    isLoadingAdminAccounts,
    refreshAdminAccounts,
    createAdminAccount,
    updateAdminAccount,
    toggleAdminStatus,
    assignMemberAsSubAdmin,
    revokeSubAdmin,
    showToast,
    user,
  } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');

  // 직접 등록 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);

  // 일반 회원을 부관리자로 지정 모달 상태
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [allMembers, setAllMembers] = useState<UserProfile[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);
  const [assignPermissions, setAssignPermissions] = useState<AdminMenuKey[]>([
    'dashboard',
    'orders',
    'delivery',
  ]);
  const [assignMemo, setAssignMemo] = useState('');
  const [assignPassword, setAssignPassword] = useState('');
  const [isAssignSubmitting, setIsAssignSubmitting] = useState(false);

  // 직접 등록 폼 상태
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<AdminRoleType>('sub_admin');
  const [formStatus, setFormStatus] = useState<AdminAccountStatus>('active');
  const [formPermissions, setFormPermissions] = useState<AdminMenuKey[]>(['dashboard']);
  const [formMemo, setFormMemo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 회원 목록 로드 (부관리자 지정 모달용)
  const loadMembersForAssign = async () => {
    setIsLoadingMembers(true);
    try {
      const { data } = await fetchMembers();
      if (data && data.length > 0) {
        setAllMembers(data);
      }
    } catch (err) {
      console.error('Failed to load members for assign', err);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    loadMembersForAssign();
  }, []);

  // 필터링된 계정 목록
  const filteredAccounts = adminAccounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || acc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // 통계 계산
  const totalCount = adminAccounts.length;
  const activeCount = adminAccounts.filter((a) => a.status === 'active').length;
  const suspendedCount = adminAccounts.filter((a) => a.status === 'suspended').length;
  const superAdminCount = adminAccounts.filter((a) => a.role === 'super_admin').length;

  // 일반 회원을 부관리자로 지정 모달 열기
  const handleOpenAssignModal = () => {
    loadMembersForAssign();
    setSelectedMember(null);
    setMemberSearchQuery('');
    setAssignPermissions(['dashboard', 'orders', 'delivery']);
    setAssignMemo('총괄 관리자 권한 지정 (CS/배송/주문 관리)');
    setAssignPassword('');
    setFormError(null);
    setIsAssignModalOpen(true);
  };

  // 일반 회원 부관리자 임명 실행 (Supabase admin_accounts + members 동기화)
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      setFormError('부관리자로 지정할 회원을 선택해주세요.');
      return;
    }
    if (assignPermissions.length === 0) {
      setFormError('최소 1개 이상의 메뉴 접근 권한을 선택해주세요.');
      return;
    }

    setIsAssignSubmitting(true);
    setFormError(null);

    const res = await assignMemberAsSubAdmin({
      memberId: selectedMember.id,
      email: selectedMember.email,
      name: selectedMember.name,
      phone: selectedMember.phone,
      permissions: assignPermissions,
      memo: assignMemo.trim() || `${selectedMember.name} 부관리자 임명`,
    });
    setIsAssignSubmitting(false);

    if (res.success) {
      setIsAssignModalOpen(false);
      showToast(`'${selectedMember.name}'님이 부관리자로 임명되었습니다! (권한 ${assignPermissions.length}개 부여)`, 'success');
      loadMembersForAssign();
    } else {
      setFormError(res.error || '부관리자 지정에 실패했습니다.');
    }
  };

  // 부관리자 권한 해제 (일반회원으로 복귀)
  const handleRevokeSubAdmin = async (acc: AdminAccount) => {
    if (acc.role === 'super_admin' || acc.email === 'admin@piuda.kr') {
      alert('최고 관리자 계정은 해제할 수 없습니다.');
      return;
    }
    if (
      confirm(
        `'${acc.name}'(${acc.email})님의 부관리자 권한을 해제하고 일반 회원으로 복귀시키겠습니까?\n\n해제 시 관리자 콘솔 접근 권한이 즉시 회수됩니다.`
      )
    ) {
      const res = await revokeSubAdmin(acc.email);
      if (res.success) {
        showToast(`'${acc.name}'님의 부관리자 권한이 해제되었습니다.`, 'info');
      } else {
        alert(res.error || '해제 처리에 실패했습니다.');
      }
    }
  };

  // 신규 등록 모달 열기
  const handleOpenCreateModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('010-');
    setFormPassword('');
    setFormRole('sub_admin');
    setFormStatus('active');
    setFormPermissions(['dashboard']);
    setFormMemo('');
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  // 수정 모달 열기
  const handleOpenEditModal = (acc: AdminAccount) => {
    setEditingAccount(acc);
    setFormName(acc.name);
    setFormEmail(acc.email);
    setFormPhone(acc.phone);
    setFormPassword(''); // 비워두면 기존 유지
    setFormRole(acc.role);
    setFormStatus(acc.status);
    setFormPermissions(acc.permissions || ['dashboard']);
    setFormMemo(acc.memo || '');
    setFormError(null);
  };

  // 메뉴 권한 토글 (모달 공용)
  const handleTogglePermission = (
    key: AdminMenuKey,
    target: 'create' | 'assign' = 'create'
  ) => {
    if (target === 'assign') {
      setAssignPermissions((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    } else {
      setFormPermissions((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    }
  };

  // 전체 선택 / 해제
  const handleSelectAll = (select: boolean, target: 'create' | 'assign' = 'create') => {
    const allKeys = MENU_OPTIONS.map((m) => m.key);
    if (target === 'assign') {
      setAssignPermissions(select ? allKeys : ['dashboard']);
    } else {
      setFormPermissions(select ? allKeys : ['dashboard']);
    }
  };

  // 직접 등록 처리
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formEmail.trim() || !formPhone.trim() || !formPassword) {
      setFormError('이름, 이메일, 휴대폰 번호, 초기 비밀번호를 모두 입력해주세요.');
      return;
    }
    if (formPassword.length < 6) {
      setFormError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsSubmitting(true);
    const res = await createAdminAccount({
      email: formEmail.trim(),
      plainPassword: formPassword,
      name: formName.trim(),
      phone: formPhone.trim(),
      role: formRole,
      status: formStatus,
      permissions: formPermissions,
      memo: formMemo.trim(),
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsCreateModalOpen(false);
      showToast('새 부관리자 계정이 생성되었습니다.', 'success');
    } else {
      setFormError(res.error || '계정 등록에 실패했습니다.');
    }
  };

  // 부관리자 수정 처리
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    setFormError(null);

    if (!formName.trim() || !formPhone.trim()) {
      setFormError('이름과 휴대폰 번호는 필수 항목입니다.');
      return;
    }

    setIsSubmitting(true);
    const updates: Partial<AdminAccount> & { newPlainPassword?: string } = {
      name: formName.trim(),
      phone: formPhone.trim(),
      role: formRole,
      status: formStatus,
      permissions: formPermissions,
      memo: formMemo.trim(),
    };

    if (formPassword.trim()) {
      if (formPassword.length < 6) {
        setIsSubmitting(false);
        setFormError('새 비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
      updates.newPlainPassword = formPassword.trim();
    }

    const res = await updateAdminAccount(editingAccount.id, updates);
    setIsSubmitting(false);

    if (res.success) {
      setEditingAccount(null);
      showToast('관리자 계정 및 권한이 업데이트되었습니다.', 'success');
    } else {
      setFormError(res.error || '계정 수정에 실패했습니다.');
    }
  };

  // 상태값 토글 (active <-> suspended)
  const handleStatusToggle = async (acc: AdminAccount) => {
    if (acc.email === 'admin@piuda.kr') {
      alert('최고 관리자(대표 마스터) 계정은 승인중지할 수 없습니다.');
      return;
    }
    const nextStatus = acc.status === 'active' ? 'suspended' : 'active';
    const confirmMsg =
      nextStatus === 'suspended'
        ? `[경고] '${acc.name}' 계정을 [승인중지] 상태로 변경하시겠습니까?\n\n승인중지 시 해당 계정은 즉시 접속이 차단되며, 현재 활동 중인 세션도 즉시 강제 만료됩니다.`
        : `'${acc.name}' 계정을 다시 [정상 승인] 상태로 변경하시겠습니까?`;

    if (confirm(confirmMsg)) {
      await toggleAdminStatus(acc.id, nextStatus);
    }
  };

  // 부관리자 지정 모달에서 회원 검색 필터링
  const filteredCandidates = allMembers.filter((m) => {
    const q = memberSearchQuery.toLowerCase();
    const isAlreadyAdmin = adminAccounts.some((a) => a.email === m.email);
    const match =
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.phone.includes(q);
    return match && (!selectedMember || selectedMember.id === m.id);
  });

  return (
    <div className="space-y-8">
      {/* 1. 상단 헤더 & 액션 버튼들 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">
              부관리자 및 메뉴 권한 관리
            </h1>
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
              총괄 관리자 전용
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            총괄 관리자가 일반 회원을 부관리자로 직접 지정·임명하거나, 부관리자 계정을 등록하여 메뉴별 접근 권한(Role)을 부여합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => refreshAdminAccounts()}
            disabled={isLoadingAdminAccounts}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isLoadingAdminAccounts ? 'animate-spin text-rose-600' : ''
              }`}
            />
            <span>새로고침</span>
          </button>

          {/* 핵심: 총괄 관리자가 일반 회원을 부관리자로 지정하는 버튼 */}
          <button
            onClick={handleOpenAssignModal}
            className="inline-flex items-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer border border-neutral-800"
          >
            <UserCheck className="w-4 h-4 text-rose-400" />
            <span>+ 회원에서 부관리자 지정</span>
          </button>

          {/* 신규 직접 등록 버튼 */}
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ 신규 계정 직접 생성</span>
          </button>
        </div>
      </div>

      {/* 2. 요약 지표 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold">
            <span>총 등록 관리자</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-900">{totalCount}명</p>
          <p className="text-[11px] text-neutral-400">총괄관리자 {superAdminCount}명 포함</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold">
            <span>정상 승인 (Active)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">{activeCount}명</p>
          <p className="text-[11px] text-emerald-600 font-semibold">정상 로그인 및 콘솔 접근 가능</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold">
            <span>승인중지 (Suspended)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600">{suspendedCount}명</p>
          <p className="text-[11px] text-rose-600 font-semibold">로그인 차단 및 세션 강제 만료</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold">
            <span>보안 감사 엔진</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-black text-indigo-700 mt-1">SHA-256 + SMS MFA</p>
          <p className="text-[11px] text-neutral-500">Supabase admin_accounts 연동</p>
        </div>
      </div>

      {/* 3. 검색 및 필터 바 */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="이름, 이메일, 전화번호 검색..."
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-bold">
          <span className="text-neutral-500 text-[11px]">상태 필터:</span>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            전체 ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              filterStatus === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            정상 ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('suspended')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              filterStatus === 'suspended'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            승인중지 ({suspendedCount})
          </button>
        </div>
      </div>

      {/* 4. 관리자 계정 목록 테이블 */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-black text-sm text-neutral-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-600" />
            <span>등록 관리자 계정 목록 ({filteredAccounts.length}건)</span>
          </h3>
          <span className="text-[11px] text-neutral-400">
            * 총괄 관리자는 부관리자의 메뉴 권한을 언제든 수정하거나 해제(일반회원 복귀)할 수 있습니다.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 font-semibold bg-neutral-50/70">
                <th className="py-3 px-4">관리자 정보</th>
                <th className="py-3 px-4">역할(Role)</th>
                <th className="py-3 px-4">계정 상태 (Status)</th>
                <th className="py-3 px-4">부여된 메뉴 접근 권한</th>
                <th className="py-3 px-4">연락처 / MFA</th>
                <th className="py-3 px-4">최근 접속</th>
                <th className="py-3 px-4 text-right">계정 제어</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((acc) => {
                  const isSuper = acc.role === 'super_admin';
                  const isSuspended = acc.status === 'suspended';

                  return (
                    <tr
                      key={acc.id}
                      className={`hover:bg-neutral-50/60 transition ${
                        isSuspended ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* 관리자 정보 */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0 ${
                              isSuper
                                ? 'bg-rose-600'
                                : isSuspended
                                ? 'bg-neutral-400'
                                : 'bg-neutral-800'
                            }`}
                          >
                            {acc.name.slice(0, 2)}
                          </div>
                          <div>
                            <strong className="text-neutral-900 font-bold block">{acc.name}</strong>
                            <span className="text-neutral-400 font-mono text-[11px]">{acc.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* 역할 */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-rose-200">
                            <ShieldCheck className="w-3 h-3 text-rose-600" />
                            총괄관리자 (Master)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                            부관리자 (Staff)
                          </span>
                        )}
                      </td>

                      {/* 계정 상태값 제어 */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-rose-300">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            승인중지 (차단됨)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            정상 승인 (Active)
                          </span>
                        )}
                      </td>

                      {/* 허용된 메뉴 권한 태그 */}
                      <td className="py-3 px-4 max-w-xs">
                        {isSuper ? (
                          <span className="text-[11px] font-bold text-neutral-500">
                            전체 메뉴 무제한 접근 허용 ({MENU_OPTIONS.length}개)
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {acc.permissions?.map((pKey) => {
                              const match = MENU_OPTIONS.find((m) => m.key === pKey);
                              return (
                                <span
                                  key={pKey}
                                  className="bg-neutral-100 text-neutral-700 text-[10px] px-1.5 py-0.5 rounded border border-neutral-200 font-medium"
                                >
                                  {match?.label || pKey}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* 연락처 / MFA */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px] text-neutral-700 font-mono">
                          <Smartphone className="w-3 h-3 text-neutral-400" />
                          <span>{acc.phone || '-'}</span>
                        </div>
                        {acc.mfaEnabled && (
                          <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-0.5 mt-0.5">
                            <Lock className="w-2.5 h-2.5" /> SMS MFA 필수
                          </span>
                        )}
                      </td>

                      {/* 최근 접속 */}
                      <td className="py-3 px-4 whitespace-nowrap text-neutral-500 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span>{acc.lastLoginAt || '접속 기록 없음'}</span>
                        </div>
                      </td>

                      {/* 작업 액션 버튼들 */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(acc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition text-[11px] font-bold cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>권한수정</span>
                          </button>

                          {!isSuper && (
                            <>
                              <button
                                onClick={() => handleStatusToggle(acc)}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                  isSuspended
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {isSuspended ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>승인 재개</span>
                                  </>
                                ) : (
                                  <>
                                    <Ban className="w-3 h-3" />
                                    <span>승인 중지</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleRevokeSubAdmin(acc)}
                                title="부관리자 해제 및 일반회원 복귀"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-neutral-300 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition text-[11px] font-medium cursor-pointer"
                              >
                                <ShieldX className="w-3 h-3" />
                                <span>해제</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-neutral-400">
                    검색 조건에 일치하는 관리자 계정이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. [회원에서 부관리자 지정] 모달 (총괄 관리자가 일반 회원을 부관리자로 임명) */}
      {/* ========================================================================= */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* 상단 다크 헤더 */}
            <div className="bg-neutral-950 text-white p-6 relative">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold mb-1">
                <UserCheck className="w-4 h-4" />
                <span>총괄 관리자 권한</span>
              </div>
              <h3 className="text-xl font-black text-white">일반 회원을 부관리자로 지정</h3>
              <p className="text-xs text-neutral-400 mt-1">
                등록된 일반 회원을 검색하여 부관리자로 임명하고 담당할 메뉴 접근 권한을 지정합니다.
              </p>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1단계: 회원 검색 및 선택 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-900 block">
                    1. 부관리자로 지정할 회원 선택 *
                  </label>
                  {selectedMember && (
                    <button
                      type="button"
                      onClick={() => setSelectedMember(null)}
                      className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      다른 회원 다시 찾기
                    </button>
                  )}
                </div>

                {!selectedMember ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        placeholder="이름, 이메일, 전화번호로 회원 검색..."
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                      />
                    </div>

                    <div className="border border-neutral-200 rounded-xl max-h-44 overflow-y-auto divide-y divide-neutral-100 bg-neutral-50/50">
                      {filteredCandidates.length > 0 ? (
                        filteredCandidates.map((m) => {
                          const isAlreadyAdmin = adminAccounts.some((a) => a.email === m.email);
                          return (
                            <div
                              key={m.id}
                              onClick={() => setSelectedMember(m)}
                              className="p-3 hover:bg-rose-50/60 cursor-pointer transition flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-bold text-xs">
                                  {m.name.slice(0, 1)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <strong className="text-neutral-900 text-xs">{m.name}</strong>
                                    <span className="text-[10px] bg-neutral-200 text-neutral-700 px-1.5 py-0.2 rounded font-bold">
                                      {m.tier}
                                    </span>
                                    {isAlreadyAdmin && (
                                      <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold">
                                        기존 관리자
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-neutral-400 font-mono">
                                    {m.email} · {m.phone}
                                  </p>
                                </div>
                              </div>
                              <span className="text-rose-600 font-bold text-[11px] flex items-center gap-1">
                                선택 <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-neutral-400">
                          {isLoadingMembers ? '회원 목록 불러오는 중...' : '검색된 회원이 없습니다.'}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* 선택된 회원 카드 */
                  <div className="p-3.5 bg-neutral-900 text-white rounded-2xl flex items-center justify-between border border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-sm">
                        {selectedMember.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black">{selectedMember.name}</span>
                          <span className="bg-rose-500/30 text-rose-300 text-[10px] px-2 py-0.5 rounded font-bold border border-rose-500/50">
                            부관리자 후보
                          </span>
                        </div>
                        <p className="text-xs text-neutral-300 font-mono mt-0.5">
                          {selectedMember.email} · {selectedMember.phone}
                        </p>
                      </div>
                    </div>
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> 선택됨
                    </span>
                  </div>
                )}
              </div>

              {/* 2단계: 메뉴별 접근 권한(Role) 지정 */}
              <div className="pt-2 border-t border-neutral-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    2. 부여할 메뉴별 접근 권한 (Role) 선택 *
                  </label>
                  <div className="space-x-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleSelectAll(true, 'assign')}
                      className="text-rose-600 hover:underline font-bold cursor-pointer"
                    >
                      전체 선택
                    </button>
                    <span className="text-neutral-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAll(false, 'assign')}
                      className="text-neutral-500 hover:underline cursor-pointer"
                    >
                      초기화
                    </button>
                  </div>
                </div>

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
                          onChange={() => handleTogglePermission(item.key, 'assign')}
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

              {/* 3단계: 관리자 메모 */}
              <div>
                <label className="block font-bold text-neutral-800 mb-1">3. 담당 업무 / 메모</label>
                <input
                  type="text"
                  value={assignMemo}
                  onChange={(e) => setAssignMemo(e.target.value)}
                  placeholder="예: 주문 배송 및 CS 응대 담당"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                />
              </div>

              {/* 하단 실행 버튼 */}
              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-3 rounded-xl transition cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isAssignSubmitting || !selectedMember}
                  className="flex-1 bg-neutral-950 hover:bg-neutral-800 text-white font-bold py-3 rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-rose-400" />
                  <span>
                    {isAssignSubmitting ? '부관리자 임명 및 DB 동기화 중...' : '부관리자로 임명하기'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. 신규 계정 직접 생성 모달                                              */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-neutral-950 text-white p-6 relative">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold mb-1">
                <UserPlus className="w-4 h-4" />
                <span>부관리자 직접 생성</span>
              </div>
              <h3 className="text-lg font-black text-white">신규 부관리자 계정 생성</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                업무 담당자에게 메뉴별 권한을 세분화하여 부여할 수 있습니다.
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">관리자 이름 *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="예: 김물류"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">
                    휴대폰 번호 (SMS 2차 인증용) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="010-1234-5678"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  이메일 계정 (로그인 ID) *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="admin-staff@piuda.kr"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  초기 비밀번호 (SHA-256 해시 암호화 저장) *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="영문, 숫자 포함 6자 이상"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-3 pr-10 py-2 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">계정 역할</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as AdminRoleType)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                  >
                    <option value="sub_admin">부관리자 (Staff)</option>
                    <option value="super_admin">총괄관리자 (Super Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">초기 계정 상태</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AdminAccountStatus)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                  >
                    <option value="active">정상 승인 (Active)</option>
                    <option value="suspended">승인중지 (Suspended)</option>
                  </select>
                </div>
              </div>

              {/* 메뉴별 접근 권한(Role) 지정 */}
              <div className="pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    메뉴별 접근 권한 (Role) 지정
                  </label>
                  <div className="space-x-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleSelectAll(true, 'create')}
                      className="text-rose-600 hover:underline font-bold cursor-pointer"
                    >
                      전체 선택
                    </button>
                    <span className="text-neutral-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAll(false, 'create')}
                      className="text-neutral-500 hover:underline cursor-pointer"
                    >
                      초기화
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-3 rounded-2xl border border-neutral-200/80">
                  {MENU_OPTIONS.map((item) => {
                    const isChecked = formPermissions.includes(item.key);
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
                          onChange={() => handleTogglePermission(item.key, 'create')}
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

              <div>
                <label className="block font-bold text-neutral-800 mb-1">관리자 메모</label>
                <input
                  type="text"
                  value={formMemo}
                  onChange={(e) => setFormMemo(e.target.value)}
                  placeholder="예: CS 주문 배송 처리 담당"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? '해시 암호화 및 등록 중...' : '부관리자 등록 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. 부관리자 수정 모달                                                     */}
      {/* ========================================================================= */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-neutral-950 text-white p-6 relative">
              <button
                onClick={() => setEditingAccount(null)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold mb-1">
                <Edit3 className="w-4 h-4" />
                <span>계정 및 권한 수정</span>
              </div>
              <h3 className="text-lg font-black text-white">{editingAccount.name} 관리자 설정</h3>
              <p className="text-xs text-neutral-400 mt-0.5 font-mono">{editingAccount.email}</p>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">이름 *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">휴대폰 번호 (MFA) *</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  새 비밀번호 변경 (변경할 경우에만 입력)
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="비워두면 기존 비밀번호 유지"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">계정 역할</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as AdminRoleType)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                  >
                    <option value="sub_admin">부관리자 (Staff)</option>
                    <option value="super_admin">총괄관리자 (Super Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">계정 상태 (Status)</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AdminAccountStatus)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                  >
                    <option value="active">정상 승인 (Active)</option>
                    <option value="suspended">승인중지 (Suspended)</option>
                  </select>
                </div>
              </div>

              {/* 메뉴별 접근 권한(Role) 지정 */}
              <div className="pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    메뉴별 접근 권한 (Role) 지정
                  </label>
                  <div className="space-x-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleSelectAll(true, 'create')}
                      className="text-rose-600 hover:underline font-bold cursor-pointer"
                    >
                      전체 선택
                    </button>
                    <span className="text-neutral-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAll(false, 'create')}
                      className="text-neutral-500 hover:underline cursor-pointer"
                    >
                      초기화
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-3 rounded-2xl border border-neutral-200/80">
                  {MENU_OPTIONS.map((item) => {
                    const isChecked = formPermissions.includes(item.key);
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
                          onChange={() => handleTogglePermission(item.key, 'create')}
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

              <div>
                <label className="block font-bold text-neutral-800 mb-1">관리자 메모</label>
                <input
                  type="text"
                  value={formMemo}
                  onChange={(e) => setFormMemo(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:border-rose-500 outline-hidden"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? '수정 사항 저장 중...' : '수정 사항 적용'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
