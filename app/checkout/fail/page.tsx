'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, RefreshCw, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CheckoutFailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get('code') || 'PAYMENT_FAILED';
  const message = searchParams.get('message') || '고객님께서 결제를 취소하셨거나 카드사 오류가 발생했습니다.';
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-neutral-200 p-8 text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <XCircle className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-neutral-900">결제가 완료되지 않았습니다</h2>
          <p className="text-xs text-neutral-500">
            주문이 취소되었거나 결제 진행 도중 오류가 발생했습니다.
          </p>

          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-left space-y-1.5 mt-3 text-xs">
            <div className="flex justify-between text-neutral-500">
              <span>오류 코드</span>
              <strong className="font-mono text-neutral-800">{code}</strong>
            </div>
            <div className="pt-1 border-t border-neutral-200 text-neutral-700 leading-relaxed">
              <span className="font-bold block text-neutral-900 mb-0.5">상세 사유:</span>
              {message}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={() => router.push('/checkout')}
            className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>결제 다시 시도하기</span>
          </button>
          <Link
            href="/cart"
            className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold py-3.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>장바구니로 가기</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
