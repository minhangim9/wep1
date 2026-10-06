'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Order,
  Review,
  BoardPost,
  Reservation,
  Coupon,
  PointLog,
  TaxInvoice,
  RawMaterial,
  PopupEvent,
  UserProfile,
  ChatMessage,
  SkinType,
} from '@/types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_REVIEWS,
  INITIAL_POSTS,
  INITIAL_RESERVATIONS,
  INITIAL_COUPONS,
  INITIAL_RAW_MATERIALS,
  INITIAL_POPUPS,
  DEMO_USERS,
} from '@/lib/mockData';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ShopContextType {
  // 사용자 & 인증
  user: UserProfile | null;
  login: (role?: 'customer' | 'admin', customData?: Partial<UserProfile>) => void;
  logout: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  updateUserSkinType: (skinType: SkinType) => void;
  addPoints: (amount: number, reason: string, type: PointLog['type']) => void;
  usePoints: (amount: number, reason: string) => boolean;
  pointLogs: PointLog[];

  // 상품 & 카테고리
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // 장바구니 & 찜 & 최근 본 상품
  cart: CartItem[];
  addToCart: (product: Product, optionId?: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  toggleCartSelect: (cartItemId: string) => void;
  toggleAllCartSelect: (selected: boolean) => void;
  clearCart: () => void;
  wishlist: string[]; // product ids
  toggleWishlist: (productId: string) => void;
  recentProducts: Product[];
  addRecentProduct: (product: Product) => void;

  // 주문 관리
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order;
  cancelOrder: (orderId: string, reason: string) => void;
  requestRefund: (orderId: string, reason: string) => void;
  requestReturn: (orderId: string, reason: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateOrderTracking: (orderId: string, carrier: string, trackingNumber: string) => void;

  // 세금명세서/계산서
  taxInvoices: TaxInvoice[];
  requestTaxInvoice: (orderId: string, info: Omit<TaxInvoice, 'id' | 'orderId' | 'status' | 'createdAt'>) => void;
  updateTaxInvoiceStatus: (id: string, status: TaxInvoice['status']) => void;

  // 리뷰 & 게시판 & 예약
  reviews: Review[];
  addReview: (reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>) => void;
  boardPosts: BoardPost[];
  addBoardPost: (postData: Omit<BoardPost, 'id' | 'createdAt' | 'views'>) => void;
  answerBoardPost: (postId: string, answer: string) => void;
  reservations: Reservation[];
  createReservation: (resData: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => void;
  updateReservationStatus: (id: string, status: Reservation['status'], adminNotes?: string) => void;

  // 쿠폰
  coupons: Coupon[];
  applyCoupon: (couponId: string) => void;

  // 자재 관리
  rawMaterials: RawMaterial[];
  updateMaterialStock: (id: string, amountChange: number) => void;
  addRawMaterial: (material: Omit<RawMaterial, 'id' | 'updatedAt'>) => void;

  // 팝업 이벤트
  popups: PopupEvent[];
  updatePopup: (id: string, data: Partial<PopupEvent>) => void;
  isPopupOpen: boolean;
  closePopup: (hideForDay?: boolean) => void;

  // 챗봇
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;

  // 토스트 알림
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'dasseoba_cosmetics_';

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 상태 로드 도우미
  const getStored = <T,>(key: string, defaultVal: T): T => {
    if (typeof window === 'undefined') return defaultVal;
    try {
      const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const setStored = <T,>(key: string, value: T) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  };

  // State Declarations
  const [user, setUser] = useState<UserProfile | null>(() => getStored('user', DEMO_USERS.customer));
  const [products, setProducts] = useState<Product[]>(() => getStored('products', INITIAL_PRODUCTS));
  const [cart, setCart] = useState<CartItem[]>(() => getStored('cart', []));
  const [wishlist, setWishlist] = useState<string[]>(() => getStored('wishlist', ['prod-001', 'prod-003']));
  const [recentProducts, setRecentProducts] = useState<Product[]>(() => getStored('recent', [INITIAL_PRODUCTS[0], INITIAL_PRODUCTS[1]]));
  const [orders, setOrders] = useState<Order[]>(() => getStored('orders', []));
  const [pointLogs, setPointLogs] = useState<PointLog[]>(() => getStored('pointLogs', [
    {
      id: 'pl-001',
      userId: 'user-001',
      amount: 3000,
      balanceAfter: 3000,
      type: 'SIGNUP_BONUS',
      reason: '신규 회원가입 축하 마일리지',
      createdAt: '2026-08-01 10:00:00',
    },
    {
      id: 'pl-002',
      userId: 'user-001',
      amount: 1500,
      balanceAfter: 4500,
      type: 'REVIEW_BONUS',
      reason: '베스트 포토 리뷰 작성 혜택',
      createdAt: '2026-09-10 15:30:00',
    },
  ]));
  const [reviews, setReviews] = useState<Review[]>(() => getStored('reviews', INITIAL_REVIEWS));
  const [boardPosts, setBoardPosts] = useState<BoardPost[]>(() => getStored('posts', INITIAL_POSTS));
  const [reservations, setReservations] = useState<Reservation[]>(() => getStored('reservations', INITIAL_RESERVATIONS));
  const [coupons, setCoupons] = useState<Coupon[]>(() => getStored('coupons', INITIAL_COUPONS));
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(() => getStored('materials', INITIAL_RAW_MATERIALS));
  const [taxInvoices, setTaxInvoices] = useState<TaxInvoice[]>(() => getStored('taxInvoices', []));
  const [popups, setPopups] = useState<PopupEvent[]>(() => getStored('popups', INITIAL_POPUPS));
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init',
      sender: 'bot',
      text: '안녕하세요! 당신만을 위한 스마트 뷰티 어드바이저 다써바 챗봇입니다 🌸 어떤 도움이 필요하신가요?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: ['내 피부타입 맞춤 화장품 추천', '1+1 특가 이벤트 보기', '주문/배송 조회', '카카오톡 1:1 상담원 연결'],
    },
  ]);

  // Sync to local storage
  useEffect(() => setStored('user', user), [user]);
  useEffect(() => setStored('products', products), [products]);
  useEffect(() => setStored('cart', cart), [cart]);
  useEffect(() => setStored('wishlist', wishlist), [wishlist]);
  useEffect(() => setStored('recent', recentProducts), [recentProducts]);
  useEffect(() => setStored('orders', orders), [orders]);
  useEffect(() => setStored('pointLogs', pointLogs), [pointLogs]);
  useEffect(() => setStored('reviews', reviews), [reviews]);
  useEffect(() => setStored('posts', boardPosts), [boardPosts]);
  useEffect(() => setStored('reservations', reservations), [reservations]);
  useEffect(() => setStored('coupons', coupons), [coupons]);
  useEffect(() => setStored('materials', rawMaterials), [rawMaterials]);
  useEffect(() => setStored('taxInvoices', taxInvoices), [taxInvoices]);
  useEffect(() => setStored('popups', popups), [popups]);

  // Toast Handler
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => removeToast(id), 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // User & Auth
  const login = (role: 'customer' | 'admin' = 'customer', customData?: Partial<UserProfile>) => {
    const baseUser = DEMO_USERS[role];
    const updated = customData ? { ...baseUser, ...customData } : baseUser;
    setUser(updated);
    showToast(`${updated.name}님 환영합니다! (${role === 'admin' ? '관리자 권한' : '일반 회원'})`, 'success');
  };

  const logout = () => {
    setUser(null);
    showToast('로그아웃 되었습니다.', 'info');
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    showToast('프로필 정보가 수정되었습니다.', 'success');
  };

  const updateUserSkinType = (skinType: SkinType) => {
    if (!user) return;
    setUser({ ...user, skinType });
    showToast(`피부타입이 [${skinType}]으로 설정되었습니다. 맞춤 화장품을 추천해 드려요!`, 'success');
  };

  const addPoints = (amount: number, reason: string, type: PointLog['type']) => {
    if (!user) return;
    const newBalance = user.points + amount;
    setUser({ ...user, points: newBalance });
    const log: PointLog = {
      id: 'pl-' + Date.now(),
      userId: user.id,
      amount,
      balanceAfter: newBalance,
      type,
      reason,
      createdAt: new Date().toLocaleString(),
    };
    setPointLogs((prev) => [log, ...prev]);
    showToast(`포인트 ${amount.toLocaleString()}P가 적립되었습니다! (${reason})`, 'success');
  };

  const usePoints = (amount: number, reason: string): boolean => {
    if (!user || user.points < amount) {
      showToast('보유 포인트가 부족합니다.', 'error');
      return false;
    }
    const newBalance = user.points - amount;
    setUser({ ...user, points: newBalance });
    const log: PointLog = {
      id: 'pl-' + Date.now(),
      userId: user.id,
      amount: -amount,
      balanceAfter: newBalance,
      type: 'ORDER_PAYMENT',
      reason,
      createdAt: new Date().toLocaleString(),
    };
    setPointLogs((prev) => [log, ...prev]);
    return true;
  };

  // Products
  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => {
    const newProd: Product = {
      ...prodData,
      id: 'prod-' + Date.now(),
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    showToast(`새 상품 [${newProd.name}]이 등록되었습니다.`, 'success');
  };

  const updateProduct = (id: string, prodData: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...prodData } : p)));
    showToast('상품 정보가 수정되었습니다.', 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('상품이 삭제되었습니다.', 'info');
  };

  // Cart & Wishlist
  const addToCart = (product: Product, optionId?: string, quantity: number = 1) => {
    const option = product.options.find((o) => o.id === optionId) || product.options[0];
    const cartItemId = `${product.id}_${option?.id || 'default'}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          product,
          selectedOption: option,
          quantity,
          selected: true,
          isGiftOnePlusOne: product.isOnePlusOne,
        },
      ];
    });

    showToast(`[${product.name}] 상품이 장바구니에 담겼습니다.`, 'success');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('선택한 상품이 장바구니에서 삭제되었습니다.', 'info');
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const toggleCartSelect = (cartItemId: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, selected: !item.selected } : item))
    );
  };

  const toggleAllCartSelect = (selected: boolean) => {
    setCart((prev) => prev.map((item) => ({ ...item, selected })));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('찜 목록에서 제외되었습니다.', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('찜 목록에 추가되었습니다!', 'success');
        return [...prev, productId];
      }
    });
  };

  const addRecentProduct = (product: Product) => {
    setRecentProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 8);
    });
  };

  // Orders
  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order => {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `ORD-${todayStr}-${randomNum}`;

    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      orderNumber,
      createdAt: new Date().toLocaleString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // 주문 성공 시 장바구니에서 주문된 상품 제거
    setCart((prev) => prev.filter((item) => !item.selected));

    // 구매 적립금 계산 (최종 결제액의 2%)
    const earnedPoints = Math.floor(newOrder.finalPaymentAmount * 0.02);
    if (earnedPoints > 0 && user) {
      addPoints(earnedPoints, `주문 완료 (${orderNumber}) 적립`, 'ORDER_EARN');
    }

    return newOrder;
  };

  const cancelOrder = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled', cancelReason: reason } : o))
    );
    // 사용했던 포인트 환불
    const order = orders.find((o) => o.id === orderId);
    if (order && order.usedPoints > 0 && user) {
      addPoints(order.usedPoints, `주문 취소 (${order.orderNumber}) 포인트 환불`, 'CANCEL_REFUND');
    }
    showToast('주문이 취소되었습니다.', 'info');
  };

  const requestRefund = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'refund_requested', refundReason: reason } : o))
    );
    showToast('환불 신청이 접수되었습니다. 관리자 확인 후 처리됩니다.', 'success');
  };

  const requestReturn = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'return_requested', refundReason: reason } : o))
    );
    showToast('반품 신청이 접수되었습니다. 택배 기사님이 회수 방문 예정입니다.', 'success');
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    showToast(`주문 상태가 [${status}]로 변경되었습니다.`, 'success');
  };

  const updateOrderTracking = (orderId: string, carrier: string, trackingNumber: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'shipped',
              tracking: {
                carrier,
                carrierCode: '04',
                trackingNumber,
                shippedAt: new Date().toLocaleString(),
              },
            }
          : o
      )
    );
    showToast('운송장 정보가 등록되고 배송중 상태로 변경되었습니다.', 'success');
  };

  // Tax Invoices
  const requestTaxInvoice = (orderId: string, info: Omit<TaxInvoice, 'id' | 'orderId' | 'status' | 'createdAt'>) => {
    const newInvoice: TaxInvoice = {
      ...info,
      id: 'tax-' + Date.now(),
      orderId,
      status: 'requested',
      createdAt: new Date().toLocaleString(),
    };
    setTaxInvoices((prev) => [newInvoice, ...prev]);
    showToast('세금명세서/영수증 발행 신청이 완료되었습니다.', 'success');
  };

  const updateTaxInvoiceStatus = (id: string, status: TaxInvoice['status']) => {
    setTaxInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status, issuedAt: new Date().toLocaleString() } : inv))
    );
    showToast('세금명세서 상태가 업데이트되었습니다.', 'success');
  };

  // Reviews
  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>) => {
    const newReview: Review = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      helpfulCount: 0,
      createdAt: new Date().toLocaleString(),
    };
    setReviews((prev) => [newReview, ...prev]);

    // 리뷰 작성 포인트 지급
    const bonus = reviewData.photoUrls && reviewData.photoUrls.length > 0 ? 1500 : 500;
    addPoints(bonus, '상품 리뷰 작성 보너스', 'REVIEW_BONUS');
    showToast(`소중한 리뷰가 등록되었습니다! ${bonus}P가 적립되었습니다.`, 'success');
  };

  // Board Posts
  const addBoardPost = (postData: Omit<BoardPost, 'id' | 'createdAt' | 'views'>) => {
    const newPost: BoardPost = {
      ...postData,
      id: 'post-' + Date.now(),
      views: 1,
      createdAt: new Date().toLocaleString(),
    };
    setBoardPosts((prev) => [newPost, ...prev]);
    showToast('게시글이 성공적으로 등록되었습니다.', 'success');
  };

  const answerBoardPost = (postId: string, answer: string) => {
    setBoardPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, answer, answeredAt: new Date().toLocaleString() } : p
      )
    );
    showToast('답변이 등록되었습니다.', 'success');
  };

  // Reservations
  const createReservation = (resData: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => {
    const newRes: Reservation = {
      ...resData,
      id: 'res-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toLocaleString(),
    };
    setReservations((prev) => [newRes, ...prev]);
    showToast('뷰티 상담/예약 신청이 접수되었습니다. 관리자 확인 후 확정됩니다.', 'success');
  };

  const updateReservationStatus = (id: string, status: Reservation['status'], adminNotes?: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, adminNotes: adminNotes || r.adminNotes } : r))
    );
    showToast(`예약 상태가 [${status}]로 업데이트되었습니다.`, 'success');
  };

  // Coupons
  const applyCoupon = (couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === couponId ? { ...c, isUsed: true } : c))
    );
  };

  // Raw Materials
  const updateMaterialStock = (id: string, amountChange: number) => {
    setRawMaterials((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, currentStock: Math.max(0, m.currentStock + amountChange), updatedAt: new Date().toISOString().slice(0, 10) }
          : m
      )
    );
    showToast('자재 재고 수량이 변경되었습니다.', 'info');
  };

  const addRawMaterial = (material: Omit<RawMaterial, 'id' | 'updatedAt'>) => {
    const newMat: RawMaterial = {
      ...material,
      id: 'mat-' + Date.now(),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setRawMaterials((prev) => [newMat, ...prev]);
    showToast('새 원부자재가 등록되었습니다.', 'success');
  };

  // Popups
  const updatePopup = (id: string, data: Partial<PopupEvent>) => {
    setPopups((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    showToast('팝업 설정이 저장되었습니다.', 'success');
  };

  const closePopup = (hideForDay: boolean = false) => {
    setIsPopupOpen(false);
    if (hideForDay) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_PREFIX + 'hide_popup_day', new Date().toDateString());
      }
    }
  };

  // Chatbot logic
  const sendChatMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      let botResponse = '';
      let quickReplies: string[] | undefined;
      let recs: Product[] | undefined;

      const lower = text.toLowerCase();
      if (lower.includes('추천') || lower.includes('피부') || lower.includes('건성') || lower.includes('지성') || lower.includes('민감')) {
        botResponse = '고객님의 피부 고민을 해결해 줄 다써바 베스트 시카 진정 라인과 수분 크림을 추천드립니다! 🌿';
        recs = [products[0], products[1]];
        quickReplies = ['1+1 상품만 보기', '자극 없는 순한 선크림 추천', '상담원 연결'];
      } else if (lower.includes('1+1') || lower.includes('이벤트') || lower.includes('할인')) {
        botResponse = '현재 [1+1 특별 기획전]이 진행 중입니다! 센텔라 시카 앰플과 비건 톤업 선크림을 본품 더블 증정 혜택으로 만나보세요 🎁';
        recs = [products[0], products[2]];
        quickReplies = ['기획전 바로가기', '쿠폰 받기', '배송비 안내'];
      } else if (lower.includes('배송') || lower.includes('조회') || lower.includes('택배')) {
        botResponse = '오후 2시 이전 결제 완료 건은 당일 출고됩니다! [마이페이지 > 나의 주문 내역]에서 실시간 송장 조회가 가능합니다 🚚';
        quickReplies = ['주문 내역 가기', '무료배송 기준', '카카오톡 상담'];
      } else if (lower.includes('카카오') || lower.includes('상담원') || lower.includes('문의')) {
        botResponse = '전문 뷰티 플래너와 1:1 카카오톡 상담을 원하시면 아래 버튼을 눌러주세요. 실시간으로 맞춤 상담을 도와드립니다 💛';
        quickReplies = ['카카오톡 상담창 열기', '자주 묻는 질문 FAQ', '1:1 문의 접수'];
      } else {
        botResponse = `문의주신 [${text}]에 대해 성심껏 도와드리겠습니다. 추가로 궁금하신 사항을 선택해주세요!`;
        quickReplies = ['맞춤 화장품 추천', '1+1 특가 모아보기', '반품/교환 안내', '카카오톡 연결'];
      }

      const botMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies,
        productRecommendations: recs,
      };

      setChatMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <ShopContext.Provider
      value={{
        user,
        login,
        logout,
        updateUserProfile,
        updateUserSkinType,
        addPoints,
        usePoints,
        pointLogs,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleCartSelect,
        toggleAllCartSelect,
        clearCart,
        wishlist,
        toggleWishlist,
        recentProducts,
        addRecentProduct,
        orders,
        createOrder,
        cancelOrder,
        requestRefund,
        requestReturn,
        updateOrderStatus,
        updateOrderTracking,
        taxInvoices,
        requestTaxInvoice,
        updateTaxInvoiceStatus,
        reviews,
        addReview,
        boardPosts,
        addBoardPost,
        answerBoardPost,
        reservations,
        createReservation,
        updateReservationStatus,
        coupons,
        applyCoupon,
        rawMaterials,
        updateMaterialStock,
        addRawMaterial,
        popups,
        updatePopup,
        isPopupOpen,
        closePopup,
        chatMessages,
        sendChatMessage,
        isChatOpen,
        setIsChatOpen,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
