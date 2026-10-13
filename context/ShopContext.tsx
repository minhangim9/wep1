'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Order,
  OrderStatus,
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
  ShippingAddress,
  SubscriptionItem,
  AdminLoginLog,
  AdminAccount,
  AdminRoleType,
  AdminAccountStatus,
  AdminMenuKey,
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
  INITIAL_ORDERS,
  INITIAL_SHIPPING_ADDRESSES,
  INITIAL_SUBSCRIPTIONS,
} from '@/lib/mockData';
import {
  signUpMember,
  signInMember,
  signOutMember,
  adminSignInMember,
  completeAdminSignIn,
  fetchAdminLoginLogsFromSupabase,
  seedDefaultAdminAccountToSupabase,
  fetchAdminAccountsFromSupabase,
  createAdminAccountInSupabase,
  updateAdminAccountInSupabase,
  updateAdminStatusInSupabase,
  checkAdminAccountStatus,
  changeSuperAdminPasswordInSupabase,
  sendAdminSmsVerificationCode,
  verifyAdminSmsCode,
  assignMemberAsSubAdminInSupabase,
  revokeSubAdminInSupabase,
  registerGuestMemberToSupabase,
  signInGuestMemberFromSupabase,
  AdminSignInResult,
  SignUpParams,
  SignInParams,
  fetchProductsFromSupabase,
  insertProductToSupabase,
  updateProductInSupabase,
  deleteProductFromSupabase,
  syncInitialProductsToSupabase,
  fetchOrdersFromSupabase,
  insertOrderToSupabase,
  updateOrderStatusInSupabase,
  updateOrderTrackingInSupabase,
  updateOrderDeliveryInfoInSupabase,
  deleteOrderFromSupabase,
  syncInitialOrdersToSupabase,
  syncDeliveriesFromOrdersToSupabase,
  fetchRawMaterialsFromSupabase,
  insertRawMaterialToSupabase,
  updateRawMaterialStockInSupabase,
  syncInitialRawMaterialsToSupabase,
  fetchTaxInvoicesFromSupabase,
  insertTaxInvoiceToSupabase,
  updateTaxInvoiceStatusInSupabase,
  syncInitialTaxInvoicesToSupabase,
  calculateTaxInvoiceItemsFromOrder,
  updateSkinProfileInSupabase,
  fetchShippingAddressesFromSupabase,
  upsertShippingAddressToSupabase,
  deleteShippingAddressFromSupabase,
  setDefaultShippingAddressInSupabase,
  fetchSubscriptionsFromSupabase,
  upsertSubscriptionToSupabase,
  updateSubscriptionStatusInSupabase,
  updateSubscriptionIntervalInSupabase,
  fetchReviewsFromSupabase,
  insertReviewToSupabase,
  deleteReviewFromSupabase,
  fetchCouponsFromSupabase,
  registerCouponToSupabase,
} from '@/lib/supabase';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ShopContextType {
  isMounted: boolean;
  // 사용자 & 인증
  user: UserProfile | null;
  login: (role?: 'customer' | 'admin', customData?: Partial<UserProfile>) => void;
  signUp: (params: SignUpParams) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  signIn: (params: SignInParams) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  adminLogin: (params: SignInParams) => Promise<AdminSignInResult>;
  adminCompleteMfaLogin: (adminAccount: AdminAccount) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  adminSendSmsCode: (phone: string) => { code: string; expiresAt: number; formattedExpiry: string };
  adminVerifySmsCode: (phone: string, code: string) => { success: boolean; message: string };
  adminLoginLogs: AdminLoginLog[];
  isLoadingAdminLogs: boolean;
  refreshAdminLoginLogs: () => Promise<void>;

  // 부관리자 관리 및 권한 (Role / Status / MFA)
  adminAccounts: AdminAccount[];
  isLoadingAdminAccounts: boolean;
  refreshAdminAccounts: () => Promise<void>;
  createAdminAccount: (params: {
    email: string;
    plainPassword: string;
    name: string;
    phone: string;
    role: AdminRoleType;
    status: AdminAccountStatus;
    permissions: AdminMenuKey[];
    memo?: string;
  }) => Promise<{ success: boolean; data?: AdminAccount; error?: string }>;
  updateAdminAccount: (id: string, updates: Partial<AdminAccount> & { newPlainPassword?: string }) => Promise<{ success: boolean; error?: string | null }>;
  toggleAdminStatus: (id: string, status: AdminAccountStatus) => Promise<{ success: boolean; error?: string | null }>;
  changeSuperAdminPassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string | null }>;
  hasAdminMenuPermission: (menuKey: AdminMenuKey) => boolean;
  assignMemberAsSubAdmin: (params: {
    memberId?: string;
    email: string;
    name: string;
    phone: string;
    permissions: AdminMenuKey[];
    memo?: string;
  }) => Promise<{ success: boolean; data?: AdminAccount; error?: string }>;
  revokeSubAdmin: (email: string) => Promise<{ success: boolean; error?: string }>;

  // 비회원 가입 및 주문 조회 (Supabase 연동)
  registerGuest: (params: {
    name: string;
    phone: string;
    email?: string;
    orderPassword?: string;
    address?: string;
    detailAddress?: string;
    zipcode?: string;
    marketingAgreed?: boolean;
  }) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  signInGuest: (phone: string, orderPassword?: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  logout: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  updateUserSkinType: (skinType: SkinType) => void;
  updateSkinProfile: (skinType: SkinType, skinConcerns: string[]) => Promise<void>;
  addPoints: (amount: number, reason: string, type: PointLog['type']) => void;
  usePoints: (amount: number, reason: string) => boolean;
  pointLogs: PointLog[];

  // 상품 & 카테고리
  products: Product[];
  isLoadingProducts: boolean;
  refreshProducts: () => Promise<void>;
  syncAllProductsToSupabase: () => Promise<{ success: boolean; count: number; error?: string }>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

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
  clearWishlist: () => void;
  recentProducts: Product[];
  addRecentProduct: (product: Product) => void;

  // 주문 및 발주 관리 (Supabase 실시간 연동)
  orders: Order[];
  isLoadingOrders: boolean;
  refreshOrders: () => Promise<void>;
  syncAllOrdersToSupabase: () => Promise<{ success: boolean; count: number; error?: string }>;
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order;
  cancelOrder: (orderId: string, reason: string) => void;
  requestRefund: (orderId: string, reason: string) => void;
  requestReturn: (orderId: string, reason: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateOrderTracking: (orderId: string, carrier: string, trackingNumber: string) => Promise<void>;
  updateOrderDeliveryInfo: (
    orderId: string,
    updates: {
      carrier?: string;
      trackingNumber?: string;
      status?: OrderStatus;
      receiverName?: string;
      receiverPhone?: string;
      shippingAddress?: string;
      shippingDetailAddress?: string;
      shippingMemo?: string;
    }
  ) => Promise<void>;
  syncDeliveriesToSupabase: () => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;

  // 세금명세서/계산서
  taxInvoices: TaxInvoice[];
  isLoadingTaxInvoices: boolean;
  refreshTaxInvoices: () => Promise<void>;
  requestTaxInvoice: (orderId: string, info: Omit<TaxInvoice, 'id' | 'orderId' | 'status' | 'createdAt'>) => Promise<TaxInvoice | null>;
  updateTaxInvoiceStatus: (id: string, status: TaxInvoice['status']) => Promise<void>;
  syncAllTaxInvoicesToSupabase: () => Promise<{ success: boolean; count: number; error?: string }>;

  // 리뷰 & 게시판 & 예약
  reviews: Review[];
  addReview: (reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  boardPosts: BoardPost[];
  addBoardPost: (postData: Omit<BoardPost, 'id' | 'createdAt' | 'views'>) => void;
  answerBoardPost: (postId: string, answer: string) => void;
  reservations: Reservation[];
  createReservation: (resData: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => void;
  updateReservationStatus: (id: string, status: Reservation['status'], adminNotes?: string) => void;

  // 배송지 관리 (Supabase)
  shippingAddresses: ShippingAddress[];
  refreshShippingAddresses: () => Promise<void>;
  addShippingAddress: (addr: Omit<ShippingAddress, 'id' | 'userId'>) => Promise<ShippingAddress | null>;
  updateShippingAddress: (addr: ShippingAddress) => Promise<void>;
  deleteShippingAddress: (id: string) => Promise<void>;
  setDefaultShippingAddress: (id: string) => Promise<void>;

  // 화장품 정기구독 관리 (Supabase)
  subscriptions: SubscriptionItem[];
  refreshSubscriptions: () => Promise<void>;
  addSubscription: (sub: Omit<SubscriptionItem, 'id' | 'userId'>) => Promise<SubscriptionItem | null>;
  updateSubscriptionStatus: (id: string, status: 'active' | 'paused' | 'cancelled') => Promise<void>;
  updateSubscriptionInterval: (id: string, intervalMonths: number, nextDate: string) => Promise<void>;

  // 쿠폰
  coupons: Coupon[];
  applyCoupon: (couponId: string) => void;
  registerOfflineCoupon: (code: string) => Promise<{ success: boolean; message: string }>;

  // 원부자재 및 재고 관리
  rawMaterials: RawMaterial[];
  isLoadingMaterials: boolean;
  refreshRawMaterials: () => Promise<void>;
  updateMaterialStock: (id: string, amountChange: number) => Promise<void>;
  addRawMaterial: (material: Omit<RawMaterial, 'id' | 'updatedAt'>) => Promise<void>;
  syncAllMaterialsToSupabase: () => Promise<{ success: boolean; count: number; error?: string }>;

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

  // 로그인/회원가입 팝업 모달
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: 'login' | 'register') => void;

  // Supabase 설정 및 진단 모달
  isSupabaseModalOpen: boolean;
  openSupabaseModal: () => void;
  closeSupabaseModal: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'piuda_cosmetics_';

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 상태 로드 도우미 (상품, 장바구니 등 일반 데이터용 localStorage)
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

  // 사용자 로그인 세션 도우미: 브라우저를 닫으면 자동으로 로그아웃되도록 sessionStorage만 사용
  const getSessionUser = (): UserProfile | null => {
    if (typeof window === 'undefined') return null;
    try {
      // 기존 localStorage에 남아있던 영구 로그인 정보 및 토큰을 즉시 제거하여 자동 로그인 방지
      localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'user');
      localStorage.removeItem('piuda_user');
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
          localStorage.removeItem(k);
        }
      }

      const item = sessionStorage.getItem(LOCAL_STORAGE_PREFIX + 'user');
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  };

  const setSessionUser = (value: UserProfile | null) => {
    if (typeof window === 'undefined') return;
    try {
      if (value) {
        sessionStorage.setItem(LOCAL_STORAGE_PREFIX + 'user', JSON.stringify(value));
      } else {
        sessionStorage.removeItem(LOCAL_STORAGE_PREFIX + 'user');
      }
      localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'user');
      localStorage.removeItem('piuda_user');
    } catch (e) {
      console.error(e);
    }
  };

  // State Declarations (브라우저 시작 시 비로그인(null) 상태로 시작, 현재 탭/브라우저 세션이 있을 때만 복원)
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(['prod-001', 'prod-003']);
  const [recentProducts, setRecentProducts] = useState<Product[]>([INITIAL_PRODUCTS[0], INITIAL_PRODUCTS[1]]);
  const [pointLogs, setPointLogs] = useState<PointLog[]>([
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
  ]);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [boardPosts, setBoardPosts] = useState<BoardPost[]>(INITIAL_POSTS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[]>(INITIAL_SHIPPING_ADDRESSES);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(INITIAL_SUBSCRIPTIONS);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(INITIAL_RAW_MATERIALS);
  const [taxInvoices, setTaxInvoices] = useState<TaxInvoice[]>([]);
  const [popups, setPopups] = useState<PopupEvent[]>(INITIAL_POPUPS);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);

  // 관리자 접속 로그 (Supabase admin_login_logs)
  const [adminLoginLogs, setAdminLoginLogs] = useState<AdminLoginLog[]>([]);
  const [isLoadingAdminLogs, setIsLoadingAdminLogs] = useState<boolean>(false);

  const refreshAdminLoginLogs = async () => {
    setIsLoadingAdminLogs(true);
    try {
      const { data, error } = await fetchAdminLoginLogsFromSupabase(30);
      if (!error && data) {
        setAdminLoginLogs(data);
      }
    } catch (e) {
      console.warn('Supabase fetchAdminLoginLogs error:', e);
    } finally {
      setIsLoadingAdminLogs(false);
    }
  };

  // 부관리자 계정 관리 (Supabase admin_accounts)
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);
  const [isLoadingAdminAccounts, setIsLoadingAdminAccounts] = useState<boolean>(false);

  const refreshAdminAccounts = async () => {
    setIsLoadingAdminAccounts(true);
    try {
      const { data, error } = await fetchAdminAccountsFromSupabase();
      if (!error && data) {
        setAdminAccounts(data);
      }
    } catch (e) {
      console.warn('Supabase fetchAdminAccounts error:', e);
    } finally {
      setIsLoadingAdminAccounts(false);
    }
  };

  const refreshProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const { data, error } = await fetchProductsFromSupabase();
      if (!error && data && data.length > 0) {
        setProducts(data);
      }
    } catch (e) {
      console.warn('Supabase fetchProducts error:', e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const refreshOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const { data, error } = await fetchOrdersFromSupabase();
      if (!error && data && data.length > 0) {
        setOrders(data);
      }
    } catch (e) {
      console.warn('Supabase fetchOrders error:', e);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const refreshRawMaterials = async () => {
    setIsLoadingMaterials(true);
    try {
      const { data, error } = await fetchRawMaterialsFromSupabase();
      if (!error && data && data.length > 0) {
        setRawMaterials(data);
      }
    } catch (e) {
      console.warn('Supabase fetchRawMaterials error:', e);
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  const [isLoadingTaxInvoices, setIsLoadingTaxInvoices] = useState(false);
  const refreshTaxInvoices = async () => {
    setIsLoadingTaxInvoices(true);
    try {
      const { data, error } = await fetchTaxInvoicesFromSupabase();
      if (!error && data && data.length > 0) {
        setTaxInvoices(data);
      }
    } catch (e) {
      console.warn('Supabase fetchTaxInvoices error:', e);
    } finally {
      setIsLoadingTaxInvoices(false);
    }
  };

  const refreshShippingAddresses = async () => {
    if (!user) return;
    try {
      const { data, error } = await fetchShippingAddressesFromSupabase(user.id);
      if (!error && data && data.length > 0) {
        setShippingAddresses(data);
      }
    } catch (e) {
      console.warn('Supabase fetchShippingAddresses error:', e);
    }
  };

  const refreshSubscriptions = async () => {
    if (!user) return;
    try {
      const { data, error } = await fetchSubscriptionsFromSupabase(user.id);
      if (!error && data && data.length > 0) {
        setSubscriptions(data);
      }
    } catch (e) {
      console.warn('Supabase fetchSubscriptions error:', e);
    }
  };

  // Client-side Hydration Effect
  useEffect(() => {
    setIsMounted(true);
    try {
      // 브라우저 종료 시 자동 로그아웃: sessionStorage에만 저장된 현재 브라우저 세션 유저만 복원
      const savedUser = getSessionUser();
      setUser(savedUser);

      const savedProducts = getStored<Product[] | null>('products', null);
      if (savedProducts && savedProducts.length > 0) setProducts(savedProducts);

      const savedCart = getStored<CartItem[] | null>('cart', null);
      if (savedCart) setCart(savedCart);

      const savedWishlist = getStored<string[] | null>('wishlist', null);
      if (savedWishlist) setWishlist(savedWishlist);

      const savedRecent = getStored<Product[] | null>('recent', null);
      if (savedRecent) setRecentProducts(savedRecent);

      const savedOrders = getStored<Order[] | null>('orders', null);
      if (savedOrders && savedOrders.length > 0) setOrders(savedOrders);

      const savedPoints = getStored<PointLog[] | null>('pointLogs', null);
      if (savedPoints && savedPoints.length > 0) setPointLogs(savedPoints);

      const savedReviews = getStored<Review[] | null>('reviews', null);
      if (savedReviews) setReviews(savedReviews);

      const savedPosts = getStored<BoardPost[] | null>('posts', null);
      if (savedPosts) setBoardPosts(savedPosts);

      const savedReservations = getStored<Reservation[] | null>('reservations', null);
      if (savedReservations) setReservations(savedReservations);

      const savedCoupons = getStored<Coupon[] | null>('coupons', null);
      if (savedCoupons) setCoupons(savedCoupons);

      const savedAddresses = getStored<ShippingAddress[] | null>('shippingAddresses', null);
      if (savedAddresses && savedAddresses.length > 0) setShippingAddresses(savedAddresses);

      const savedSubs = getStored<SubscriptionItem[] | null>('subscriptions', null);
      if (savedSubs && savedSubs.length > 0) setSubscriptions(savedSubs);

      const savedMaterials = getStored<RawMaterial[] | null>('materials', null);
      if (savedMaterials) setRawMaterials(savedMaterials);

      const savedTaxInvoices = getStored<TaxInvoice[] | null>('taxInvoices', null);
      if (savedTaxInvoices) setTaxInvoices(savedTaxInvoices);

      const savedPopups = getStored<PopupEvent[] | null>('popups', null);
      if (savedPopups) setPopups(savedPopups);
    } catch (e) {
      console.error('Error hydrating storage state:', e);
    }

    refreshProducts();
    refreshOrders();
    refreshRawMaterials();
    refreshTaxInvoices();
    seedDefaultAdminAccountToSupabase();
    refreshAdminLoginLogs();
    refreshAdminAccounts();
  }, []);

  // 로그인 세션 변경 시 회원별 배송지 및 정기구독 데이터 동기화
  useEffect(() => {
    if (!isMounted || !user) return;
    refreshShippingAddresses();
    refreshSubscriptions();
  }, [user?.id, isMounted]);

  // [요구사항 2] 관리자 계정 상태(active / suspended) 실시간 감시 (승인중지 시 기존 세션 강제 만료)
  useEffect(() => {
    if (!isMounted || !user || user.role !== 'admin') return;

    const interval = setInterval(async () => {
      try {
        const currentStatus = await checkAdminAccountStatus(user.email);
        if (currentStatus === 'suspended') {
          signOutMember();
          setUser(null);
          showToast(`[보안 경고] 관리자 계정(${user.email})이 [승인중지] 처리되어 세션이 즉시 만료되었습니다.`, 'error');
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
          }
        }
      } catch (e) {
        // ignore
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [user, isMounted]);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openSupabaseModal = () => {
    setIsSupabaseModalOpen(true);
  };

  const closeSupabaseModal = () => {
    setIsSupabaseModalOpen(false);
  };

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init',
      sender: 'bot',
      text: '안녕하세요! 당신만을 위한 스마트 뷰티 어드바이저 피우다(Piuda) 챗봇입니다 🌸 어떤 도움이 필요하신가요?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: ['내 피부타입 맞춤 화장품 추천', '1+1 특가 이벤트 보기', '주문/배송 조회', '카카오톡 1:1 상담원 연결'],
    },
  ]);

  // Sync user to sessionStorage (브라우저 닫으면 자동 삭제) & other data to localStorage
  useEffect(() => {
    if (isMounted) setSessionUser(user);
  }, [user, isMounted]);

  useEffect(() => {
    if (isMounted) setStored('products', products);
  }, [products, isMounted]);

  useEffect(() => {
    if (isMounted) setStored('cart', cart);
  }, [cart, isMounted]);

  useEffect(() => {
    if (isMounted) setStored('wishlist', wishlist);
  }, [wishlist, isMounted]);

  useEffect(() => {
    if (isMounted) setStored('recent', recentProducts);
  }, [recentProducts, isMounted]);

  useEffect(() => {
    if (isMounted) setStored('orders', orders);
  }, [orders, isMounted]);

  useEffect(() => {
    if (isMounted) setStored('pointLogs', pointLogs);
  }, [pointLogs, isMounted]);

  useEffect(() => {
    if (isMounted) setStored('reviews', reviews);
  }, [reviews, isMounted]);

  useEffect(() => {
    if (isMounted) setStored('posts', boardPosts);
  }, [boardPosts, isMounted]);

  useEffect(() => {
    if (isMounted) setStored('reservations', reservations);
  }, [reservations, isMounted]);

  useEffect(() => {
    if (isMounted) setStored('coupons', coupons);
  }, [coupons, isMounted]);

  useEffect(() => {
    if (isMounted) setStored('materials', rawMaterials);
  }, [rawMaterials, isMounted]);

  useEffect(() => {
    if (isMounted) setStored('taxInvoices', taxInvoices);
  }, [taxInvoices, isMounted]);

  useEffect(() => {
    if (isMounted) setStored('popups', popups);
  }, [popups, isMounted]);

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
    setSessionUser(updated);
    setUser(updated);
    showToast(`${updated.name}님 환영합니다! (${role === 'admin' ? '관리자 권한' : '일반 회원'})`, 'success');
  };

  const signUp = async (params: SignUpParams) => {
    const { data, error } = await signUpMember(params);
    if (error || !data) {
      showToast(error || '회원가입에 실패했습니다.', 'error');
      return { success: false, error: error || '회원가입 실패' };
    }
    setSessionUser(data);
    setUser(data);
    showToast(`${data.name}님 피우다(Piuda) 회원가입을 환영합니다! 웰컴 적립금 3,000P 지급 완료 🎉`, 'success');
    return { success: true, user: data };
  };

  const signIn = async (params: SignInParams) => {
    const { data, error } = await signInMember(params);
    if (error || !data) {
      showToast(error || '로그인에 실패했습니다.', 'error');
      return { success: false, error: error || '로그인 실패' };
    }
    setSessionUser(data);
    setUser(data);
    showToast(`${data.name}님 반갑습니다! (${data.role === 'admin' ? '관리자 권한' : data.tier + ' 등급'})`, 'success');
    return { success: true, user: data };
  };

  const adminLogin = async (params: SignInParams): Promise<AdminSignInResult> => {
    const res = await adminSignInMember(params);
    if (res.error) {
      showToast(res.error, 'error');
      await refreshAdminLoginLogs();
      return res;
    }
    if (res.requiresMfa) {
      showToast('최고 관리자 보안 강화: 등록된 휴대폰으로 2차 SMS 인증을 진행해주세요.', 'info');
      return res;
    }
    if (res.data) {
      setSessionUser(res.data);
      setUser(res.data);
      showToast(`관리자 [${res.data.name}]님 환영합니다! Supabase에 접속 이력이 실시간 기록되었습니다.`, 'success');
      await refreshAdminLoginLogs();
    }
    return res;
  };

  const adminCompleteMfaLogin = async (adminAccount: AdminAccount) => {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Console';
    const res = await completeAdminSignIn(adminAccount, userAgent);
    if (res.error || !res.data) {
      showToast(res.error || '2차 인증 후 세션 발급에 실패했습니다.', 'error');
      return { success: false, error: res.error || '인증 실패' };
    }
    setSessionUser(res.data);
    setUser(res.data);
    showToast(`최고 관리자 [${res.data.name}]님 2차 MFA 인증 완료! 관리자 콘솔에 접속되었습니다.`, 'success');
    await refreshAdminLoginLogs();
    return { success: true, user: res.data };
  };

  const adminSendSmsCode = (phone: string) => {
    const res = sendAdminSmsVerificationCode(phone);
    showToast(`[SMS MFA] 인증번호 6자리가 발송되었습니다. (테스트용: ${res.code})`, 'info');
    return res;
  };

  const adminVerifySmsCode = (phone: string, code: string) => {
    return verifyAdminSmsCode(phone, code);
  };

  const createAdminAccount = async (params: {
    email: string;
    plainPassword: string;
    name: string;
    phone: string;
    role: AdminRoleType;
    status: AdminAccountStatus;
    permissions: AdminMenuKey[];
    memo?: string;
  }) => {
    const res = await createAdminAccountInSupabase(params);
    if (res.error || !res.data) {
      showToast(res.error || '부관리자 등록에 실패했습니다.', 'error');
      return { success: false, error: res.error || '등록 실패' };
    }
    showToast(`부관리자 [${res.data.name}] 계정이 등록되었습니다. (비밀번호 해시 암호화 완료)`, 'success');
    await refreshAdminAccounts();
    return { success: true, data: res.data };
  };

  const updateAdminAccount = async (id: string, updates: Partial<AdminAccount> & { newPlainPassword?: string }) => {
    const res = await updateAdminAccountInSupabase(id, updates);
    if (!res.success) {
      showToast(res.error || '관리자 계정 수정 실패', 'error');
      return { success: false, error: res.error };
    }
    showToast('관리자 계정 정보 및 메뉴 권한이 성공적으로 수정되었습니다.', 'success');
    await refreshAdminAccounts();
    return { success: true };
  };

  const toggleAdminStatus = async (id: string, status: AdminAccountStatus) => {
    const res = await updateAdminStatusInSupabase(id, status);
    if (!res.success) {
      showToast(res.error || '계정 상태 변경 실패', 'error');
      return { success: false, error: res.error };
    }
    const isSuspended = status === 'suspended';
    showToast(
      isSuspended
        ? '계정이 [승인중지] 처리되었습니다. 해당 계정은 즉시 로그인이 차단되며 활동 중인 세션도 강제 만료됩니다.'
        : '계정이 [정상 승인] 처리되었습니다.',
      isSuspended ? 'error' : 'success'
    );
    await refreshAdminAccounts();
    return { success: true };
  };

  const changeSuperAdminPassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return { success: false, error: '로그인이 필요합니다.' };
    const res = await changeSuperAdminPasswordInSupabase(user.email, currentPassword, newPassword);
    if (!res.success) {
      showToast(res.error || '비밀번호 변경 실패', 'error');
      return { success: false, error: res.error };
    }
    showToast('최고 관리자 대표 계정의 비밀번호가 안전하게 변경되었습니다. (해시 암호화 적용)', 'success');
    return { success: true };
  };

  const hasAdminMenuPermission = (menuKey: AdminMenuKey): boolean => {
    if (!user || user.role !== 'admin') return false;
    if (user.adminRole === 'super_admin' || user.email === 'admin@piuda.kr') return true;
    if (!user.permissions || user.permissions.length === 0) {
      return menuKey === 'dashboard';
    }
    return user.permissions.includes(menuKey);
  };

  const assignMemberAsSubAdmin = async (params: {
    memberId?: string;
    email: string;
    name: string;
    phone: string;
    permissions: AdminMenuKey[];
    memo?: string;
  }) => {
    const assignedBy = user?.name || user?.email || '총괄관리자';
    const res = await assignMemberAsSubAdminInSupabase({ ...params, assignedBy });
    if (!res.success || !res.data) {
      showToast(res.error || '부관리자 지정에 실패했습니다.', 'error');
      return { success: false, error: res.error || '지정 실패' };
    }
    showToast(`회원 [${params.name}]님이 부관리자로 성공적으로 지정되었습니다! (권한 ${params.permissions.length}개 부여)`, 'success');
    await refreshAdminAccounts();
    return { success: true, data: res.data };
  };

  const revokeSubAdmin = async (email: string) => {
    const res = await revokeSubAdminInSupabase(email);
    if (!res.success) {
      showToast(res.error || '부관리자 해제 실패', 'error');
      return { success: false, error: res.error || '해제 실패' };
    }
    showToast(`계정 [${email}]의 부관리자 권한이 성공적으로 해제되었습니다. (일반회원 전환)`, 'info');
    await refreshAdminAccounts();
    return { success: true };
  };

  const registerGuest = async (params: {
    name: string;
    phone: string;
    email?: string;
    orderPassword?: string;
    address?: string;
    detailAddress?: string;
    zipcode?: string;
    marketingAgreed?: boolean;
  }) => {
    const res = await registerGuestMemberToSupabase(params);
    if (res.error || !res.data) {
      showToast(res.error || '비회원 등록에 실패했습니다.', 'error');
      return { success: false, error: res.error || '비회원 등록 실패' };
    }
    setSessionUser(res.data);
    setUser(res.data);
    showToast(`비회원 [${res.data.name}]님으로 간편 등록되었습니다. (Supabase guest_members 저장 완료)`, 'success');
    return { success: true, user: res.data };
  };

  const signInGuest = async (phone: string, orderPassword?: string) => {
    const res = await signInGuestMemberFromSupabase(phone, orderPassword);
    if (res.error || !res.data) {
      showToast(res.error || '비회원 조회 실패', 'error');
      return { success: false, error: res.error || '비회원 조회 실패' };
    }
    setSessionUser(res.data);
    setUser(res.data);
    showToast(`비회원 [${res.data.name}]님의 주문 조회가 완료되었습니다.`, 'success');
    return { success: true, user: res.data };
  };

  const logout = () => {
    setSessionUser(null);
    signOutMember();
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

  const updateSkinProfile = async (skinType: SkinType, skinConcerns: string[]) => {
    if (!user) return;
    const updated = { ...user, skinType, skinConcerns };
    setUser(updated);
    showToast(`피부 프로필([${skinType}], 고민 ${skinConcerns.length}개)이 저장되었습니다.`, 'success');

    const { error } = await updateSkinProfileInSupabase(user.id, skinType, skinConcerns);
    if (error) {
      console.warn('Supabase updateSkinProfile warning:', error);
    }
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

  // Products (Supabase DB 연동)
  const addProduct = async (prodData: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>): Promise<Product> => {
    const newProd: Product = {
      ...prodData,
      id: 'prod-' + Date.now(),
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };

    // 로컬 상태 즉시 반영 (낙관적 UI 업데이트)
    setProducts((prev) => [newProd, ...prev]);

    // Supabase DB에 저장
    const { data, error } = await insertProductToSupabase(newProd);
    if (error) {
      console.warn('Supabase insertProduct warning:', error);
      showToast(`새 상품 [${newProd.name}]이 등록되었습니다. (Supabase 동기화: ${error})`, 'info');
    } else {
      showToast(`새 상품 [${newProd.name}]이 Supabase products 테이블에 안전하게 저장되었습니다! ✨`, 'success');
      if (data) {
        setProducts((prev) => prev.map((p) => (p.id === newProd.id ? data : p)));
        return data;
      }
    }
    return newProd;
  };

  const updateProduct = async (id: string, prodData: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...prodData } : p)));
    const { error } = await updateProductInSupabase(id, prodData);
    if (error) {
      showToast(`상품 정보가 수정되었습니다. (Supabase: ${error})`, 'info');
    } else {
      showToast('상품 정보가 Supabase DB에 성공적으로 반영되었습니다.', 'success');
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    const { error } = await deleteProductFromSupabase(id);
    if (error) {
      showToast(`상품이 삭제되었습니다. (Supabase: ${error})`, 'info');
    } else {
      showToast('상품이 Supabase DB에서 삭제되었습니다.', 'info');
    }
  };

  const syncAllProductsToSupabase = async () => {
    setIsLoadingProducts(true);
    try {
      const { count, error } = await syncInitialProductsToSupabase(products);
      if (error) {
        showToast(`Supabase 동기화 실패: ${error}`, 'error');
        return { success: false, count: 0, error };
      }
      showToast(`총 ${count}개의 상품이 Supabase DB에 동기화되었습니다! 🎉`, 'success');
      await refreshProducts();
      return { success: true, count };
    } catch (err: any) {
      showToast(`동기화 오류: ${err.message}`, 'error');
      return { success: false, count: 0, error: err.message };
    } finally {
      setIsLoadingProducts(false);
    }
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

  const clearWishlist = () => {
    setWishlist([]);
    showToast('찜한 상품을 모두 삭제했습니다.', 'info');
  };

  const addRecentProduct = (product: Product) => {
    setRecentProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 8);
    });
  };

  // Orders & Purchase Orders (Supabase 실시간 연동)
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

    // Supabase DB에 실시간 저장 (비동기)
    insertOrderToSupabase(newOrder).then(({ error }) => {
      if (error) {
        console.warn('Supabase insertOrder warning:', error);
      } else {
        console.log(`Supabase orders 테이블에 주문 [${orderNumber}] 저장 완료`);
      }
    });

    // 주문 성공 시 장바구니에서 주문된 상품 제거
    setCart((prev) => prev.filter((item) => !item.selected));

    // 구매 적립금 계산 (최종 결제액의 2%)
    const earnedPoints = Math.floor(newOrder.finalPaymentAmount * 0.02);
    if (earnedPoints > 0 && user) {
      addPoints(earnedPoints, `주문 완료 (${orderNumber}) 적립`, 'ORDER_EARN');
    }

    return newOrder;
  };

  const cancelOrder = async (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled', cancelReason: reason } : o))
    );
    await updateOrderStatusInSupabase(orderId, 'cancelled');
    // 사용했던 포인트 환불
    const order = orders.find((o) => o.id === orderId);
    if (order && order.usedPoints > 0 && user) {
      addPoints(order.usedPoints, `주문 취소 (${order.orderNumber}) 포인트 환불`, 'CANCEL_REFUND');
    }
    showToast('주문이 취소되었습니다.', 'info');
  };

  const requestRefund = async (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'refund_requested', refundReason: reason } : o))
    );
    await updateOrderStatusInSupabase(orderId, 'refund_requested');
    showToast('환불 신청이 접수되었습니다. 관리자 확인 후 처리됩니다.', 'success');
  };

  const requestReturn = async (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'return_requested', refundReason: reason } : o))
    );
    await updateOrderStatusInSupabase(orderId, 'return_requested');
    showToast('반품 신청이 접수되었습니다. 택배 기사님이 회수 방문 예정입니다.', 'success');
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    const { error } = await updateOrderStatusInSupabase(orderId, status);
    if (error) {
      showToast(`주문 상태 변경 (Supabase: ${error})`, 'info');
    } else {
      showToast(`주문 상태가 [${status}]로 Supabase DB에 업데이트되었습니다.`, 'success');
    }
  };

  const updateOrderTracking = async (orderId: string, carrier: string, trackingNumber: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
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
    const { error } = await updateOrderTrackingInSupabase(orderId, carrier, trackingNumber, targetOrder);
    if (error) {
      showToast(`운송장 정보 등록 (Supabase: ${error})`, 'info');
    } else {
      showToast('운송장 정보가 등록되고 배송중 상태로 Supabase DB에 동기화되었습니다.', 'success');
    }
  };

  const updateOrderDeliveryInfo = async (
    orderId: string,
    updates: {
      carrier?: string;
      trackingNumber?: string;
      status?: OrderStatus;
      receiverName?: string;
      receiverPhone?: string;
      shippingAddress?: string;
      shippingDetailAddress?: string;
      shippingMemo?: string;
    }
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const newTracking = (updates.carrier || updates.trackingNumber !== undefined)
          ? {
              carrier: updates.carrier || o.tracking?.carrier || 'CJ대한통운',
              carrierCode: '04',
              trackingNumber: updates.trackingNumber !== undefined ? updates.trackingNumber : (o.tracking?.trackingNumber || ''),
              shippedAt: o.tracking?.shippedAt || new Date().toLocaleString(),
            }
          : o.tracking;

        return {
          ...o,
          status: updates.status || (updates.trackingNumber ? 'shipped' : o.status),
          receiverName: updates.receiverName !== undefined ? updates.receiverName : o.receiverName,
          receiverPhone: updates.receiverPhone !== undefined ? updates.receiverPhone : o.receiverPhone,
          shippingAddress: updates.shippingAddress !== undefined ? updates.shippingAddress : o.shippingAddress,
          shippingDetailAddress: updates.shippingDetailAddress !== undefined ? updates.shippingDetailAddress : o.shippingDetailAddress,
          shippingMemo: updates.shippingMemo !== undefined ? updates.shippingMemo : o.shippingMemo,
          tracking: newTracking,
        };
      })
    );

    const { error } = await updateOrderDeliveryInfoInSupabase(orderId, updates);
    if (error) {
      showToast(`배송 정보 수정 (Supabase: ${error})`, 'info');
    } else {
      showToast('배송 및 송장 정보가 Supabase DB에 저장/수정되었습니다.', 'success');
    }
  };

  const syncDeliveriesToSupabase = async () => {
    setIsLoadingOrders(true);
    try {
      const { count, error } = await syncDeliveriesFromOrdersToSupabase(orders);
      if (error) {
        showToast(`배송 데이터 동기화 실패: ${error}`, 'error');
      } else {
        showToast(`총 ${count}건의 배송/운송장 데이터가 Supabase deliveries 테이블에 저장되었습니다! 🎉`, 'success');
      }
    } catch (err: any) {
      showToast(`동기화 오류: ${err.message}`, 'error');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const deleteOrder = async (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    const { error } = await deleteOrderFromSupabase(id);
    if (error) {
      showToast(`주문 삭제 (Supabase: ${error})`, 'info');
    } else {
      showToast('주문 데이터가 Supabase DB에서 삭제되었습니다.', 'info');
    }
  };

  const syncAllOrdersToSupabase = async () => {
    setIsLoadingOrders(true);
    try {
      const { count, error } = await syncInitialOrdersToSupabase(orders);
      if (error) {
        showToast(`주문 동기화 실패: ${error}`, 'error');
        return { success: false, count: 0, error };
      }
      showToast(`총 ${count}건의 주문/발주 데이터가 Supabase DB에 저장되었습니다! 🎉`, 'success');
      await refreshOrders();
      return { success: true, count };
    } catch (err: any) {
      showToast(`동기화 오류: ${err.message}`, 'error');
      return { success: false, count: 0, error: err.message };
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Tax Invoices
  const requestTaxInvoice = async (
    orderId: string,
    info: Omit<TaxInvoice, 'id' | 'orderId' | 'status' | 'createdAt'>
  ): Promise<TaxInvoice | null> => {
    const matchedOrder = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    let calculated = {
      items: info.items || [],
      supplyAmount: info.supplyAmount || Math.floor(info.amount / 1.1),
      vatAmount: info.vatAmount || (info.amount - Math.floor(info.amount / 1.1)),
      totalAmount: info.amount,
    };

    if (matchedOrder) {
      calculated = calculateTaxInvoiceItemsFromOrder(matchedOrder);
    }

    const newInvoice: TaxInvoice = {
      ...info,
      id: 'tax-' + Date.now(),
      orderId: matchedOrder ? matchedOrder.id : orderId,
      orderNumber: matchedOrder ? matchedOrder.orderNumber : (info.orderNumber || orderId),
      items: calculated.items,
      supplyAmount: calculated.supplyAmount,
      vatAmount: calculated.vatAmount,
      amount: calculated.totalAmount,
      status: 'requested',
      createdAt: new Date().toLocaleString(),
    };

    setTaxInvoices((prev) => [newInvoice, ...prev]);

    const { error } = await insertTaxInvoiceToSupabase(newInvoice);
    if (error) {
      showToast(`세금명세서 신청 (Supabase: ${error})`, 'info');
    } else {
      showToast('세금명세서/계산서가 Supabase DB에 실시간 저장되었습니다.', 'success');
    }
    return newInvoice;
  };

  const updateTaxInvoiceStatus = async (id: string, status: TaxInvoice['status']) => {
    const issuedAt = status === 'issued' ? new Date().toLocaleString() : undefined;
    setTaxInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status, issuedAt: issuedAt || inv.issuedAt } : inv))
    );
    const { error } = await updateTaxInvoiceStatusInSupabase(id, status, issuedAt);
    if (error) {
      showToast(`세금명세서 상태 변경 (Supabase: ${error})`, 'info');
    } else {
      showToast(
        `세금명세서가 [${status === 'issued' ? '발행완료' : status === 'rejected' ? '반려됨' : '승인대기'}]로 Supabase DB에 업데이트되었습니다.`,
        'success'
      );
    }
  };

  const syncAllTaxInvoicesToSupabase = async () => {
    setIsLoadingTaxInvoices(true);
    try {
      const { count, error } = await syncInitialTaxInvoicesToSupabase(taxInvoices);
      if (error) {
        showToast(`세금명세서 동기화 실패: ${error}`, 'error');
        return { success: false, count: 0, error };
      }
      showToast(`총 ${count}건의 세금명세서 데이터가 Supabase DB에 저장되었습니다! 🎉`, 'success');
      await refreshTaxInvoices();
      return { success: true, count };
    } catch (err: any) {
      showToast(`동기화 오류: ${err.message}`, 'error');
      return { success: false, count: 0, error: err.message };
    } finally {
      setIsLoadingTaxInvoices(false);
    }
  };

  // Reviews (Supabase 실시간 연동)
  const addReview = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>) => {
    const isPhoto = Boolean(reviewData.photoUrls && reviewData.photoUrls.length > 0);
    const bonus = isPhoto ? 1500 : 500;
    const newReview: Review = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      helpfulCount: 0,
      createdAt: new Date().toLocaleDateString(),
    };
    setReviews((prev) => [newReview, ...prev]);
    addPoints(bonus, `${newReview.productName} ${isPhoto ? '포토' : '텍스트'} 후기 작성 보너스`, 'REVIEW_BONUS');
    showToast(`리뷰가 등록되었습니다! ${bonus.toLocaleString()}P가 적립되었습니다.`, 'success');

    const { error } = await insertReviewToSupabase(newReview);
    if (error) {
      console.warn('Supabase insertReview warning:', error);
    }
  };

  const deleteReview = async (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    showToast('작성하신 리뷰가 삭제되었습니다.', 'info');
    const { error } = await deleteReviewFromSupabase(id);
    if (error) {
      console.warn('Supabase deleteReview warning:', error);
    }
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

  // Shipping Addresses (배송지 관리 - Supabase 실시간 연동)
  const addShippingAddress = async (
    addrData: Omit<ShippingAddress, 'id' | 'userId'>
  ): Promise<ShippingAddress | null> => {
    if (!user) {
      showToast('로그인이 필요합니다.', 'error');
      return null;
    }
    if (shippingAddresses.length >= 5) {
      showToast('배송지는 최대 5개까지 등록할 수 있습니다.', 'error');
      return null;
    }

    const isFirst = shippingAddresses.length === 0;
    const shouldDefault = addrData.isDefault || isFirst;

    const newAddr: ShippingAddress = {
      ...addrData,
      id: 'addr-' + Date.now(),
      userId: user.id,
      isDefault: shouldDefault,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setShippingAddresses((prev) => {
      const updated = shouldDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
      return [newAddr, ...updated];
    });
    showToast(`새 배송지 [${newAddr.recipientName}]가 등록되었습니다.`, 'success');

    const { error } = await upsertShippingAddressToSupabase(newAddr);
    if (error) {
      console.warn('Supabase upsertShippingAddress warning:', error);
    }
    return newAddr;
  };

  const updateShippingAddress = async (addr: ShippingAddress) => {
    setShippingAddresses((prev) => {
      const updated = addr.isDefault
        ? prev.map((a) => (a.id === addr.id ? addr : { ...a, isDefault: false }))
        : prev.map((a) => (a.id === addr.id ? addr : a));
      return updated;
    });
    showToast(`배송지 [${addr.recipientName}] 정보가 수정되었습니다.`, 'success');

    const { error } = await upsertShippingAddressToSupabase(addr);
    if (error) {
      console.warn('Supabase upsertShippingAddress warning:', error);
    }
  };

  const deleteShippingAddress = async (id: string) => {
    setShippingAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast('배송지가 삭제되었습니다.', 'info');

    const { error } = await deleteShippingAddressFromSupabase(id);
    if (error) {
      console.warn('Supabase deleteShippingAddress warning:', error);
    }
  };

  const setDefaultShippingAddress = async (id: string) => {
    if (!user) return;
    setShippingAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
    showToast('기본 배송지로 설정되었습니다.', 'success');

    const { error } = await setDefaultShippingAddressInSupabase(user.id, id);
    if (error) {
      console.warn('Supabase setDefaultShippingAddress warning:', error);
    }
  };

  // Subscriptions (화장품 정기배송/구독 관리 - Supabase 실시간 연동)
  const addSubscription = async (
    subData: Omit<SubscriptionItem, 'id' | 'userId'>
  ): Promise<SubscriptionItem | null> => {
    if (!user) {
      showToast('로그인이 필요합니다.', 'error');
      return null;
    }

    const newSub: SubscriptionItem = {
      ...subData,
      id: 'sub-' + Date.now(),
      userId: user.id,
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setSubscriptions((prev) => [newSub, ...prev]);
    showToast(`[${newSub.productName}] 정기배송 구독이 신청되었습니다!`, 'success');

    const { error } = await upsertSubscriptionToSupabase(newSub);
    if (error) {
      console.warn('Supabase upsertSubscription warning:', error);
    }
    return newSub;
  };

  const updateSubscriptionStatus = async (
    id: string,
    status: 'active' | 'paused' | 'cancelled'
  ) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    const label = status === 'active' ? '재개' : status === 'paused' ? '일시정지' : '해지';
    showToast(`정기배송이 [${label}] 처리되었습니다.`, 'info');

    const { error } = await updateSubscriptionStatusInSupabase(id, status);
    if (error) {
      console.warn('Supabase updateSubscriptionStatus warning:', error);
    }
  };

  const updateSubscriptionInterval = async (
    id: string,
    intervalMonths: number,
    nextDate: string
  ) => {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, intervalMonths, nextDeliveryDate: nextDate } : s
      )
    );
    showToast(`배송 주기가 [${intervalMonths}개월]로 변경되었습니다. (다음 배송: ${nextDate})`, 'success');

    const { error } = await updateSubscriptionIntervalInSupabase(id, intervalMonths, nextDate);
    if (error) {
      console.warn('Supabase updateSubscriptionInterval warning:', error);
    }
  };

  // Coupons
  const applyCoupon = (couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === couponId ? { ...c, isUsed: true } : c))
    );
  };

  const registerOfflineCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      showToast('로그인 후 쿠폰을 등록해주세요.', 'error');
      return { success: false, message: '로그인이 필요합니다.' };
    }
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      showToast('쿠폰 코드를 입력해주세요.', 'error');
      return { success: false, message: '쿠폰 코드를 입력해주세요.' };
    }

    const alreadyHas = coupons.some((c) => c.code === trimmed && !c.isUsed);
    if (alreadyHas) {
      showToast('이미 등록되어 있는 쿠폰입니다.', 'error');
      return { success: false, message: '이미 보유 중인 쿠폰입니다.' };
    }

    const { coupon, error } = await registerCouponToSupabase(user.id, trimmed);
    if (error || !coupon) {
      showToast(error || '유효하지 않은 쿠폰 코드입니다.', 'error');
      return { success: false, message: error || '유효하지 않은 쿠폰입니다.' };
    }

    setCoupons((prev) => [coupon, ...prev]);
    showToast(`쿠폰 [${coupon.name}]이(가) 등록되었습니다! 🎉`, 'success');
    return { success: true, message: '쿠폰이 성공적으로 등록되었습니다.' };
  };

  // Raw Materials
  const updateMaterialStock = async (id: string, amountChange: number) => {
    let targetMat: RawMaterial | undefined;
    setRawMaterials((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newStock = Math.max(0, m.currentStock + amountChange);
          targetMat = {
            ...m,
            currentStock: newStock,
            updatedAt: new Date().toISOString().slice(0, 10),
          };
          return targetMat;
        }
        return m;
      })
    );

    if (targetMat) {
      const { error } = await updateRawMaterialStockInSupabase(id, targetMat.currentStock);
      if (error) {
        showToast(`자재 재고 변경 (Supabase: ${error})`, 'info');
      } else {
        showToast(`[${targetMat.name}] 재고 수량이 Supabase DB에 업데이트되었습니다.`, 'success');
      }
    }
  };

  const addRawMaterial = async (material: Omit<RawMaterial, 'id' | 'updatedAt'>) => {
    const newMat: RawMaterial = {
      ...material,
      id: 'mat-' + Date.now(),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setRawMaterials((prev) => [newMat, ...prev]);

    const { error } = await insertRawMaterialToSupabase(newMat);
    if (error) {
      showToast(`원부자재 등록 (Supabase: ${error})`, 'info');
    } else {
      showToast(`신규 자재 [${newMat.name}]가 Supabase raw_materials 테이블에 저장되었습니다!`, 'success');
    }
  };

  const syncAllMaterialsToSupabase = async () => {
    setIsLoadingMaterials(true);
    try {
      const { count, error } = await syncInitialRawMaterialsToSupabase(rawMaterials);
      if (error) {
        showToast(`원부자재 동기화 실패: ${error}`, 'error');
        return { success: false, count: 0, error };
      }
      showToast(`총 ${count}건의 원부자재 데이터가 Supabase DB에 저장되었습니다! 🎉`, 'success');
      await refreshRawMaterials();
      return { success: true, count };
    } catch (err: any) {
      showToast(`동기화 오류: ${err.message}`, 'error');
      return { success: false, count: 0, error: err.message };
    } finally {
      setIsLoadingMaterials(false);
    }
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
        botResponse = '고객님의 피부 고민을 해결해 줄 피우다(Piuda) 베스트 시카 진정 라인과 수분 크림을 추천드립니다! 🌿';
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
        isMounted,
        user,
        login,
        signUp,
        signIn,
        adminLogin,
        adminCompleteMfaLogin,
        adminSendSmsCode,
        adminVerifySmsCode,
        adminLoginLogs,
        isLoadingAdminLogs,
        refreshAdminLoginLogs,
        adminAccounts,
        isLoadingAdminAccounts,
        refreshAdminAccounts,
        createAdminAccount,
        updateAdminAccount,
        toggleAdminStatus,
        changeSuperAdminPassword,
        hasAdminMenuPermission,
        assignMemberAsSubAdmin,
        revokeSubAdmin,
        registerGuest,
        signInGuest,
        logout,
        updateUserProfile,
        updateUserSkinType,
        updateSkinProfile,
        addPoints,
        usePoints,
        pointLogs,
        products,
        isLoadingProducts,
        refreshProducts,
        syncAllProductsToSupabase,
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
        clearWishlist,
        recentProducts,
        addRecentProduct,
        orders,
        isLoadingOrders,
        refreshOrders,
        syncAllOrdersToSupabase,
        createOrder,
        cancelOrder,
        requestRefund,
        requestReturn,
        updateOrderStatus,
        updateOrderTracking,
        updateOrderDeliveryInfo,
        syncDeliveriesToSupabase,
        deleteOrder,
        taxInvoices,
        isLoadingTaxInvoices,
        refreshTaxInvoices,
        requestTaxInvoice,
        updateTaxInvoiceStatus,
        syncAllTaxInvoicesToSupabase,
        reviews,
        addReview,
        deleteReview,
        boardPosts,
        addBoardPost,
        answerBoardPost,
        reservations,
        createReservation,
        updateReservationStatus,
        shippingAddresses,
        refreshShippingAddresses,
        addShippingAddress,
        updateShippingAddress,
        deleteShippingAddress,
        setDefaultShippingAddress,
        subscriptions,
        refreshSubscriptions,
        addSubscription,
        updateSubscriptionStatus,
        updateSubscriptionInterval,
        coupons,
        applyCoupon,
        registerOfflineCoupon,
        rawMaterials,
        isLoadingMaterials,
        refreshRawMaterials,
        updateMaterialStock,
        addRawMaterial,
        syncAllMaterialsToSupabase,
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
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        setAuthModalTab,
        isSupabaseModalOpen,
        openSupabaseModal,
        closeSupabaseModal,
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
