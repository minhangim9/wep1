'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import {
  CreditCard,
  Truck,
  Gift,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Receipt,
  Loader2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { loadPaymentWidget, ANONYMOUS } from '@tosspayments/payment-widget-sdk';

const TOSS_CLIENT_KEY =
  process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ||
  'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'; // 토스페이먼츠 공식 테스트 키

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, user, coupons, applyCoupon, usePoints, showToast } = useShop();

  const selectedItems = cart.filter((item) => item.selected);

  // 1. 배송지 입력 상태
  const [receiverName, setReceiverName] = useState(user?.name || '홍길동');
  const [receiverPhone, setReceiverPhone] = useState(user?.phone || '010-5555-1234');
  const [shippingZipcode, setShippingZipcode] = useState(user?.zipcode || '06236');
  const [shippingAddress, setShippingAddress] = useState(
    user?.address || '서울특별시 강남구 테헤란로 123'
  );
  const [shippingDetailAddress, setShippingDetailAddress] = useState(
    user?.detailAddress || '피우다 뷰티빌딩 7층'
  );
  const [shippingMemo, setShippingMemo] = useState('부재 시 문 앞에 놓아주세요.');

  // 2. 할인 상태
  const [selectedCouponId, setSelectedCouponId] = useState<string>('');
  const [pointsToUse, setPointsToUse] = useState<number>(0);

  // 3. 세금 증빙
  const [isTaxInvoiceRequested, setIsTaxInvoiceRequested] = useState(false);
  const [taxInvoiceType, setTaxInvoiceType] = useState<'cash_receipt' | 'tax_invoice'>('cash_receipt');
  const [taxNumber, setTaxNumber] = useState(user?.phone || '01055551234');
  const [taxCompanyName, setTaxCompanyName] = useState('');

  // 4. 결제 진행 상태 및 에러
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 5. 토스 결제위젯 인스턴스 ref
  const paymentWidgetRef = useRef<any>(null);
  const paymentMethodsWidgetRef = useRef<any>(null);
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);

  // 금액 계산
  const totalItemAmount = selectedItems.reduce((sum, item) => {
    const unitPrice = item.product.price + (item.selectedOption?.additionalPrice || 0);
    return sum + unitPrice * item.quantity;
  }, 0);

  const shippingFee = totalItemAmount >= 30000 || totalItemAmount === 0 ? 0 : 3000;

  // 쿠폰 할인 계산
  const selectedCoupon = coupons.find((c) => c.id === selectedCouponId && !c.isUsed);
  let couponDiscountAmount = 0;
  if (selectedCoupon && totalItemAmount >= selectedCoupon.minOrderAmount) {
    if (selectedCoupon.discountType === 'fixed') {
      couponDiscountAmount = selectedCoupon.discountValue;
    } else {
      couponDiscountAmount = Math.floor(totalItemAmount * (selectedCoupon.discountValue / 100));
    }
  }

  // 포인트 사용 한도 (최대 50%)
  const maxUsablePoints = Math.min(user?.points || 0, Math.floor(totalItemAmount * 0.5));
  const finalPaymentAmount = Math.max(
    0,
    totalItemAmount + shippingFee - couponDiscountAmount - pointsToUse
  );

  // 포인트 전액 사용 토글
  const handleUseAllPoints = () => {
    setPointsToUse(maxUsablePoints);
  };

  // 6. 토스페이먼츠 결제위젯 초기화 및 렌더링
  useEffect(() => {
    if (selectedItems.length === 0) return;

    let isSubscribed = true;

    async function initTossWidget() {
      try {
        const customerKey = user?.id || ANONYMOUS;
        const paymentWidget = await loadPaymentWidget(TOSS_CLIENT_KEY, customerKey);

        if (!isSubscribed) return;
        paymentWidgetRef.current = paymentWidget;

        // 결제위젯 렌더링 (카드, 카카오페이, 네이버페이, 토스페이 등 통합 결제창)
        const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
          '#payment-widget',
          { value: finalPaymentAmount },
          { variantKey: 'DEFAULT' }
        );
        paymentMethodsWidgetRef.current = paymentMethodsWidget;

        // 이용약관 위젯 렌더링
        paymentWidget.renderAgreement('#agreement', { variantKey: 'AGREEMENT' });

        setIsWidgetLoaded(true);
      } catch (err) {
        console.error('[TossWidget] Failed to initialize payment widget:', err);
      }
    }

    initTossWidget();

    return () => {
      isSubscribed = false;
    };
  }, [user?.id, selectedItems.length]);

  // 최종 결제 금액이 변경될 때 토스위젯 금액 업데이트
  useEffect(() => {
    if (paymentMethodsWidgetRef.current && isWidgetLoaded) {
      paymentMethodsWidgetRef.current.updateAmount(finalPaymentAmount);
    }
  }, [finalPaymentAmount, isWidgetLoaded]);

  // 7. 결제 진행 핸들러 (중복 클릭 방지, 서버 검증, 토스 결제창 호출)
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isProcessing) return;

    if (!receiverName.trim() || !receiverPhone.trim() || !shippingAddress.trim()) {
      setErrorMessage('배송지 정보(받는 사람, 연락처, 주소)를 모두 입력해주세요.');
      showToast('배송지 정보를 모두 입력해주세요.', 'error');
      return;
    }

    if (selectedItems.length === 0) {
      setErrorMessage('주문할 상품이 장바구니에 없습니다.');
      router.push('/cart');
      return;
    }

    setIsProcessing(true);

    try {
      // Step A. 서버 API에 사전 주문 등록 및 단가/재고/금액 서버 재검증
      const createOrderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.name || receiverName,
          receiverName: receiverName.trim(),
          receiverPhone: receiverPhone.trim(),
          shippingZipcode: shippingZipcode.trim(),
          shippingAddress: shippingAddress.trim(),
          shippingDetailAddress: shippingDetailAddress.trim(),
          shippingMemo: shippingMemo.trim(),
          items: selectedItems.map((item) => ({
            productId: item.product.id,
            optionId: item.selectedOption?.id,
            quantity: item.quantity,
          })),
          couponId: selectedCouponId || undefined,
          pointsToUse: pointsToUse || 0,
          paymentMethod: 'card',
          taxInvoiceRequested: isTaxInvoiceRequested,
          taxInvoiceInfo: isTaxInvoiceRequested
            ? {
                type: taxInvoiceType,
                number: taxNumber,
                companyName: taxCompanyName,
              }
            : undefined,
        }),
      });

      const orderData = await createOrderRes.json();

      if (!createOrderRes.ok || !orderData.success) {
        setIsProcessing(false);
        setErrorMessage(orderData.error || '주문 생성 및 서버 금액 검증에 실패했습니다.');
        return;
      }

      // Step B. 쿠폰 및 포인트 사용 처리 (클라이언트 상태 동기화)
      if (pointsToUse > 0) {
        usePoints(pointsToUse, '상품 주문 결제 포인트 사용');
      }
      if (selectedCouponId) {
        applyCoupon(selectedCouponId);
      }

      // Step C. 토스페이먼츠 공식 결제창 호출
      const paymentWidget = paymentWidgetRef.current;
      if (!paymentWidget) {
        throw new Error('토스페이먼츠 결제위젯이 로드되지 않았습니다.');
      }

      const protocol = window.location.protocol;
      const host = window.location.host;
      const baseUrl = `${protocol}//${host}`;

      await paymentWidget.requestPayment({
        orderId: orderData.orderId,
        orderName: orderData.orderName,
        customerName: receiverName.trim(),
        customerEmail: user?.email || 'customer@piuda.kr',
        customerMobilePhone: receiverPhone.replace(/[^0-9]/g, ''),
        successUrl: `${baseUrl}/checkout/success`,
        failUrl: `${baseUrl}/checkout/fail`,
      });
    } catch (err: any) {
      console.error('[handleProcessPayment] Error:', err);
      setIsProcessing(false);
      // 사용자가 창을 닫았을 때 등
      if (err.code !== 'USER_CANCEL') {
        setErrorMessage(err.message || '결제 진행 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 빵부스러기 */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition-colors">
          홈
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/cart" className="hover:text-neutral-900 transition-colors">
          장바구니
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold">주문서 작성/결제</span>
      </nav>

      {/* 헤더 */}
      <div className="border-b border-neutral-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 flex items-center gap-2">
            <span>주문 / 결제</span>
            <span className="text-xs bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full font-bold border border-rose-200">
              토스페이먼츠 안전결제
            </span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            배송지와 결제 수단을 확인하고 할인을 적용하세요.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>SSL 256bit 암호화 안전결제</span>
        </div>
      </div>

      {/* 에러 알림 바 */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleProcessPayment} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 좌측: 주문서 폼 (2열) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. 주문 상품 요약 */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Gift className="w-4 h-4 text-rose-500" />
              주문 상품 정보 ({selectedItems.length}개)
            </h3>

            <div className="space-y-3 divide-y divide-neutral-100">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.mainImage}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-lg bg-neutral-100 border border-neutral-200"
                    />
                    <div>
                      <p className="font-bold text-neutral-900 line-clamp-1">{item.product.name}</p>
                      <p className="text-neutral-400 text-[11px]">
                        {item.selectedOption?.name} | {item.quantity}개
                      </p>
                      {item.product.isOnePlusOne && (
                        <span className="text-rose-600 font-bold text-[10px]">
                          [1+1 증정품 동봉 출고]
                        </span>
                      )}
                    </div>
                  </div>
                  <strong className="text-sm font-black text-neutral-900">
                    {(
                      (item.product.price + (item.selectedOption?.additionalPrice || 0)) *
                      item.quantity
                    ).toLocaleString()}
                    원
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* 2. 배송지 정보 입력 */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-rose-500" />
              배송지 정보
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">받는 사람 *</label>
                <input
                  type="text"
                  required
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:border-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">휴대폰 번호 *</label>
                <input
                  type="text"
                  required
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white focus:border-rose-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-neutral-700 block mb-1">배송 주소 *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    required
                    value={shippingZipcode}
                    onChange={(e) => setShippingZipcode(e.target.value)}
                    placeholder="우편번호"
                    className="w-32 bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-mono"
                  />
                </div>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="기본 주소"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs mb-2"
                />
                <input
                  type="text"
                  value={shippingDetailAddress}
                  onChange={(e) => setShippingDetailAddress(e.target.value)}
                  placeholder="상세 주소 (동, 호수 등)"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-neutral-700 block mb-1">배송 요청 사항</label>
                <select
                  value={shippingMemo}
                  onChange={(e) => setShippingMemo(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs cursor-pointer"
                >
                  <option value="부재 시 문 앞에 놓아주세요.">부재 시 문 앞에 놓아주세요.</option>
                  <option value="배송 전 미리 연락 바랍니다.">배송 전 미리 연락 바랍니다.</option>
                  <option value="경비실에 맡겨주세요.">경비실에 맡겨주세요.</option>
                  <option value="택배함에 넣어주세요.">택배함에 넣어주세요.</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. 쿠폰 및 포인트 할인 적용 */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              할인 쿠폰 & 포인트 사용
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  보유 쿠폰 선택 (사용 가능: {coupons.filter((c) => !c.isUsed).length}개)
                </label>
                <select
                  value={selectedCouponId}
                  onChange={(e) => setSelectedCouponId(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white cursor-pointer"
                >
                  <option value="">적용 가능한 쿠폰 선택 안함</option>
                  {coupons
                    .filter((c) => !c.isUsed)
                    .map((cpn) => (
                      <option key={cpn.id} value={cpn.id}>
                        {cpn.name} -{' '}
                        {cpn.discountType === 'fixed'
                          ? `${cpn.discountValue.toLocaleString()}원 할인`
                          : `${cpn.discountValue}% 할인`}{' '}
                        (최소주문 {cpn.minOrderAmount.toLocaleString()}원)
                      </option>
                    ))}
                </select>
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-neutral-700">포인트 사용</span>
                  <span className="text-neutral-500 text-[11px]">
                    보유 포인트 :{' '}
                    <strong className="text-rose-600">
                      {user?.points.toLocaleString() || 0} P
                    </strong>{' '}
                    (최대 50% 사용 가능)
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    max={maxUsablePoints}
                    value={pointsToUse || ''}
                    onChange={(e) =>
                      setPointsToUse(
                        Math.min(maxUsablePoints, Math.max(0, parseInt(e.target.value) || 0))
                      )
                    }
                    placeholder="0"
                    className="flex-1 bg-white border border-neutral-300 rounded-lg p-2.5 text-xs font-bold text-right"
                  />
                  <button
                    type="button"
                    onClick={handleUseAllPoints}
                    className="bg-neutral-900 text-white font-bold px-4 py-2.5 rounded-lg text-xs hover:bg-neutral-800 cursor-pointer"
                  >
                    전액사용
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. [토스페이먼츠 공식 결제위젯] 카드/카카오페이/네이버페이/토스페이 등 */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-500" />
                결제 수단 선택 및 동의 (토스페이먼츠 결제위젯)
              </span>
              <span className="text-[11px] text-neutral-400 font-normal">
                신용/체크카드 · 간편결제 · 계좌이체 지원
              </span>
            </h3>

            {/* 토스 결제위젯 UI 마운트 영역 */}
            <div id="payment-widget" className="w-full min-h-[280px]" />

            {/* 토스 이용약관 위젯 마운트 영역 */}
            <div id="agreement" className="w-full pt-2 border-t border-neutral-100" />

            {/* 현금영수증 및 세금계산서 신청 */}
            <div className="pt-4 border-t border-neutral-100 space-y-3 text-xs">
              <label className="flex items-center gap-2 font-bold text-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTaxInvoiceRequested}
                  onChange={(e) => setIsTaxInvoiceRequested(e.target.checked)}
                  className="accent-neutral-900 rounded"
                />
                <Receipt className="w-4 h-4 text-neutral-600" />
                현금영수증 / 세금계산서 발행 신청
              </label>

              {isTaxInvoiceRequested && (
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                      <input
                        type="radio"
                        name="taxType"
                        checked={taxInvoiceType === 'cash_receipt'}
                        onChange={() => setTaxInvoiceType('cash_receipt')}
                        className="accent-neutral-900"
                      />
                      현금영수증 (소득공제/지출증빙)
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                      <input
                        type="radio"
                        name="taxType"
                        checked={taxInvoiceType === 'tax_invoice'}
                        onChange={() => setTaxInvoiceType('tax_invoice')}
                        className="accent-neutral-900"
                      />
                      전자세금계산서 (사업자용)
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      placeholder={
                        taxInvoiceType === 'cash_receipt'
                          ? '휴대폰 번호 또는 주민번호'
                          : '사업자등록번호 10자리'
                      }
                      className="bg-white border border-neutral-300 rounded-lg p-2.5 text-xs font-mono"
                    />
                    {taxInvoiceType === 'tax_invoice' && (
                      <input
                        type="text"
                        value={taxCompanyName}
                        onChange={(e) => setTaxCompanyName(e.target.value)}
                        placeholder="상호명(법인명)"
                        className="bg-white border border-neutral-300 rounded-lg p-2.5 text-xs"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 우측: 결제 금액 요약 및 결제하기 버튼 (1열 고정) */}
        <div className="space-y-4">
          <div className="bg-neutral-900 text-white p-6 rounded-2xl shadow-xl space-y-4 text-xs sticky top-24">
            <h3 className="text-base font-black pb-3 border-b border-neutral-800 flex items-center justify-between">
              <span>최종 결제 금액</span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </h3>

            <div className="space-y-2.5 text-neutral-300">
              <div className="flex justify-between">
                <span>상품 주문 총액</span>
                <strong className="text-white">{totalItemAmount.toLocaleString()}원</strong>
              </div>
              <div className="flex justify-between">
                <span>배송비</span>
                <span className="text-white">
                  {shippingFee === 0 ? '무료배송' : `+${shippingFee.toLocaleString()}원`}
                </span>
              </div>
              {couponDiscountAmount > 0 && (
                <div className="flex justify-between text-rose-400 font-bold">
                  <span>쿠폰 할인</span>
                  <span>-{couponDiscountAmount.toLocaleString()}원</span>
                </div>
              )}
              {pointsToUse > 0 && (
                <div className="flex justify-between text-rose-400 font-bold">
                  <span>포인트 결제</span>
                  <span>-{pointsToUse.toLocaleString()}P</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-baseline justify-between">
              <span className="text-sm font-bold text-neutral-300">실 결제 금액</span>
              <strong className="text-3xl font-black text-rose-500">
                {finalPaymentAmount.toLocaleString()}원
              </strong>
            </div>

            {/* 구매 적립 예정 포인트 */}
            <div className="bg-neutral-800 p-3 rounded-xl text-[11px] text-neutral-300 flex items-center justify-between">
              <span>결제 완료 시 적립</span>
              <strong className="text-rose-400">
                +{Math.floor(finalPaymentAmount * 0.02).toLocaleString()} P
              </strong>
            </div>

            {/* 결제하기 버튼 */}
            <button
              type="submit"
              disabled={isProcessing || !isWidgetLoaded}
              className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-neutral-700 text-white font-black py-4 rounded-xl text-base transition-colors shadow-lg mt-4 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>결제 승인 진행 중...</span>
                </>
              ) : (
                <span>{finalPaymentAmount.toLocaleString()}원 안전결제 진행</span>
              )}
            </button>

            <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
              위 주문 내용을 확인하였으며, 토스페이먼츠 전자금융거래 및 결제 서비스 이용약관에
              동의합니다.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
