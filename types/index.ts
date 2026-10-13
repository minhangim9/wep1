export type SkinType = '건성' | '지성' | '복합성' | '민감성' | '중성' | '약건성';
export type UserRole = 'customer' | 'admin' | 'manager';
export type MembershipTier = 'WELCOME' | 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  tier: MembershipTier;
  skinType?: SkinType;
  skinConcerns?: string[];
  points: number;
  marketingAgreed: boolean;
  address?: string;
  detailAddress?: string;
  zipcode?: string;
  lastLoginAt?: string;
  adminRole?: 'super_admin' | 'sub_admin';
  adminStatus?: 'active' | 'suspended';
  permissions?: string[];
  isGuest?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  level: 1 | 2 | 3;
  parentId?: string;
  children?: Category[];
}

export interface ProductOption {
  id: string;
  name: string;
  additionalPrice: number;
  stockQuantity: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  summary: string;
  description: string;
  price: number;
  originalPrice: number;
  costPrice: number;
  isOnePlusOne: boolean; // 1+1 이벤트 상품 여부
  isBest: boolean;
  isNew: boolean;
  isSpecialDeal?: boolean;
  specialDealEndTime?: string; // 타임특가 마감 시간
  status: 'on_sale' | 'sold_out' | 'hidden';
  safetyStock: number;
  rating: number;
  reviewCount: number;
  mainImage: string;
  detailImages: string[];
  options: ProductOption[];
  ingredients: string; // 전성분
  volume: string; // 용량
  skinTypeRecommendation: SkinType[]; // 추천 피부타입
  functions: string[]; // 기능성 (미백, 주름개선, 자외선차단 등)
  createdAt: string;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedOption?: ProductOption;
  quantity: number;
  selected: boolean;
  isGiftOnePlusOne?: boolean; // 1+1으로 증정되는 아이템 여부
}

export type OrderStatus =
  | 'pending_payment'   // 입금대기
  | 'paid'              // 결제완료
  | 'preparing'         // 배송준비중
  | 'shipped'           // 배송중
  | 'delivered'         // 배송완료
  | 'cancelled'         // 주문취소
  | 'refund_requested'  // 환불신청
  | 'refunded'          // 환불완료
  | 'return_requested'  // 반품신청
  | 'returned';         // 반품완료

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  optionName?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  isOnePlusOneBonus?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  totalAmount: number;
  discountCouponAmount: number;
  usedPoints: number;
  shippingFee: number;
  finalPaymentAmount: number;
  status: OrderStatus;
  receiverName: string;
  receiverPhone: string;
  shippingZipcode: string;
  shippingAddress: string;
  shippingDetailAddress: string;
  shippingMemo?: string;
  paymentMethod: 'card' | 'kakaopay' | 'naverpay' | 'tosspay' | 'transfer' | 'vbank';
  paymentKey?: string;
  paymentDetails?: {
    cardName?: string;
    cardNumber?: string;
    approveNo?: string;
    installmentMonths?: number;
    easyPayProvider?: string;
    vbankName?: string;
    vbankAccount?: string;
    vbankDueDate?: string;
    receiptUrl?: string;
    approvedAt?: string;
    requestedAt?: string;
    rawResponse?: any;
  };
  tracking?: {
    carrier: string;
    carrierCode: string;
    trackingNumber: string;
    shippedAt?: string;
  };
  taxInvoiceRequested?: boolean;
  taxInvoiceInfo?: {
    type: 'cash_receipt' | 'tax_invoice';
    number: string;
    companyName?: string;
  };
  createdAt: string;
  cancelReason?: string;
  refundReason?: string;
  cancelAmount?: number;
  cancelledAt?: string;
}

export interface DeliveryRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  carrier: string;
  carrierCode?: string;
  trackingNumber: string;
  status: 'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'returned';
  receiverName: string;
  receiverPhone: string;
  shippingZipcode?: string;
  shippingAddress: string;
  shippingDetailAddress?: string;
  shippingMemo?: string;
  itemsSummary?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  userSkinType?: SkinType;
  rating: number; // 1 ~ 5
  content: string;
  texture?: '촉촉해요' | '보통이에요' | '매트해요'; // 화장품 특화 발림성 평가
  photoUrls?: string[];
  isBest?: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface ShippingAddress {
  id: string;
  userId: string;
  recipientName: string;
  phone: string;
  zipcode: string;
  address: string;
  detailAddress?: string;
  isDefault: boolean;
  deliveryMemo?: string;
  createdAt?: string;
}

export interface SubscriptionItem {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string;
  intervalMonths: number; // 1개월, 2개월, 3개월 주기
  nextDeliveryDate: string; // YYYY-MM-DD
  shippingAddress: string;
  shippingRecipient: string;
  shippingPhone: string;
  status: 'active' | 'paused' | 'cancelled'; // 활성, 일시정지, 해지
  discountRate: number; // 정기구독 혜택 할인율 (예: 15%)
  pricePerDelivery: number; // 회차당 결제금액
  createdAt?: string;
}

export interface BoardPost {
  id: string;
  type: 'notice' | 'free' | 'qna';
  productId?: string;
  productName?: string;
  userId: string;
  authorName: string;
  title: string;
  content: string;
  isSecret?: boolean;
  answer?: string;
  answeredAt?: string;
  views: number;
  createdAt: string;
}

export interface Reservation {
  id: string;
  userId: string;
  applicantName: string;
  phone: string;
  serviceType: '1:1 맞춤 스킨케어 진단' | '퍼스널 컬러 & 메이크업 클래스' | '비건 뷰티 팝업 쇼룸 방문';
  reservationDate: string;
  reservationTime: string;
  skinConcerns: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  adminNotes?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number; // 3000원 or 15%
  minOrderAmount: number;
  expiresAt: string;
  isUsed: boolean;
}

export interface PointLog {
  id: string;
  userId: string;
  amount: number;
  balanceAfter: number;
  type: 'SIGNUP_BONUS' | 'ORDER_PAYMENT' | 'ORDER_EARN' | 'REVIEW_BONUS' | 'ADMIN_ADJUST' | 'CANCEL_REFUND';
  reason: string;
  createdAt: string;
}

export interface TaxInvoiceItem {
  name: string; // 품목
  spec?: string; // 규격
  quantity: number; // 수량
  unitPrice: number; // 단가
  supplyAmount: number; // 공급가액
  vatAmount: number; // 세액
  remarks?: string; // 비고
}

export interface TaxInvoice {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userName: string;
  type: 'cash_receipt' | 'tax_invoice';
  taxNumber: string;
  companyName?: string;
  representativeName?: string;
  email?: string;
  address?: string;
  businessType?: string;
  businessCategory?: string;
  supplyAmount?: number;
  vatAmount?: number;
  amount: number;
  status: 'requested' | 'issued' | 'rejected';
  items?: TaxInvoiceItem[];
  issuedAt?: string;
  pdfUrl?: string;
  remarks?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  type: '용기(Bottle)' | '펌프/캡(Cap)' | '단상자(Box)' | '라벨(Label)' | '원료(Formula)' | '완충재(Pack)';
  currentStock: number;
  safetyStock: number;
  unitCost: number;
  supplier: string;
  updatedAt: string;
}

export interface PopupEvent {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  quickReplies?: string[];
  productRecommendations?: Product[];
}

export interface AdminLoginLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failed';
  failureReason?: string;
  loginAt: string;
}

export type AdminRoleType = 'super_admin' | 'sub_admin';
export type AdminAccountStatus = 'active' | 'suspended';

export type AdminMenuKey =
  | 'dashboard'
  | 'members'
  | 'products'
  | 'orders'
  | 'delivery'
  | 'inventory'
  | 'tax'
  | 'popups'
  | 'admins';

export interface AdminAccount {
  id: string;
  email: string;
  password?: string;
  passwordHash?: string;
  passwordSalt?: string;
  name: string;
  phone: string;
  role: AdminRoleType;
  status: AdminAccountStatus;
  permissions: AdminMenuKey[];
  memo?: string;
  mfaEnabled?: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminMenuMeta {
  key: AdminMenuKey;
  label: string;
  href: string;
  description: string;
  requiredRole?: AdminRoleType;
}

export interface GuestMember {
  id: string;
  name: string;
  phone: string;
  email?: string;
  orderPassword?: string;
  address?: string;
  detailAddress?: string;
  zipcode?: string;
  marketingAgreed?: boolean;
  createdAt: string;
}


