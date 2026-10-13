/**
 * Toss Payments Server SDK & API Utility
 * 토스페이먼츠 공식 v1 REST API 서버 통신 모듈
 * (보안: Secret Key는 서버 사이드에서만 사용되며 Basic Auth로 통신)
 */

export interface TossPaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface TossPaymentCancelRequest {
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: number;
  refundReceiveAccount?: {
    bank: string;
    accountNumber: string;
    holderName: string;
  };
}

export interface TossPaymentResponse {
  mId?: string;
  version?: string;
  paymentKey: string;
  status: string; // 'READY' | 'IN_PROGRESS' | 'WAITING_FOR_DEPOSIT' | 'DONE' | 'CANCELED' | 'PARTIAL_CANCELED' | 'ABORTED' | 'EXPIRED'
  lastTransactionKey?: string;
  orderId: string;
  orderName: string;
  requestedAt: string;
  approvedAt?: string;
  useEscrow?: boolean;
  cultureExpense?: boolean;
  card?: {
    amount: number;
    issuerCode: string;
    acquirerCode?: string;
    number: string;
    installmentPlanMonths: number;
    approveNo: string;
    useCardPoint: boolean;
    cardType: string;
    ownerType: string;
    acquireStatus: string;
    receiptUrl?: string;
    company?: string;
  };
  virtualAccount?: {
    accountType: string;
    accountNumber: string;
    bankCode: string;
    customerName: string;
    dueDate: string;
    refundStatus: string;
    expired: boolean;
    settlementStatus: string;
  };
  transfer?: {
    bankCode: string;
    settlementStatus: string;
  };
  mobilePhone?: {
    customerMobilePhone: string;
    settlementStatus: string;
    receiptUrl?: string;
  };
  giftCertificate?: {
    approveNo: string;
    settlementStatus: string;
  };
  cashReceipt?: {
    type: string;
    receiptKey: string;
    issueNumber: string;
    receiptUrl: string;
    amount: number;
    taxFreeAmount: number;
  };
  discount?: {
    amount: number;
  };
  cancels?: Array<{
    cancelAmount: number;
    cancelReason: string;
    taxFreeAmount: number;
    taxExemptionAmount: number;
    refundableAmount: number;
    easyPayDiscountAmount: number;
    canceledAt: string;
    transactionKey: string;
    receiptKey?: string;
  }>;
  secret?: string;
  type: string; // 'NORMAL' | 'BILLING' | 'BRANDPAY'
  easyPay?: {
    provider: string; // '토스페이' | '카카오페이' | '네이버페이' | '페이코' | '삼성페이' 등
    amount: number;
    discountAmount: number;
  };
  country?: string;
  failure?: {
    code: string;
    message: string;
  };
  isPartialCancelable?: boolean;
  receipt?: {
    url: string;
  };
  checkout?: {
    url: string;
  };
  currency?: string;
  totalAmount: number;
  balanceAmount: number;
  suppliedAmount: number;
  vat: number;
  taxFreeAmount: number;
  method?: string; // '카드' | '가상계좌' | '간편결제' | '계좌이체' | '휴대폰' 등
}

/**
 * 서버 환경 변수에서 토스페이먼츠 시크릿 키 획득
 */
export function getTossSecretKey(): string {
  const secretKey =
    process.env.TOSS_PAYMENTS_SECRET_KEY ||
    'test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6'; // 기본 문서 테스트 키
  return secretKey;
}

/**
 * Basic Auth 헤더 생성 (SecretKey + ':' 를 Base64 인코딩)
 */
export function getTossAuthHeader(): string {
  const secretKey = getTossSecretKey();
  const token = Buffer.from(secretKey + ':').toString('base64');
  return `Basic ${token}`;
}

const TOSS_API_BASE_URL = 'https://api.tosspayments.com/v1';

/**
 * 1. 결제 승인 API 호출 (POST /v1/payments/confirm)
 * 멱등키(Idempotency-Key)를 사용하여 중복 결제 승인을 방어합니다.
 */
export async function confirmTossPayment(params: TossPaymentConfirmRequest): Promise<{
  success: boolean;
  data?: TossPaymentResponse;
  error?: { code: string; message: string };
}> {
  try {
    const authHeader = getTossAuthHeader();
    const idempotencyKey = `confirm-${params.orderId}`;

    const res = await fetch(`${TOSS_API_BASE_URL}/payments/confirm`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        paymentKey: params.paymentKey,
        orderId: params.orderId,
        amount: params.amount,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error('[TossPayments] confirm failed:', json);
      return {
        success: false,
        error: {
          code: json.code || 'CONFIRM_FAILED',
          message: json.message || '결제 승인 처리에 실패했습니다.',
        },
      };
    }

    return { success: true, data: json };
  } catch (err: any) {
    console.error('[TossPayments] confirm exception:', err);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || '토스페이먼츠 결제 승인 서버 통신 오류가 발생했습니다.',
      },
    };
  }
}

/**
 * 2. 결제 조회 API (GET /v1/payments/{paymentKey})
 * 웹훅 수신 시 또는 상태 검증 시 역조회에 사용
 */
export async function getTossPayment(paymentKey: string): Promise<{
  success: boolean;
  data?: TossPaymentResponse;
  error?: { code: string; message: string };
}> {
  try {
    const authHeader = getTossAuthHeader();

    const res = await fetch(`${TOSS_API_BASE_URL}/payments/${encodeURIComponent(paymentKey)}`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: {
          code: json.code || 'LOOKUP_FAILED',
          message: json.message || '결제 내역 조회에 실패했습니다.',
        },
      };
    }

    return { success: true, data: json };
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || '토스페이먼츠 조회 통신 오류가 발생했습니다.',
      },
    };
  }
}

/**
 * 3. 주문번호로 결제 조회 API (GET /v1/payments/orders/{orderId})
 */
export async function getTossPaymentByOrderId(orderId: string): Promise<{
  success: boolean;
  data?: TossPaymentResponse;
  error?: { code: string; message: string };
}> {
  try {
    const authHeader = getTossAuthHeader();

    const res = await fetch(`${TOSS_API_BASE_URL}/payments/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: {
          code: json.code || 'LOOKUP_FAILED',
          message: json.message || '주문번호로 결제 조회를 할 수 없습니다.',
        },
      };
    }

    return { success: true, data: json };
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || '토스페이먼츠 조회 통신 오류가 발생했습니다.',
      },
    };
  }
}

/**
 * 4. 결제 취소 / 환불 API 호출 (POST /v1/payments/{paymentKey}/cancel)
 */
export async function cancelTossPayment(params: TossPaymentCancelRequest): Promise<{
  success: boolean;
  data?: TossPaymentResponse;
  error?: { code: string; message: string };
}> {
  try {
    const authHeader = getTossAuthHeader();
    const idempotencyKey = `cancel-${params.paymentKey}-${Date.now()}`;

    const body: Record<string, any> = {
      cancelReason: params.cancelReason,
    };
    if (params.cancelAmount !== undefined && params.cancelAmount > 0) {
      body.cancelAmount = params.cancelAmount;
    }
    if (params.refundReceiveAccount) {
      body.refundReceiveAccount = params.refundReceiveAccount;
    }

    const res = await fetch(
      `${TOSS_API_BASE_URL}/payments/${encodeURIComponent(params.paymentKey)}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(body),
      }
    );

    const json = await res.json();

    if (!res.ok) {
      console.error('[TossPayments] cancel failed:', json);
      return {
        success: false,
        error: {
          code: json.code || 'CANCEL_FAILED',
          message: json.message || '결제 취소 처리에 실패했습니다.',
        },
      };
    }

    return { success: true, data: json };
  } catch (err: any) {
    console.error('[TossPayments] cancel exception:', err);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || '토스페이먼츠 결제 취소 통신 오류가 발생했습니다.',
      },
    };
  }
}
