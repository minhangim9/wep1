import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 환경 변수 설정
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://psblczhzozsuicstbefl.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzYmxjemh6b3pzdWljc3RiZWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3OTc5OTcsImV4cCI6MjEwNjM3Mzk5N30.Bqdx1qn4yFVZrHr1_6Y-3rUk4acX_Wt726unuSvPbNk';

// Service Role Key (Supabase Auth Admin API 및 RLS 우회 권한 수정용)
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
  '';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, email, role, permissions, name, phone } = body;

    if (!role || (role !== 'admin' && role !== 'customer')) {
      return NextResponse.json(
        { success: false, error: "올바른 권한('admin' 또는 'customer')을 지정해주세요." },
        { status: 400 }
      );
    }

    if (!memberId && !email) {
      return NextResponse.json(
        { success: false, error: '회원 ID 또는 이메일 주소가 필요합니다.' },
        { status: 400 }
      );
    }

    // 1. Supabase 클라이언트 준비
    const serviceRoleAvailable = Boolean(
      SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
    );

    // 서비스 롤 키가 있으면 Admin 클라이언트 생성, 없으면 Anon 클라이언트 사용
    const adminClient = serviceRoleAvailable
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : null;

    const baseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const activeDbClient = adminClient || baseClient;

    let authUserUpdated = false;
    let authErrorMsg: string | null = null;
    let targetUserId = memberId;

    // 2. Supabase Authentication (auth.users) 권한 동기화
    if (adminClient) {
      try {
        // 2-1. memberId로 대상 유저 검색 및 업데이트
        if (targetUserId && targetUserId.length > 20) {
          const { error: updateError } = await adminClient.auth.admin.updateUserById(
            targetUserId,
            {
              user_metadata: { role },
              app_metadata: { role },
            }
          );

          if (!updateError) {
            authUserUpdated = true;
          } else {
            console.warn('[update-role] Auth update by ID error:', updateError.message);
          }
        }

        // 2-2. memberId로 업데이트 실패 시 이메일로 검색 후 업데이트
        if (!authUserUpdated && email) {
          const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers();
          if (!listError && usersData?.users) {
            const matchedUser = usersData.users.find(
              (u) => u.email?.toLowerCase() === email.toLowerCase()
            );
            if (matchedUser) {
              targetUserId = matchedUser.id;
              const { error: emailUpdateErr } = await adminClient.auth.admin.updateUserById(
                matchedUser.id,
                {
                  user_metadata: { role },
                  app_metadata: { role },
                }
              );
              if (!emailUpdateErr) {
                authUserUpdated = true;
              } else {
                authErrorMsg = emailUpdateErr.message;
              }
            }
          }
        }
      } catch (authEx: any) {
        console.error('[update-role] Auth Admin API exception:', authEx);
        authErrorMsg = authEx.message;
      }
    } else {
      console.info(
        '[update-role] SUPABASE_SERVICE_ROLE_KEY 미설정 - members 테이블 기반으로 권한이 동기화됩니다.'
      );
    }

    // 3. Supabase public.members 테이블 권한 동기화
    let memberDbUpdated = false;
    let memberDbError: string | null = null;

    try {
      // id 또는 email로 members 테이블의 role 컬럼 UPDATE
      let query = activeDbClient.from('members').update({ role });
      if (targetUserId) {
        query = query.eq('id', targetUserId);
      } else if (email) {
        query = query.eq('email', email);
      }

      const { data: updatedData, error: dbError } = await query.select();

      if (dbError) {
        // 혹시 ID로 실패한 경우 email로 재시도
        if (email && targetUserId) {
          const { data: retryData, error: retryError } = await activeDbClient
            .from('members')
            .update({ role })
            .eq('email', email)
            .select();

          if (!retryError) {
            memberDbUpdated = true;
          } else {
            memberDbError = retryError.message;
          }
        } else {
          memberDbError = dbError.message;
        }
      } else {
        memberDbUpdated = true;
      }
    } catch (dbEx: any) {
      console.error('[update-role] members table update exception:', dbEx);
      memberDbError = dbEx.message;
    }

    // 4. admin_accounts 테이블 동기화 (권한별 백오피스 접근 제어)
    try {
      if (email) {
        if (role === 'admin') {
          // 관리자로 승격 시: admin_accounts에 등록/활성화
          const defaultPermissions = permissions || [
            'dashboard',
            'members',
            'products',
            'orders',
            'delivery',
          ];
          await activeDbClient.from('admin_accounts').upsert(
            {
              id: targetUserId || `adm-${Date.now()}`,
              email,
              name: name || '관리자',
              phone: phone || '',
              role: 'staff',
              status: 'active',
              permissions: defaultPermissions,
              memo: '회원관리 콘솔에서 관리자 권한 부여됨',
            },
            { onConflict: 'email' }
          );
        } else {
          // 일반회원으로 강등 시: admin_accounts에서 승인중지(suspended) 처리
          await activeDbClient
            .from('admin_accounts')
            .update({ status: 'suspended' })
            .eq('email', email);
        }
      }
    } catch (admAccEx: any) {
      console.warn('[update-role] admin_accounts sync warning:', admAccEx.message);
    }

    return NextResponse.json({
      success: true,
      role,
      memberId: targetUserId,
      email,
      memberDbUpdated,
      authUserUpdated,
      serviceRoleAvailable,
      authError: authErrorMsg,
      dbError: memberDbError,
      message: `회원 권한이 '${role === 'admin' ? '관리자' : '일반회원'}'으로 성공적으로 수정되었습니다.`,
    });
  } catch (error: any) {
    console.error('[update-role] Route Handler Fatal Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '회원 권한 변경 중 서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
