import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ENV_FILE_PATH = path.join(process.cwd(), '.env.local');

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://psblczhzozsuicstbefl.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const isPlaceholder = !anonKey || anonKey.includes('placeholder');

  return NextResponse.json({
    url,
    isConfigured: !isPlaceholder,
    keyPreview: anonKey ? `${anonKey.substring(0, 15)}...${anonKey.substring(anonKey.length - 10)}` : '',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { anonKey, url } = body;

    const targetUrl = (url || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://psblczhzozsuicstbefl.supabase.co').trim();
    const targetKey = (anonKey || '').trim();

    if (!targetKey) {
      return NextResponse.json({ success: false, message: 'API 키를 입력해주세요.' }, { status: 400 });
    }

    // 1. Supabase REST 엔드포인트 직접 연결 테스트
    try {
      const testRes = await fetch(`${targetUrl}/rest/v1/members?select=id&limit=1`, {
        headers: {
          apikey: targetKey,
          Authorization: `Bearer ${targetKey}`,
        },
      });

      if (testRes.status === 401 || testRes.status === 403) {
        const errJson = await testRes.json().catch(() => ({}));
        return NextResponse.json({
          success: false,
          errorType: 'INVALID_KEY',
          message: 'Supabase API 키가 올바르지 않습니다. (401 Unauthorized)',
          detail: errJson.message || 'Invalid API key',
        });
      }

      if (testRes.status === 404 || testRes.status === 400) {
        const errJson = await testRes.json().catch(() => ({}));
        if (errJson.message && errJson.message.includes('relation') && errJson.message.includes('does not exist')) {
          // 키는 맞으나 테이블이 없는 경우
          // 그래도 .env.local 저장은 진행
          saveToEnv(targetUrl, targetKey);
          return NextResponse.json({
            success: true,
            warning: 'TABLE_NOT_FOUND',
            message: 'API 키는 유효하나, members 테이블이 아직 생성되지 않았습니다. Supabase SQL Editor에서 스키마를 실행해주세요.',
          });
        }
      }

      // 2. 정상 연결 확인 -> .env.local 업데이트
      saveToEnv(targetUrl, targetKey);

      return NextResponse.json({
        success: true,
        message: 'Supabase 연결 및 API 키 설정이 성공적으로 완료되었습니다!',
      });
    } catch (fetchErr: any) {
      return NextResponse.json({
        success: false,
        message: `Supabase 서버 통신 실패: ${fetchErr.message}`,
      }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

function saveToEnv(url: string, key: string) {
  const content = `# Supabase Project Configuration for Piuda & Daddy's Love Store
NEXT_PUBLIC_SUPABASE_URL=${url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${key}
`;
  fs.writeFileSync(ENV_FILE_PATH, content, 'utf8');
}
