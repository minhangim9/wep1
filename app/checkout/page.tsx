'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useShop } from '@/context/ShopContext';
import { OrderItem, Order } from '@/types';
import {
  CreditCard,
  Truck,
  Gift,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Receipt,
  Check,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, user, coupons, applyCoupon, usePoints, createOrder, showToast } = useShop();

  const selectedItems = cart.filter((item) => item.selected);

  // 폼 상태
  const [receiverName, setReceiverName] = useState(user?.name || '홍길동');
  const [receiverPhone, setReceiverPhone] = useState(user?.phone || '010-5555-1234');
  const [shippingZipcode, setShippingZipcode] = useState(user?.zipcode || '06236');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '서울특별시 강남구 테헤란로 123');
  const [shippingDetailAddress, setShippingDetailAddress] = useState(user?.detailAddress || '다써바타워 7층');
  const [shippingMemo, setShippingMemo] = useState('부재 시 문 앞에 놓아주세요.');

  // 할인 상태
  const [selectedCouponId, setSelectedCouponId] = useState<string>('');
  const [pointsToUse, setPointsToUse] = useState<number>(0);

  // 결제 수단 & 세금 증빙
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('kakaopay');
  const [isTaxInvoiceRequested, setIsTaxInvoiceRequested] = useState(false);
  const [taxInvoiceType, setTaxInvoiceType] = useState<'cash_receipt' | 'tax_invoice'>('cash_receipt');
  const [taxNumber, setTaxNumber] = useState(user?.phone || '01055551234');
  const [taxCompanyName, setTaxCompanyName] = useState('');

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
  const finalPaymentAmount = Math.max(0, totalItemAmount + shippingFee - couponDiscountAmount - pointsToUse);

  // 포인트 전액 사용 토글
  const handleUseAllPoints = () => {
    setPointsToUse(maxUsablePoints);
  };

  // 결제 진행
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!receiverName || !receiverPhone || !shippingAddress) {
      showToast('배송지 정보를 모두 입력해주세요.', 'error');
      return;
    }

    if (selectedItems.length === 0) {
      showToast('주문할 상품이 없습니다.', 'error');
      router.push('/cart');
      return;
    }

    // 포인트 차감
    if (pointsToUse > 0) {
      const ok = usePoints(pointsToUse, '상품 주문 결제 포인트 사용');
      if (!ok) return;
    }

    // 쿠폰 사용 처리
    if (selectedCouponId) {
      applyCoupon(selectedCouponId);
    }

    // OrderItems 매핑
    const orderItems: OrderItem[] = selectedItems.map((item) => {
      const unitPrice = item.product.price + (item.selectedOption?.additionalPrice || 0);
      return {
        id: 'oi-' + Math.random().toString(36).substring(2, 9),
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.mainImage,
        optionName: item.selectedOption?.name,
        unitPrice,
        quantity: item.quantity,
        totalPrice: unitPrice * item.quantity,
        isOnePlusOneBonus: item.product.isOnePlusOne,
      };
    });

    // 주문 생성
    const newOrder = createOrder({
      userId: user?.id || 'guest-001',
      userName: user?.name || receiverName,
      items: orderItems,
      totalAmount: totalItemAmount,
      discountCouponAmount: couponDiscountAmount,
      usedPoints: pointsToUse,
      shippingFee,
      finalPaymentAmount,
      status: 'paid',
      receiverName,
      receiverPhone,
      shippingZipcode,
      shippingAddress,
      shippingDetailAddress,
      shippingMemo,
      paymentMethod,
      taxInvoiceRequested: isTaxInvoiceRequested,
      taxInvoiceInfo: isTaxInvoiceRequested
        ? {
            type: taxInvoiceType,
            number: taxNumber,
            companyName: taxCompanyName,
          }
        : undefined,
      paymentDetails: {
        cardName: paymentMethod === 'card' ? '현대카드 (일시불)' : undefined,
        receiptUrl: 'https://pg-receipt.dasseoba.com/receipt/' + Date.now(),
      },
      tracking: {
        carrier: 'CJ대한통운',
        carrierCode: '04',
        trackingNumber: '6820' + Math.floor(10000000 + Math.random() * 90000000),
      },
    });

    // 축하 컨페티 효과
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#fda4af', '#fbbf24', '#34d399'],
    });

    showToast('주문 및 결제가 성공적으로 완료되었습니다!', 'success');
    router.push(`/order-complete/${newOrder.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 빵부스러기 */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition-colors">홈</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/cart" className="hover:text-neutral-900 transition-colors">장바구니</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold">주문서 작성/결제</span>
      </nav>

      {/* 헤더 */}
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">주문 / 결제</h1>
        <p className="text-xs text-neutral-500 mt-1">
          배송지와 결제 수단을 확인하고 할인을 적용하세요.
        </p>
      </div>

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
                <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
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
                    {((item.product.price + (item.selectedOption?.additionalPrice || 0)) * item.quantity).toLocaleString()}원
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
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">휴대폰 번호 *</label>
                <input
                  type="text"
                  required
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
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
                    className="w-32 bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShippingZipcode('06236');
                      setShippingAddress('서울특별시 강남구 테헤란로 123');
                    }}
                    className="bg-neutral-800 text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-neutral-700"
                  >
                    우편번호 검색
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="기본 주소"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white mb-2"
                />
                <input
                  type="text"
                  value={shippingDetailAddress}
                  onChange={(e) => setShippingDetailAddress(e.target.value)}
                  placeholder="상세 주소 (동, 호수)"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-neutral-700 block mb-1">배송 요청사항</label>
                <select
                  value={shippingMemo}
                  onChange={(e) => setShippingMemo(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs focus:bg-white cursor-pointer"
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
              {/* 쿠폰 선택 */}
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

              {/* 포인트 사용 */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-neutral-700">포인트 사용</span>
                  <span className="text-neutral-500 text-[11px]">
                    보유 포인트 : <strong className="text-rose-600">{user?.points.toLocaleString() || 0} P</strong> (최대 50% 사용 가능)
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    max={maxUsablePoints}
                    value={pointsToUse || ''}
                    onChange={(e) => setPointsToUse(Math.min(maxUsablePoints, Math.max(0, parseInt(e.target.value) || 0)))}
                    placeholder="0"
                    className="flex-1 bg-white border border-neutral-300 rounded-lg p-2.5 text-xs font-bold text-right"
                  />
                  <button
                    type="button"
                    onClick={handleUseAllPoints}
                    className="bg-neutral-900 text-white font-bold px-4 py-2.5 rounded-lg text-xs hover:bg-neutral-800"
                  >
                    전액사용
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. 결제 수단 선택 */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-rose-500" />
              결제 수단 선택
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-bold">
              {[
                { id: 'kakaopay', label: '카카오페이', badge: '1초 간편결제' },
                { id: 'naverpay', label: '네이버페이', badge: '포인트 적립' },
                { id: 'tosspay', label: '토스페이', badge: '간편결제' },
                { id: 'card', label: '신용/체크카드', badge: '무이자 할부' },
                { id: 'transfer', label: '실시간 계좌이체', badge: '즉시 출금' },
                { id: 'vbank', label: '무통장 가상계좌', badge: '에스크로' },
              ].map((method) => (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === method.id
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-white'
                  }`}
                >
                  <span className="text-sm">{method.label}</span>
                  <span className={`text-[10px] mt-1 font-normal ${paymentMethod === method.id ? 'text-rose-300' : 'text-neutral-400'}`}>
                    {method.badge}
                  </span>
                </button>
              ))}
            </div>

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
                      placeholder={taxInvoiceType === 'cash_receipt' ? '휴대폰 번호 또는 주민번호' : '사업자등록번호 10자리'}
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
              <strong className="text-rose-400">+{Math.floor(finalPaymentAmount * 0.02).toLocaleString()} P</strong>
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-4 rounded-xl text-base transition-colors shadow-lg mt-4 flex items-center justify-center gap-2"
            >
              <span>{finalPaymentAmount.toLocaleString()}원 결제하기</span>
            </button>

            <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
              위 주문 내용을 확인하였으며, 결제 및 서비스 이용약관에 동의합니다.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
