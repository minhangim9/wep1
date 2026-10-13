'use client';

import React, { useState, useEffect } from 'react';
import { Database, Key, CheckCircle, AlertCircle, RefreshCw, X, Copy, Check, ExternalLink } from 'lucide-react';
import { testSupabaseConnection, getSupabaseAnonKey } from '@/lib/supabase';
import { useShop } from '@/context/ShopContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseKeyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { showToast } = useShop();
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [diagResult, setDiagResult] = useState<{
    tested: boolean;
    ok: boolean;
    message: string;
    hasKey: boolean;
    tableExists: boolean;
  }>({
    tested: false,
    ok: false,
    message: '',
    hasKey: false,
    tableExists: false,
  });

  useEffect(() => {
    if (isOpen) {
      const currentKey = getSupabaseAnonKey();
      if (currentKey && !currentKey.includes('placeholder')) {
        setAnonKey(currentKey);
      }
      runDiagnostic();
    }
  }, [isOpen]);

  const runDiagnostic = async () => {
    setIsTesting(true);
    const res = await testSupabaseConnection();
    setDiagResult({
      tested: true,
      ok: res.ok,
      message: res.message,
      hasKey: res.hasKey,
      tableExists: res.tableExists,
    });
    setIsTesting(false);
  };

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonKey.trim()) {
      showToast('anon API 키를 입력해주세요.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // 1. LocalStorage 저장 (클라이언트 즉시 반영)
      if (typeof window !== 'undefined') {
        localStorage.setItem('piuda_supabase_anon_key', anonKey.trim());
      }

      // 2. 서버 .env.local 저장
      const res = await fetch('/api/supabase-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonKey: anonKey.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        showToast('Supabase API Key가 성공적으로 저장되었습니다!', 'success');
        await runDiagnostic();
      } else {
        showToast(data.message || 'API 키 검증에 실패했습니다.', 'error');
        setDiagResult({
          tested: true,
          ok: false,
          message: data.message || 'API 키 검증 실패',
          hasKey: false,
          tableExists: false,
        });
      }
    } catch (err: any) {
      showToast(`저장 중 오류: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const copySqlToClipboard = () => {
    const sql = `-- 1. members 테이블 생성
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    skin_type TEXT DEFAULT '민감성',
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'manager')),
    tier TEXT DEFAULT 'WELCOME' CHECK (tier IN ('WELCOME', 'BRONZE', 'SILVER', 'GOLD', 'VIP')),
    points INTEGER DEFAULT 3000,
    marketing_agreed BOOLEAN DEFAULT true,
    address TEXT DEFAULT '',
    detail_address TEXT DEFAULT '',
    zipcode TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 검색 및 로그인 속도 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members (email);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON public.members (created_at DESC);

-- 3. Row Level Security 활성화 및 정책 등록
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on members" ON public.members;
CREATE POLICY "Allow public read on members" ON public.members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on members" ON public.members;
CREATE POLICY "Allow public insert on members" ON public.members FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on members" ON public.members;
CREATE POLICY "Allow public update on members" ON public.members FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete on members" ON public.members;
CREATE POLICY "Allow public delete on members" ON public.members FOR DELETE USING (true);`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    showToast('SQL 스크립트가 클립보드에 복사되었습니다!', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-neutral-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
              SUPABASE DB CONNECTION
            </span>
          </div>
          <h2 className="text-xl font-black text-white">Supabase 실시간 연동 설정</h2>
          <p className="text-xs text-neutral-300 mt-1">
            프로젝트 URL: <code className="bg-white/15 px-1.5 py-0.5 rounded font-mono text-emerald-300">https://psblczhzozsuicstbefl.supabase.co</code>
          </p>
        </div>

        {/* 바디 */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* 상태 배너 */}
          {diagResult.tested && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                diagResult.ok
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              {diagResult.ok ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold text-sm">
                  {diagResult.ok ? 'Supabase DB 정상 연동 중' : 'Supabase 설정 필요'}
                </p>
                <p className="text-xs leading-relaxed opacity-90">{diagResult.message}</p>
              </div>
            </div>
          )}

          {/* API Key 입력 폼 */}
          <form onSubmit={handleSaveAndTest} className="space-y-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-800 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-neutral-500" />
                <span>Supabase Anon Public API Key</span>
              </label>
              <a
                href="https://supabase.com/dashboard/project/psblczhzozsuicstbefl/settings/api"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
              >
                <span>대시보드에서 키 확인</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <textarea
              rows={3}
              required
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs font-mono focus:border-rose-500 focus:outline-hidden text-neutral-900 leading-tight"
            />

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSaving || isTesting}
                className="flex-1 bg-neutral-950 hover:bg-neutral-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:bg-neutral-400"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                <span>API Key 저장 및 연결 테스트</span>
              </button>

              <button
                type="button"
                onClick={runDiagnostic}
                disabled={isTesting}
                className="bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>재진단</span>
              </button>
            </div>
          </form>

          {/* 스키마 복사 안내 */}
          <div className="space-y-2 border-t border-neutral-200 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 flex items-center gap-1.5">
                <span>1분 완성: members 테이블 생성 SQL</span>
              </h3>
              <button
                type="button"
                onClick={copySqlToClipboard}
                className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-rose-200"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? '복사됨!' : 'SQL 전체 복사'}</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Supabase 대시보드 <strong>[SQL Editor]</strong> 메뉴에서 위 SQL을 붙여넣고 <strong>[RUN]</strong> 버튼을 누르면 <code className="font-bold text-neutral-800">members</code> 테이블과 보안(RLS) 정책이 자동 생성됩니다.
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2 px-5 rounded-xl text-xs cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
