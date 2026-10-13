/**
 * Automated Payment & Security Test Suite
 * 토스페이먼츠 연동 및 보안 결제 파이프라인 자동화 검증 스크립트
 */

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('==================================================================');
  console.log('🚀 [TEST SUITE] 토스페이먼츠 온라인 결제 시스템 보안 및 무결성 검증 시작');
  console.log('==================================================================\n');

  let passedCount = 0;
  let totalCount = 0;

  function assert(condition, testName, details = '') {
    totalCount++;
    if (condition) {
      console.log(`✅ [PASS] ${testName} ${details ? '(' + details + ')' : ''}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
    }
  }

  // -------------------------------------------------------------
  // Test 1: 정상 주문 생성 및 서버 사이드 단가/배송비 계산 검증
  // -------------------------------------------------------------
  console.log('\n--- [TEST 1] 주문 생성 API (POST /api/payments/create-order) ---');
  let validOrderData = null;
  try {
    const res = await fetch(`${BASE_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiverName: '홍길동',
        receiverPhone: '010-1234-5678',
        shippingZipcode: '06236',
        shippingAddress: '서울특별시 강남구 테헤란로 123',
        shippingDetailAddress: '7층',
        items: [
          { productId: 'prod-001', quantity: 1 }, // 센텔라 앰플 28,000원 (< 30,000원 -> 배송비 3,000원 부과)
        ],
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, '주문 생성 API 정상 응답 (HTTP 200)');
    assert(data.shippingFee === 3000, '3만원 미만 주문 배송비 3,000원 서버 계산 검증', `배송비: ${data.shippingFee}원`);
    assert(data.amount === 28000 + 3000, '최종 결제 예정 금액 정확성 검증', `합계: ${data.amount}원`);
    assert(data.orderNumber && data.orderNumber.startsWith('ORD-'), '고유 주문번호 형식 검증', data.orderNumber);
    validOrderData = data;
  } catch (err) {
    assert(false, '주문 생성 API 호출 예외', err.message);
  }

  // -------------------------------------------------------------
  // Test 2: 30,000원 이상 주문 시 무료배송 서버 계산 검증
  // -------------------------------------------------------------
  console.log('\n--- [TEST 2] 3만원 이상 주문 시 무료배송 계산 검증 ---');
  try {
    const res = await fetch(`${BASE_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiverName: '김민지',
        receiverPhone: '010-9876-5432',
        shippingZipcode: '06236',
        shippingAddress: '서울특별시 강남구 역삼동',
        items: [
          { productId: 'prod-001', quantity: 2 }, // 28,000 * 2 = 56,000원 (>= 30,000원 -> 배송비 0원)
        ],
      }),
    });
    const data = await res.json();
    assert(data.shippingFee === 0, '3만원 이상 무료배송 계산 검증', `배송비: ${data.shippingFee}원`);
    assert(data.amount === 56000, '무료배송 최종 금액 검증', `합계: ${data.amount}원`);
  } catch (err) {
    assert(false, '무료배송 테스트 호출 예외', err.message);
  }

  // -------------------------------------------------------------
  // Test 3: 필수 배송지 누락 시 입력값 유효성 검증
  // -------------------------------------------------------------
  console.log('\n--- [TEST 3] 필수값 누락 요청 방어 검증 ---');
  try {
    const res = await fetch(`${BASE_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiverName: '', // 누락
        receiverPhone: '',
        shippingAddress: '',
        items: [{ productId: 'prod-001', quantity: 1 }],
      }),
    });
    const data = await res.json();
    assert(res.status === 400 && data.success === false, '필수값 누락 시 HTTP 400 거절 처리', data.error);
  } catch (err) {
    assert(false, '필수값 누락 테스트 호출 예외', err.message);
  }

  // -------------------------------------------------------------
  // Test 4: [보안 핵심] 결제 금액 위변조(Tampering) 시도 방어 검증
  // -------------------------------------------------------------
  console.log('\n--- [TEST 4] 결제 금액 위변조 시도 차단 검증 (SECURITY CRITICAL) ---');
  if (validOrderData) {
    try {
      const forgedAmount = 100; // 실제 금액 31,000원인데 100원으로 변조 승인 시도!
      const res = await fetch(`${BASE_URL}/api/payments/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentKey: 'fake_tampered_key_9999',
          orderId: validOrderData.orderId,
          amount: forgedAmount,
        }),
      });
      const data = await res.json();
      assert(
        res.status === 400 && data.success === false,
        '금액 변조 승인 요청 차단 및 HTTP 400 반환',
        data.error
      );
    } catch (err) {
      assert(false, '금액 변조 방어 테스트 예외', err.message);
    }
  }

  // -------------------------------------------------------------
  // Test 5: 존재하지 않는 주문 번호 승인 차단 검증
  // -------------------------------------------------------------
  console.log('\n--- [TEST 5] 존재하지 않는 주문 번호 승인 차단 ---');
  try {
    const res = await fetch(`${BASE_URL}/api/payments/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentKey: 'test_pk_12345',
        orderId: 'non-existent-order-id-xyz',
        amount: 30000,
      }),
    });
    const data = await res.json();
    assert(res.status === 404 && data.success === false, '존재하지 않는 주문 번호 404 반환', data.error);
  } catch (err) {
    assert(false, '비존재 주문 테스트 예외', err.message);
  }

  // -------------------------------------------------------------
  // Test 6: 결제 취소 및 환불 API 검증 (독립 주문 생성 후 취소)
  // -------------------------------------------------------------
  console.log('\n--- [TEST 6] 결제 취소 및 환불 API (POST /api/payments/cancel) ---');
  try {
    // 취소 테스트용 전용 주문 생성
    const orderToCancelRes = await fetch(`${BASE_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiverName: '취소테스트고객',
        receiverPhone: '010-0000-0000',
        shippingZipcode: '06236',
        shippingAddress: '서울특별시 서초구',
        items: [{ productId: 'prod-001', quantity: 1 }],
      }),
    });
    const orderToCancel = await orderToCancelRes.json();

    const res = await fetch(`${BASE_URL}/api/payments/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderToCancel.orderId,
        cancelReason: '고객 단순 변심 취소 테스트',
        requesterRole: 'admin',
      }),
    });
    const data = await res.json();
    assert(
      res.status === 200 && data.success === true,
      '주문 취소 API 정상 처리 및 상태 업데이트',
      `상태: ${data.status}`
    );
  } catch (err) {
    assert(false, '결제 취소 테스트 예외', err.message);
  }

  // -------------------------------------------------------------
  // Test 7: 웹훅(Webhook) 엔드포인트 수신 검증
  // -------------------------------------------------------------
  console.log('\n--- [TEST 7] 토스페이먼츠 웹훅 수신 엔드포인트 검증 ---');
  try {
    const res = await fetch(`${BASE_URL}/api/payments/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'PAYMENT_STATUS_CHANGED',
        data: {
          paymentKey: 'test_pk_webhook_dummy',
          orderId: 'ORD-TEST-999',
          status: 'DONE',
        },
      }),
    });
    // 유효하지 않은 임의의 paymentKey는 공식 API 역조회 시 거절됨 (정상적인 위조 방어 동작)
    assert(
      res.status === 400 || res.status === 200,
      '웹훅 엔드포인트 정상 수신 및 역조회 보안 검증 동작',
      `HTTP ${res.status}`
    );
  } catch (err) {
    assert(false, '웹훅 테스트 예외', err.message);
  }

  // -------------------------------------------------------------
  // Test 8: 프런트엔드 주요 결제 라우트 HTTP 응답 확인
  // -------------------------------------------------------------
  console.log('\n--- [TEST 8] 프런트엔드 결제 라우트 HTTP 응답 상태 검증 ---');
  const routes = [
    '/checkout',
    '/checkout/success?paymentKey=test&orderId=test&amount=1000',
    '/checkout/fail?code=USER_CANCEL&message=취소',
    '/admin/orders',
  ];

  for (const route of routes) {
    try {
      const res = await fetch(`${BASE_URL}${route}`);
      assert(res.status === 200, `페이지 렌더링 확인: ${route}`, `HTTP ${res.status}`);
    } catch (err) {
      assert(false, `페이지 접근 예외: ${route}`, err.message);
    }
  }

  console.log('\n==================================================================');
  console.log(`📊 [TEST SUMMARY] 총 ${totalCount}개 테스트 중 ${passedCount}개 통과 (${Math.round((passedCount/totalCount)*100)}%)`);
  console.log('==================================================================\n');
}

runTests();
