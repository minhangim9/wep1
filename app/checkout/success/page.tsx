'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import confetti from 'canvas-confetti';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshOrders, clearCart, showToast } = useShop();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [orderInfo, setOrderInfo] = useState<{ id: string; orderNumber: string } | null>(null);

  // StrictMode 중복 호출 방지용 ref
  const isCalledRef = useRef(false);

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amountStr = searchParams.get('amount');

    if (!paymentKey || !orderId || !amountStr) {
      setStatus('error');
      setErrorMessage('결제 승인에 필요한 파라미터가 누락되었습니다.');
      return;
    }

    if (isCalledRef.current) return;
    isCalledRef.current = true;

    const confirmPayment = async () => {
      try {
        const res = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amountStr),
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setStatus('success');
          setOrderInfo({
            id: data.orderId || orderId,
            orderNumber: data.orderNumber || orderId,
          });

          // 장바구니 비우기 및 주문 새로고침
          clearCart();
          await refreshOrders();

          // 축하 컨페티 효과
          try {
            confetti({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#f43f5e', '#fb7185', '#fda4af', '#fbbf24', '#34d399'],
            });
          } catch (e) {
            console.error(e);
          }

          showToast('토스페이먼츠 결제가 성공적으로 완료되었습니다!', 'success');

          // 잠시 후 주문 완료 페이지로 리다이렉트
          setTimeout(() => {
            router.push(`/order-complete/${data.orderId || orderId}`);
          }, 1500);
        } else {
          setStatus('error');
          setErrorMessage(data.error || data.message || '결제 승인 처리 중 오류가 발생했습니다.');
        }
      } catch (err: any) {
        console.error('[CheckoutSuccess] confirm error:', err);
        setStatus('error');
        setErrorMessage(err.message || '결제 승인 서버와의 통신에 실패했습니다.');
      }
    };

    confirmPayment();
  }, [searchParams, router, clearCart, refreshOrders, showToast]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-neutral-200 p-8 text-center space-y-6">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-neutral-100 text-neutral-900 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-neutral-900">결제 승인 확인 중...</h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                토스페이먼츠 보안 서버에서 결제 금액 및 위변조 여부를 최종 검증하고 있습니다.<br />
                창을 닫거나 새로고침하지 마세요.
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-neutral-900">결제가 완료되었습니다!</h2>
              <p className="text-xs text-neutral-500">
                주문번호: <strong className="text-neutral-900 font-mono">{orderInfo?.orderNumber}</strong>
              </p>
              <p className="text-xs text-rose-600 font-semibold pt-1">
                주문 완료 상세 페이지로 이동합니다...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-neutral-900">결제 승인 실패</h2>
              <p className="text-xs text-neutral-600 bg-rose-50 border border-rose-200 p-3 rounded-xl leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => router.push('/checkout')}
                className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>주문서로 돌아가기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
