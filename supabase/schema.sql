-- ========================================================================
-- DASSEOBA (다써바) 화장품 쇼핑몰 Supabase PostgreSQL DDL 스키마
-- ========================================================================

-- 1. 회원 프로필 (auth.users 확장)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'manager')),
    tier VARCHAR(20) DEFAULT 'WELCOME' CHECK (tier IN ('WELCOME', 'BRONZE', 'SILVER', 'GOLD', 'VIP')),
    skin_type VARCHAR(50), -- 민감성, 건성, 지성, 복합성, 중성 등
    points INT DEFAULT 3000,
    marketing_agreed BOOLEAN DEFAULT false,
    address TEXT,
    detail_address TEXT,
    zipcode VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 계층형 카테고리 (대분류, 중분류, 소분류)
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    level INT NOT NULL DEFAULT 1,
    parent_id VARCHAR(50) REFERENCES categories(id) ON DELETE CASCADE,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- 3. 상품 테이블
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) DEFAULT '다써바 (DASSEOBA)',
    category_id VARCHAR(50) REFERENCES categories(id),
    category_name VARCHAR(150),
    summary VARCHAR(500),
    description TEXT,
    price INT NOT NULL,
    original_price INT,
    cost_price INT,
    is_one_plus_one BOOLEAN DEFAULT false, -- 1+1 행사 여부
    is_best BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT true,
    is_special_deal BOOLEAN DEFAULT false,
    special_deal_end_time TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'on_sale' CHECK (status IN ('on_sale', 'sold_out', 'hidden')),
    safety_stock INT DEFAULT 10,
    rating NUMERIC(2, 1) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    main_image TEXT NOT NULL,
    detail_images TEXT[],
    ingredients TEXT,
    volume VARCHAR(50),
    skin_type_recommendation TEXT[],
    functions TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 상품 옵션 및 재고
CREATE TABLE IF NOT EXISTS product_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    additional_price INT DEFAULT 0,
    stock_quantity INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- 5. 주문 및 결제
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(100) NOT NULL,
    total_amount INT NOT NULL,
    discount_coupon_amount INT DEFAULT 0,
    used_points INT DEFAULT 0,
    shipping_fee INT DEFAULT 3000,
    final_payment_amount INT NOT NULL,
    status VARCHAR(30) DEFAULT 'paid' CHECK (
        status IN ('pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refund_requested', 'refunded', 'return_requested', 'returned')
    ),
    receiver_name VARCHAR(100) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    shipping_zipcode VARCHAR(10) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_detail_address TEXT,
    shipping_memo TEXT,
    payment_method VARCHAR(50) NOT NULL,
    payment_details JSONB,
    tracking JSONB,
    tax_invoice_requested BOOLEAN DEFAULT false,
    tax_invoice_info JSONB,
    cancel_reason TEXT,
    refund_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT,
    option_name VARCHAR(100),
    unit_price INT NOT NULL,
    quantity INT NOT NULL,
    total_price INT NOT NULL,
    is_one_plus_one_bonus BOOLEAN DEFAULT false
);

-- 6. 원부자재 관리 (용기, 캡, 단상자, 원료)
CREATE TABLE IF NOT EXISTS raw_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    safety_stock INT NOT NULL DEFAULT 100,
    unit_cost INT DEFAULT 0,
    supplier VARCHAR(100),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. 전자세금계산서 / 현금영수증
CREATE TABLE IF NOT EXISTS tax_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    order_number VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES profiles(id),
    user_name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('cash_receipt', 'tax_invoice')),
    tax_number VARCHAR(50) NOT NULL,
    company_name VARCHAR(100),
    representative_name VARCHAR(100),
    email VARCHAR(255),
    amount INT NOT NULL,
    status VARCHAR(20) DEFAULT 'requested' CHECK (status IN ('requested', 'issued', 'rejected')),
    issued_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. 리뷰, 게시판, 예약, 쿠폰, 포인트
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    user_name VARCHAR(100) NOT NULL,
    user_skin_type VARCHAR(50),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content TEXT NOT NULL,
    photo_urls TEXT[],
    is_best BOOLEAN DEFAULT false,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS board_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(30) NOT NULL CHECK (type IN ('notice', 'free', 'qna')),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_secret BOOLEAN DEFAULT false,
    answer TEXT,
    answered_at TIMESTAMPTZ,
    views INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    applicant_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time VARCHAR(20) NOT NULL,
    skin_concerns TEXT,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    discount_type VARCHAR(20) NOT NULL,
    discount_value INT NOT NULL,
    min_order_amount INT DEFAULT 0,
    expires_at DATE NOT NULL,
    is_used BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS point_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    balance_after INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS popups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- ========================================================================
-- RLS (Row Level Security) 설정
-- ========================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Users read their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users read their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
