-- =========================================================================
-- 아빠사랑 피우다(Piuda) 쇼핑몰 데이터베이스 스키마 (Supabase)
-- 프로젝트 URL: https://psblczhzozsuicstbefl.supabase.co
-- 1) members: 회원가입 및 사용자 정보
-- 2) products: 상품 등록 및 관리 (첨부 이미지 8개 상품 포함)
-- =========================================================================

-- ==========================================
-- 1. members (회원 정보) 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    skin_type TEXT DEFAULT '민감성',
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'manager')),
    tier TEXT DEFAULT 'WELCOME' CHECK (tier IN ('WELCOME', 'BRONZE', 'SILVER', 'GOLD', 'VIP')),
    points INTEGER DEFAULT 3000,
    marketing_agreed BOOLEAN DEFAULT true,
    address TEXT DEFAULT '',
    detail_address TEXT DEFAULT '',
    zipcode TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_members_email ON public.members (email);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON public.members (created_at DESC);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on members" ON public.members;
CREATE POLICY "Allow public read on members" ON public.members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on members" ON public.members;
CREATE POLICY "Allow public insert on members" ON public.members FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on members" ON public.members;
CREATE POLICY "Allow public update on members" ON public.members FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on members" ON public.members;
CREATE POLICY "Allow public delete on members" ON public.members FOR DELETE USING (true);

-- ==========================================
-- 2. products (상품 등록 및 관리) 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT DEFAULT '피우다 (Piuda)',
    category_id TEXT DEFAULT 'cat-skincare',
    category_name TEXT NOT NULL,
    summary TEXT DEFAULT '',
    description TEXT DEFAULT '',
    price INTEGER NOT NULL,
    original_price INTEGER NOT NULL,
    cost_price INTEGER DEFAULT 0,
    is_one_plus_one BOOLEAN DEFAULT false,
    is_best BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    is_special_deal BOOLEAN DEFAULT false,
    special_deal_end_time TEXT,
    status TEXT DEFAULT 'on_sale' CHECK (status IN ('on_sale', 'sold_out', 'hidden')),
    safety_stock INTEGER DEFAULT 10,
    rating NUMERIC DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    main_image TEXT NOT NULL,
    detail_images JSONB DEFAULT '[]'::jsonb,
    options JSONB DEFAULT '[]'::jsonb,
    ingredients TEXT DEFAULT '',
    volume TEXT DEFAULT '',
    skin_type_recommendation JSONB DEFAULT '[]'::jsonb,
    functions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on products" ON public.products;
CREATE POLICY "Allow public read on products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on products" ON public.products;
CREATE POLICY "Allow public insert on products" ON public.products FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on products" ON public.products;
CREATE POLICY "Allow public update on products" ON public.products FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on products" ON public.products;
CREATE POLICY "Allow public delete on products" ON public.products FOR DELETE USING (true);

-- ==========================================
-- 3. 이미지 상품 데이터 초기 삽입 (8개 전품목)
-- ==========================================
INSERT INTO public.products (
    id, name, brand, category_id, category_name, summary, description,
    price, original_price, cost_price, is_one_plus_one, is_best, is_new,
    status, safety_stock, rating, review_count, main_image, options, ingredients, volume
) VALUES
(
    'prod-001',
    '[1+1 특별기획] 피우다(Piuda) 센텔라 시카 카밍 진정 앰플 50ml',
    '피우다 (Piuda)',
    'cat-skincare',
    '스킨케어 > 앰플/세럼',
    '연꽃 PDRN과 고농축 병풀추출물로 민감해진 피부를 빠르게 진정시키는 1+1 기획 앰플',
    '<p>자극받은 피부를 즉각적으로 진정시키고 수분을 채워주는 시카 카밍 진정 앰플입니다. 1개 구매 시 본품 1개가 추가 증정됩니다.</p>',
    28000, 56000, 9000, true, true, true,
    'on_sale', 20, 4.9, 382,
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    '[{"id":"opt-001-1","name":"본품 50ml + 50ml (1+1)","additionalPrice":0,"stockQuantity":205}]'::jsonb,
    '병풀추출물 85%, 연꽃 PDRN, 히알루론산, 판테놀, 마데카소사이드',
    '50ml * 2ea'
),
(
    'prod-002',
    '[BEST 1위] 피우다(Piuda) 하이드라 글래스 글로우 수분 크림 80ml',
    '피우다 (Piuda)',
    'cat-skincare',
    '스킨케어 > 크림/로션',
    '바르는 순간 유리알처럼 빛나는 72시간 지속 물광 수분막 형성',
    '<p>건조하고 푸석한 피부에 10중 복합 수분 베리어를 형성하여 하루 종일 촉촉함을 지켜줍니다.</p>',
    32000, 42000, 11000, false, true, false,
    'on_sale', 20, 4.8, 512,
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    '[{"id":"opt-002-1","name":"단품 80ml","additionalPrice":0,"stockQuantity":155}]'::jsonb,
    '빙하수, 히알루론산, 세라마이드NP, 스쿠알란, 나이아신아마이드',
    '80ml'
),
(
    'prod-003',
    '[1+1 더블] 피우다(Piuda) 에어핏 비건 톤업 워터리 선크림 SPF50+ PA++++',
    '피우다 (Piuda)',
    'cat-suncare',
    '선케어 > 선크림',
    '백탁 없이 생기 충전 핑크빛 톤업, 자외선 99.9% 완벽 차단',
    '<p>눈시림 없는 순한 유기/무기 혼합자차로 피부를 화사하고 투명하게 보정합니다.</p>',
    24000, 48000, 7500, true, true, false,
    'on_sale', 25, 4.9, 420,
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
    '[{"id":"opt-003-1","name":"톤업 핑크 50ml + 50ml (1+1)","additionalPrice":0,"stockQuantity":260}]'::jsonb,
    '징크옥사이드, 다이아이소스테아릴말레이트, 나이아신아마이드, 병풀추출물',
    '50ml * 2ea'
),
(
    'prod-004',
    '피우다(Piuda) 벨벳 세미매트 쿠션 파운데이션 SPF45 (본품+리필)',
    '피우다 (Piuda)',
    'cat-makeup',
    '메이크업 > 베이스',
    '모공과 요철을 지우개처럼 매끈하게 커버하는 초밀착 롱래스팅 쿠션',
    '<p>가벼운 에어 파우더가 피부 굴곡을 완벽 밀착 커버하여 결점 없는 도자기 피부를 연출합니다.</p>',
    34000, 45000, 12000, false, true, true,
    'on_sale', 10, 4.7, 189,
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    '[{"id":"opt-004-1","name":"21호 라이트 바닐라","additionalPrice":0,"stockQuantity":200}]'::jsonb,
    '정제수, 사이클로펜타실록세인, 티타늄디옥사이드, 나이아신아마이드',
    '본품 15g + 리필 15g'
),
(
    'prod-005',
    '[1+1 기획] 피우다(Piuda) 듀이 쥬시 워터 틴트 5colors (원하는 컬러 2종 선택)',
    '피우다 (Piuda)',
    'cat-makeup',
    '메이크업 > 립 메이크업',
    '과즙을 머금은 듯 촉촉 탱글한 유리알 광택 롱래스팅 틴트',
    '<p>입술에 닿는 순간 촉촉한 수분 캡슐이 터져 오래도록 선명하고 생기 있는 립을 완성합니다.</p>',
    19800, 36000, 5000, true, false, true,
    'on_sale', 30, 4.8, 96,
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
    '[{"id":"opt-005-1","name":"01 애플레드 + 02 피치코랄","additionalPrice":0,"stockQuantity":185}]'::jsonb,
    '다이페닐다이메티콘, 정제수, 옥틸도데칸올, 식물성 오일',
    '4.5g * 2ea'
),
(
    'prod-006',
    '피우다(Piuda) 약산성 마이크로 바이옴 딥 클렌징 폼 150ml (초미세먼지 세정)',
    '피우다 (Piuda)',
    'cat-cleansing',
    '클렌징/필링 > 클렌징폼',
    '당김 없이 촉촉하고 부드러운 pH 5.5 약산성 버블 딥클렌저',
    '<p>조밀하고 쫀쫀한 미세 거품이 모공 속 노폐물과 초미세먼지를 98.8% 깔끔하게 세정합니다.</p>',
    18000, 22000, 5500, false, false, false,
    'on_sale', 20, 4.9, 230,
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    '[{"id":"opt-006-1","name":"본품 150ml","additionalPrice":0,"stockQuantity":185}]'::jsonb,
    '글리세린, 소듐코코일글라이시네이트, 락토바실러스발효물, 히알루론산',
    '150ml'
),
(
    'prod-007',
    '피우다(Piuda) 비건 로즈마리 리프레싱 두피 스케일러 & 샴푸 500ml',
    '피우다 (Piuda)',
    'cat-bodyhair',
    '바디/헤어 > 샴푸',
    '시원한 쿨링감으로 두피 열감을 내리고 모근을 탄탄하게 케어하는 무실리콘 샴푸',
    '<p>자연 유래 계면활성제와 로즈마리 잎 오일로 두피 유수분 밸런스를 맞춰줍니다.</p>',
    26000, 32000, 8000, false, false, true,
    'on_sale', 15, 4.8, 78,
    'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
    '[{"id":"opt-007-1","name":"본품 500ml","additionalPrice":0,"stockQuantity":80}]'::jsonb,
    '로즈마리잎오일, 티트리잎수, 멘톨, 판테놀, 살리실릭애씨드, 비오틴',
    '500ml'
),
(
    'prod-008',
    '피우다(Piuda) 옴므 올인원 수분 젤 플루이드 200ml (미백/주름 2중기능성)',
    '피우다 (Piuda)',
    'cat-men',
    '남성 옴므 > 올인원',
    '스킨+로션+에센스를 한 번에! 번들거림 없이 산뜻한 남성 전용 올인원 케어',
    '<p>모공 수축과 진정, 풍부한 수분 공급까지 단 3초 만에 끝내는 완벽한 올인원.</p>',
    27000, 35000, 8500, false, true, false,
    'on_sale', 18, 4.9, 165,
    'https://images.unsplash.com/photo-1512290900672-1f4a984407ba?auto=format&fit=crop&w=800&q=80',
    '[{"id":"opt-008-1","name":"본품 200ml","additionalPrice":0,"stockQuantity":110}]'::jsonb,
    '정제수, 나이아신아마이드, 아데노신, 병풀추출물, 티트리추출물, 히알루론산',
    '200ml'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    is_one_plus_one = EXCLUDED.is_one_plus_one,
    options = EXCLUDED.options;

-- ==========================================
-- 4. Supabase Storage 버킷 생성 (products)
-- ==========================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'products',
    'products',
    true,
    10485760, -- 10MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']::text[];

-- Storage 정책 (공개 읽기 및 이미지 업로드 허용)
DROP POLICY IF EXISTS "Allow public read on products storage" ON storage.objects;
CREATE POLICY "Allow public read on products storage" ON storage.objects
    FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow public insert on products storage" ON storage.objects;
CREATE POLICY "Allow public insert on products storage" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow public update on products storage" ON storage.objects;
CREATE POLICY "Allow public update on products storage" ON storage.objects
    FOR UPDATE USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow public delete on products storage" ON storage.objects;
CREATE POLICY "Allow public delete on products storage" ON storage.objects
    FOR DELETE USING (bucket_id = 'products');

-- ==========================================
-- 5. orders (주문 및 발주 관리) 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount INTEGER NOT NULL DEFAULT 0,
    discount_coupon_amount INTEGER NOT NULL DEFAULT 0,
    used_points INTEGER NOT NULL DEFAULT 0,
    shipping_fee INTEGER NOT NULL DEFAULT 0,
    final_payment_amount INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refund_requested', 'refunded', 'return_requested', 'returned')),
    receiver_name TEXT NOT NULL,
    receiver_phone TEXT NOT NULL,
    shipping_zipcode TEXT DEFAULT '',
    shipping_address TEXT NOT NULL,
    shipping_detail_address TEXT DEFAULT '',
    shipping_memo TEXT DEFAULT '',
    payment_method TEXT DEFAULT 'card',
    payment_key TEXT,
    payment_details JSONB DEFAULT '{}'::jsonb,
    tracking JSONB DEFAULT '{}'::jsonb,
    tax_invoice_requested BOOLEAN DEFAULT false,
    tax_invoice_info JSONB DEFAULT '{}'::jsonb,
    cancel_reason TEXT,
    refund_reason TEXT,
    cancel_amount INTEGER DEFAULT 0,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_key ON public.orders (payment_key);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on orders" ON public.orders;
CREATE POLICY "Allow public read on orders" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on orders" ON public.orders;
CREATE POLICY "Allow public insert on orders" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
CREATE POLICY "Allow public update on orders" ON public.orders FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on orders" ON public.orders;
CREATE POLICY "Allow public delete on orders" ON public.orders FOR DELETE USING (true);

-- ==========================================
-- 6. 초기 주문 및 발주 데이터 시드 (4건)
-- ==========================================
INSERT INTO public.orders (
    id, order_number, user_id, user_name, items,
    total_amount, discount_coupon_amount, used_points, shipping_fee, final_payment_amount,
    status, receiver_name, receiver_phone, shipping_zipcode, shipping_address, shipping_detail_address, shipping_memo,
    payment_method, payment_details, tracking, created_at
) VALUES
(
    'ord-001',
    'ORD-20261012-841920',
    'user-001',
    '홍길동',
    '[{"id":"ord-item-001","productId":"prod-001","productName":"[1+1 특별기획] 피우다(Piuda) 센텔라 시카 카밍 진정 앰플 50ml","productImage":"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80","optionName":"본품 50ml + 50ml (1+1)","unitPrice":28000,"quantity":1,"totalPrice":28000,"isOnePlusOneBonus":true},{"id":"ord-item-002","productId":"prod-006","productName":"피우다(Piuda) 약산성 마이크로 바이옴 딥 클렌징 폼 150ml","productImage":"https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80","optionName":"본품 150ml","unitPrice":18000,"quantity":1,"totalPrice":18000}]'::jsonb,
    46000, 0, 0, 0, 46000,
    'paid',
    '홍길동',
    '010-1234-5678',
    '06236',
    '서울특별시 강남구 테헤란로 152',
    '강남파이낸스센터 12층',
    '부재 시 문 앞에 놓아주세요.',
    'card',
    '{"cardName":"현대카드 (일시불)"}'::jsonb,
    '{}'::jsonb,
    '2026-10-12 10:35:20+09'
),
(
    'ord-002',
    'ORD-20261012-731940',
    'user-002',
    '이지은',
    '[{"id":"ord-item-003","productId":"prod-002","productName":"[BEST 1위] 피우다(Piuda) 하이드라 글래스 글로우 수분 크림 80ml","productImage":"https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80","optionName":"단품 80ml","unitPrice":32000,"quantity":1,"totalPrice":32000}]'::jsonb,
    32000, 0, 0, 0, 32000,
    'preparing',
    '이지은',
    '010-9876-5432',
    '13494',
    '경기도 성남시 분당구 판교역로 235',
    '에이치스퀘어 N동 8층',
    '배송 전 연락 부탁드립니다.',
    'kakaopay',
    '{}'::jsonb,
    '{}'::jsonb,
    '2026-10-12 09:12:45+09'
),
(
    'ord-003',
    'ORD-20261011-519283',
    'user-003',
    '박민수',
    '[{"id":"ord-item-004","productId":"prod-003","productName":"[1+1 더블] 피우다(Piuda) 에어핏 비건 톤업 워터리 선크림 SPF50+ PA++++","productImage":"https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80","optionName":"톤업 핑크 50ml + 50ml (1+1)","unitPrice":24000,"quantity":1,"totalPrice":24000,"isOnePlusOneBonus":true},{"id":"ord-item-005","productId":"prod-008","productName":"피우다(Piuda) 옴므 올인원 수분 젤 플루이드 200ml","productImage":"https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80","optionName":"본품 200ml","unitPrice":27000,"quantity":1,"totalPrice":27000}]'::jsonb,
    51000, 0, 0, 0, 51000,
    'shipped',
    '박민수',
    '010-3333-7777',
    '48119',
    '부산광역시 해운대구 마린시티2로 33',
    '해운대 두산위브더제니스 102동',
    '경비실에 맡겨주세요.',
    'naverpay',
    '{}'::jsonb,
    '{"carrier":"CJ대한통운","carrierCode":"04","trackingNumber":"6582-9102-3841","shippedAt":"2026-10-11 16:30:00"}'::jsonb,
    '2026-10-11 14:20:10+09'
),
(
    'ord-004',
    'ORD-20261010-394812',
    'user-004',
    '최유리',
    '[{"id":"ord-item-006","productId":"prod-004","productName":"피우다(Piuda) 벨벳 세미매트 쿠션 파운데이션 SPF45 (본품+리필)","productImage":"https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80","optionName":"21호 바닐라 아이보리","unitPrice":34000,"quantity":1,"totalPrice":34000}]'::jsonb,
    34000, 0, 0, 0, 34000,
    'delivered',
    '최유리',
    '010-4444-8888',
    '34126',
    '대전광역시 유성구 대덕대로 512',
    '사이언스빌리지 501호',
    '배송 완료 후 문자 주세요.',
    'tosspay',
    '{}'::jsonb,
    '{"carrier":"CJ대한통운","carrierCode":"04","trackingNumber":"6891-2049-1123","shippedAt":"2026-10-10 11:00:00"}'::jsonb,
    '2026-10-10 09:40:00+09'
)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    tracking = EXCLUDED.tracking;

-- ==========================================
-- 7. deliveries (배송 및 운송장 관리) 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS public.deliveries (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    order_number TEXT NOT NULL,
    carrier TEXT NOT NULL DEFAULT 'CJ대한통운',
    carrier_code TEXT DEFAULT '04',
    tracking_number TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'shipped' CHECK (status IN ('preparing', 'shipped', 'in_transit', 'delivered', 'returned')),
    receiver_name TEXT NOT NULL,
    receiver_phone TEXT NOT NULL,
    shipping_zipcode TEXT DEFAULT '',
    shipping_address TEXT NOT NULL,
    shipping_detail_address TEXT DEFAULT '',
    shipping_memo TEXT DEFAULT '',
    items_summary TEXT DEFAULT '',
    shipped_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON public.deliveries (order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_number ON public.deliveries (order_number);
CREATE INDEX IF NOT EXISTS idx_deliveries_tracking_number ON public.deliveries (tracking_number);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries (status);

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on deliveries" ON public.deliveries;
CREATE POLICY "Allow public read on deliveries" ON public.deliveries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on deliveries" ON public.deliveries;
CREATE POLICY "Allow public insert on deliveries" ON public.deliveries FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on deliveries" ON public.deliveries;
CREATE POLICY "Allow public update on deliveries" ON public.deliveries FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on deliveries" ON public.deliveries;
CREATE POLICY "Allow public delete on deliveries" ON public.deliveries FOR DELETE USING (true);

-- 초기 배송 및 운송장 데이터 시드
INSERT INTO public.deliveries (
    id, order_id, order_number, carrier, carrier_code, tracking_number,
    status, receiver_name, receiver_phone, shipping_zipcode, shipping_address, shipping_detail_address,
    shipping_memo, items_summary, shipped_at, created_at, updated_at
) VALUES
(
    'deliv-001',
    'ord-003',
    'ORD-20261011-519283',
    'CJ대한통운',
    '04',
    '6582-9102-3841',
    'shipped',
    '박민수',
    '010-3333-7777',
    '48119',
    '부산광역시 해운대구 마린시티2로 33',
    '해운대 두산위브더제니스 102동',
    '경비실에 맡겨주세요.',
    '[1+1 더블] 피우다 에어핏 선크림 외 1건',
    '2026-10-11 16:30:00+09',
    '2026-10-11 16:30:00+09',
    '2026-10-11 16:30:00+09'
),
(
    'deliv-002',
    'ord-004',
    'ORD-20261010-394812',
    'CJ대한통운',
    '04',
    '6891-2049-1123',
    'delivered',
    '최유리',
    '010-4444-8888',
    '34126',
    '대전광역시 유성구 대덕대로 512',
    '사이언스빌리지 501호',
    '배송 완료 후 문자 주세요.',
    '피우다 벨벳 쿠션 파운데이션 (본품+리필)',
    '2026-10-10 11:00:00+09',
    '2026-10-10 11:00:00+09',
    '2026-10-10 11:00:00+09'
)
ON CONFLICT (id) DO UPDATE SET
    carrier = EXCLUDED.carrier,
    tracking_number = EXCLUDED.tracking_number,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

-- ==========================================
-- 8. raw_materials (원부자재 및 재고 관리) 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS public.raw_materials (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT '용기(Bottle)',
    current_stock INTEGER NOT NULL DEFAULT 0,
    safety_stock INTEGER NOT NULL DEFAULT 0,
    unit_cost INTEGER NOT NULL DEFAULT 0,
    supplier TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_raw_materials_code ON public.raw_materials (code);
CREATE INDEX IF NOT EXISTS idx_raw_materials_type ON public.raw_materials (type);

ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on raw_materials" ON public.raw_materials;
CREATE POLICY "Allow public read on raw_materials" ON public.raw_materials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on raw_materials" ON public.raw_materials;
CREATE POLICY "Allow public insert on raw_materials" ON public.raw_materials FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on raw_materials" ON public.raw_materials;
CREATE POLICY "Allow public update on raw_materials" ON public.raw_materials FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on raw_materials" ON public.raw_materials;
CREATE POLICY "Allow public delete on raw_materials" ON public.raw_materials FOR DELETE USING (true);

-- 초기 원부자재 시드 데이터
INSERT INTO public.raw_materials (
    id, code, name, type, current_stock, safety_stock, unit_cost, supplier, updated_at
) VALUES
(
    'mat-001',
    'MAT-BTL-50ML-GLS',
    '50ml 고급 투명 유리 앰플용기',
    '용기(Bottle)',
    4500, 1000, 850,
    '(주)한국글라스패키징',
    '2026-10-01'
),
(
    'mat-002',
    'MAT-DRP-SIL-20',
    '실버 알루미늄 드로퍼 스포이드 캡',
    '펌프/캡(Cap)',
    3800, 800, 420,
    '삼우플라스틱',
    '2026-10-01'
),
(
    'mat-003',
    'MAT-BOX-CICA-50',
    'FSC 친환경 시카앰플 50ml 단상자',
    '단상자(Box)',
    6200, 1500, 190,
    '동아인쇄패키지',
    '2026-10-02'
),
(
    'mat-004',
    'MAT-FORM-CICA-EX',
    '마다가스카르 병풀추출물 고농축 원액 (kg)',
    '원료(Formula)',
    120, 30, 65000,
    '바이오스펙트럼코리아',
    '2026-10-04'
),
(
    'mat-005',
    'MAT-PACK-AIR-BIO',
    '생분해 친환경 완충 에어캡 롤',
    '완충재(Pack)',
    45, 15, 22000,
    '에코패킹솔루션',
    '2026-10-05'
)
ON CONFLICT (id) DO UPDATE SET
    current_stock = EXCLUDED.current_stock,
    safety_stock = EXCLUDED.safety_stock,
    unit_cost = EXCLUDED.unit_cost,
    updated_at = EXCLUDED.updated_at;

-- ==========================================
-- 9. tax_invoices (세금계산서 및 거래명세서 관리) 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS public.tax_invoices (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    order_number TEXT NOT NULL,
    user_id TEXT NOT NULL DEFAULT '',
    user_name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'tax_invoice' CHECK (type IN ('cash_receipt', 'tax_invoice')),
    company_name TEXT DEFAULT '',
    tax_number TEXT NOT NULL,
    representative_name TEXT DEFAULT '',
    email TEXT DEFAULT '',
    address TEXT DEFAULT '',
    business_type TEXT DEFAULT '',
    business_category TEXT DEFAULT '',
    supply_amount INTEGER NOT NULL DEFAULT 0,
    vat_amount INTEGER NOT NULL DEFAULT 0,
    amount INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'issued', 'rejected')),
    items JSONB DEFAULT '[]'::jsonb,
    issued_at TIMESTAMP WITH TIME ZONE,
    remarks TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tax_invoices_order_number ON public.tax_invoices (order_number);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_tax_number ON public.tax_invoices (tax_number);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_status ON public.tax_invoices (status);

ALTER TABLE public.tax_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on tax_invoices" ON public.tax_invoices;
CREATE POLICY "Allow public read on tax_invoices" ON public.tax_invoices FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on tax_invoices" ON public.tax_invoices;
CREATE POLICY "Allow public insert on tax_invoices" ON public.tax_invoices FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on tax_invoices" ON public.tax_invoices;
CREATE POLICY "Allow public update on tax_invoices" ON public.tax_invoices FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on tax_invoices" ON public.tax_invoices;
CREATE POLICY "Allow public delete on tax_invoices" ON public.tax_invoices FOR DELETE USING (true);

-- 초기 세금명세서 시드 데이터
INSERT INTO public.tax_invoices (
    id, order_id, order_number, user_id, user_name, type,
    company_name, tax_number, representative_name, email, address,
    business_type, business_category, supply_amount, vat_amount, amount,
    status, items, issued_at, remarks, created_at, updated_at
) VALUES
(
    'tax-001',
    'ord-001',
    'ORD-20261012-841920',
    'user-001',
    '홍길동',
    'cash_receipt',
    '',
    '010-1234-5678',
    '홍길동',
    'gildong@example.com',
    '서울특별시 강남구 테헤란로 152 강남파이낸스센터 12층',
    '', '',
    41818, 4182, 46000,
    'issued',
    '[{"name":"[1+1 특별기획] 피우다 센텔라 시카 카밍 진정 앰플 50ml","spec":"본품 50ml + 50ml (1+1)","quantity":1,"unitPrice":25455,"supplyAmount":25455,"vatAmount":2545,"remarks":""},{"name":"피우다 약산성 마이크로 바이옴 딥 클렌징 폼 150ml","spec":"본품 150ml","quantity":1,"unitPrice":16363,"supplyAmount":16363,"vatAmount":1637,"remarks":""}]'::jsonb,
    '2026-10-12 11:00:00+09',
    '소득공제용 현금영수증',
    '2026-10-12 10:40:00+09',
    '2026-10-12 11:00:00+09'
),
(
    'tax-002',
    'ord-002',
    'ORD-20261012-731940',
    'user-002',
    '이지은 (뷰티연구소)',
    'tax_invoice',
    '(주)뷰티연구소코리아',
    '214-88-99234',
    '이지은',
    'jieun@beautylab.co.kr',
    '경기도 성남시 분당구 판교역로 235 에이치스퀘어 N동 8층',
    '도소매 / 서비스', '화장품 및 미용',
    29091, 2909, 32000,
    'requested',
    '[{"name":"[BEST 1위] 피우다 하이드라 글래스 글로우 수분 크림 80ml","spec":"단품 80ml","quantity":1,"unitPrice":29091,"supplyAmount":29091,"vatAmount":2909,"remarks":""}]'::jsonb,
    null,
    '연구용 샘플 구입 증빙',
    '2026-10-12 09:30:00+09',
    '2026-10-12 09:30:00+09'
)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    supply_amount = EXCLUDED.supply_amount,
    vat_amount = EXCLUDED.vat_amount,
    amount = EXCLUDED.amount,
    items = EXCLUDED.items,
    updated_at = EXCLUDED.updated_at;

-- ==========================================
-- 10. members 테이블 피부고민(skin_concerns) 컬럼 추가
-- ==========================================
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS skin_concerns JSONB DEFAULT '[]'::jsonb;

-- ==========================================
-- 11. shipping_addresses (배송지 관리) 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS public.shipping_addresses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    zipcode TEXT NOT NULL,
    address TEXT NOT NULL,
    detail_address TEXT DEFAULT '',
    is_default BOOLEAN DEFAULT false,
    delivery_memo TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id ON public.shipping_addresses (user_id);

ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on shipping_addresses" ON public.shipping_addresses;
CREATE POLICY "Allow public read on shipping_addresses" ON public.shipping_addresses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on shipping_addresses" ON public.shipping_addresses;
CREATE POLICY "Allow public insert on shipping_addresses" ON public.shipping_addresses FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on shipping_addresses" ON public.shipping_addresses;
CREATE POLICY "Allow public update on shipping_addresses" ON public.shipping_addresses FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on shipping_addresses" ON public.shipping_addresses;
CREATE POLICY "Allow public delete on shipping_addresses" ON public.shipping_addresses FOR DELETE USING (true);

-- 초기 배송지 시드 데이터
INSERT INTO public.shipping_addresses (
    id, user_id, recipient_name, phone, zipcode, address, detail_address, is_default, delivery_memo
) VALUES
(
    'addr-001', 'user-001', '김한', '010-1234-5678', '06236',
    '서울특별시 강남구 테헤란로 152', '강남파이낸스센터 12층', true, '부재 시 문 앞에 놓아주세요.'
),
(
    'addr-002', 'user-001', '김한 (본가)', '010-9999-8888', '13494',
    '경기도 성남시 분당구 판교역로 235', '102동 1502호', false, '배송 전 연락 부탁드립니다.'
)
ON CONFLICT (id) DO UPDATE SET
    recipient_name = EXCLUDED.recipient_name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    is_default = EXCLUDED.is_default;

-- ==========================================
-- 12. subscriptions (화장품 정기배송/구독) 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_image TEXT NOT NULL,
    interval_months INTEGER DEFAULT 1 CHECK (interval_months IN (1, 2, 3)),
    next_delivery_date DATE NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_recipient TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
    discount_rate INTEGER DEFAULT 15,
    price_per_delivery INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions (status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on subscriptions" ON public.subscriptions;
CREATE POLICY "Allow public read on subscriptions" ON public.subscriptions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on subscriptions" ON public.subscriptions;
CREATE POLICY "Allow public insert on subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on subscriptions" ON public.subscriptions;
CREATE POLICY "Allow public update on subscriptions" ON public.subscriptions FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on subscriptions" ON public.subscriptions;
CREATE POLICY "Allow public delete on subscriptions" ON public.subscriptions FOR DELETE USING (true);

-- 초기 정기배송 구독 시드 데이터
INSERT INTO public.subscriptions (
    id, user_id, product_id, product_name, product_image,
    interval_months, next_delivery_date, shipping_address, shipping_recipient, shipping_phone,
    status, discount_rate, price_per_delivery
) VALUES
(
    'sub-001', 'user-001', 'prod-001',
    '[정기구독 15% OFF] 피우다 센텔라 시카 카밍 진정 앰플 50ml',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    1, '2026-11-12', '서울특별시 강남구 테헤란로 152 강남파이낸스센터 12층', '김한', '010-1234-5678',
    'active', 15, 23800
),
(
    'sub-002', 'user-001', 'prod-006',
    '[정기구독 15% OFF] 피우다 약산성 마이크로 바이옴 딥 클렌징 폼 150ml',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    2, '2026-12-05', '서울특별시 강남구 테헤란로 152 강남파이낸스센터 12층', '김한', '010-1234-5678',
    'active', 15, 15300
)
ON CONFLICT (id) DO UPDATE SET
    interval_months = EXCLUDED.interval_months,
    next_delivery_date = EXCLUDED.next_delivery_date,
    status = EXCLUDED.status;

-- ==========================================
-- 13. reviews (상품 후기 및 발림성 평가) 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_skin_type TEXT DEFAULT '민감성',
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    texture TEXT DEFAULT '촉촉해요' CHECK (texture IN ('촉촉해요', '보통이에요', '매트해요')),
    photo_urls JSONB DEFAULT '[]'::jsonb,
    is_best BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews (user_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on reviews" ON public.reviews;
CREATE POLICY "Allow public read on reviews" ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on reviews" ON public.reviews;
CREATE POLICY "Allow public insert on reviews" ON public.reviews FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on reviews" ON public.reviews;
CREATE POLICY "Allow public update on reviews" ON public.reviews FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on reviews" ON public.reviews;
CREATE POLICY "Allow public delete on reviews" ON public.reviews FOR DELETE USING (true);

-- 초기 리뷰 시드 데이터
INSERT INTO public.reviews (
    id, product_id, product_name, user_id, user_name, user_skin_type,
    rating, content, texture, photo_urls, is_best, helpful_count, created_at
) VALUES
(
    'rev-001', 'prod-001',
    '[1+1 특별기획] 피우다 센텔라 시카 카밍 진정 앰플 50ml',
    'user-001', '김한', '민감성',
    5, '붉은기가 심한 편인데 바르고 자면 다음 날 바로 가라앉아요! 끈적임 없이 수분감이 가득해서 아침 화장 전에도 사용하기 좋습니다.',
    '촉촉해요',
    '["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    true, 18, '2026-10-09 14:20:00+09'
),
(
    'rev-002', 'prod-002',
    '[BEST 1위] 피우다 하이드라 글래스 글로우 수분 크림 80ml',
    'user-002', '이지은', '건성',
    5, '속당김이 싹 사라지고 자연스러운 윤광이 돌아서 대만족입니다. 유리알 피부 연출에 최고예요.',
    '촉촉해요',
    '[]'::jsonb,
    true, 12, '2026-10-10 11:30:00+09'
)
ON CONFLICT (id) DO UPDATE SET
    rating = EXCLUDED.rating,
    content = EXCLUDED.content,
    texture = EXCLUDED.texture;

-- ==========================================
-- 14. coupons (쿠폰 관리) 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT '',
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
    discount_value INTEGER NOT NULL,
    min_order_amount INTEGER DEFAULT 0,
    expires_at DATE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons (code);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on coupons" ON public.coupons;
CREATE POLICY "Allow public read on coupons" ON public.coupons FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on coupons" ON public.coupons;
CREATE POLICY "Allow public insert on coupons" ON public.coupons FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on coupons" ON public.coupons;
CREATE POLICY "Allow public update on coupons" ON public.coupons FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on coupons" ON public.coupons;
CREATE POLICY "Allow public delete on coupons" ON public.coupons FOR DELETE USING (true);

-- 초기 쿠폰 데이터 시드
INSERT INTO public.coupons (
    id, user_id, code, name, discount_type, discount_value, min_order_amount, expires_at, is_used
) VALUES
(
    'cp-001', 'user-001', 'WELCOME2026', '신규 회원가입 축하 3,000원 웰컴 쿠폰', 'fixed', 3000, 20000, '2026-11-30', false
),
(
    'cp-002', 'user-001', 'SKINCARE15', '피부맞춤 스킨케어 15% 스페셜 할인 쿠폰', 'percentage', 15, 30000, '2026-10-15', false
),
(
    'cp-003', 'user-001', 'AUTUMN5000', '가을 환절기 수분보습전 5,000원 쿠폰', 'fixed', 5000, 40000, '2026-10-14', false
),
(
    'cp-004', 'user-001', 'USED-WELCOME', '첫구매 감사 10% 쿠폰', 'percentage', 10, 20000, '2026-09-30', true
)
ON CONFLICT (id) DO UPDATE SET
    expires_at = EXCLUDED.expires_at,
    is_used = EXCLUDED.is_used;

-- ==========================================
-- 15. point_logs (적립금 내역) 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS public.point_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    type TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_point_logs_user_id ON public.point_logs (user_id);

ALTER TABLE public.point_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on point_logs" ON public.point_logs;
CREATE POLICY "Allow public read on point_logs" ON public.point_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on point_logs" ON public.point_logs;
CREATE POLICY "Allow public insert on point_logs" ON public.point_logs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on point_logs" ON public.point_logs;
CREATE POLICY "Allow public update on point_logs" ON public.point_logs FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on point_logs" ON public.point_logs;
CREATE POLICY "Allow public delete on point_logs" ON public.point_logs FOR DELETE USING (true);

INSERT INTO public.point_logs (
    id, user_id, amount, balance_after, type, reason, created_at
) VALUES
(
    'pt-001', 'user-001', 3000, 3000, 'SIGNUP_BONUS', '신규 회원가입 축하 마일리지 지급', '2026-10-01 10:00:00+09'
),
(
    'pt-002', 'user-001', 1500, 4500, 'REVIEW_BONUS', '센텔라 시카 앰플 포토 리뷰 작성 보너스', '2026-10-09 14:25:00+09'
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 16. members 테이블 관리자 계정 시드 및 last_login_at 컬럼
-- ==========================================
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- 기본 최고관리자 계정 시드 (이메일: admin@piuda.kr / 비밀번호: admin1234!)
INSERT INTO public.members (
    id, email, password, name, phone, skin_type, role, tier, points, marketing_agreed, address, detail_address, zipcode
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@piuda.kr',
    'admin1234!',
    '총괄관리자',
    '010-9999-8888',
    '중성',
    'admin',
    'VIP',
    999000,
    true,
    '서울특별시 강남구 테헤란로 123',
    '아빠사랑 피우다 본사 운영본부',
    '06236'
)
ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    name = '총괄관리자',
    password = EXCLUDED.password;

-- ==========================================
-- 17. admin_login_logs (관리자 계정 로그인 및 접속 이력) 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS public.admin_login_logs (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL,
    admin_email TEXT NOT NULL,
    admin_name TEXT NOT NULL,
    ip_address TEXT DEFAULT '',
    user_agent TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed')),
    failure_reason TEXT DEFAULT '',
    login_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_login_logs_email ON public.admin_login_logs (admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_login_logs_login_at ON public.admin_login_logs (login_at DESC);

ALTER TABLE public.admin_login_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on admin_login_logs" ON public.admin_login_logs;
CREATE POLICY "Allow public read on admin_login_logs" ON public.admin_login_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on admin_login_logs" ON public.admin_login_logs;
CREATE POLICY "Allow public insert on admin_login_logs" ON public.admin_login_logs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on admin_login_logs" ON public.admin_login_logs;
CREATE POLICY "Allow public update on admin_login_logs" ON public.admin_login_logs FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on admin_login_logs" ON public.admin_login_logs;
CREATE POLICY "Allow public delete on admin_login_logs" ON public.admin_login_logs FOR DELETE USING (true);

-- 초기 관리자 로그인 기록 시드
INSERT INTO public.admin_login_logs (
    id, admin_id, admin_email, admin_name, ip_address, user_agent, status, login_at
) VALUES
(
    'log-adm-001',
    'a0000000-0000-0000-0000-000000000001',
    'admin@piuda.kr',
    '총괄관리자',
    '127.0.0.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    'success',
    '2026-10-12 10:00:00+09'
),
(
    'log-adm-002',
    'a0000000-0000-0000-0000-000000000001',
    'admin@piuda.kr',
    '총괄관리자',
    '127.0.0.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    'success',
    '2026-10-12 14:00:00+09'
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 18. admin_accounts (부관리자 관리 및 메뉴별 접근 권한, 계정 상태 제어) 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS public.admin_accounts (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT DEFAULT '',
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'sub_admin' CHECK (role IN ('super_admin', 'sub_admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    permissions JSONB NOT NULL DEFAULT '["dashboard"]'::jsonb,
    memo TEXT DEFAULT '',
    mfa_enabled BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON public.admin_accounts (email);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_status ON public.admin_accounts (status);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_role ON public.admin_accounts (role);

ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on admin_accounts" ON public.admin_accounts;
CREATE POLICY "Allow public read on admin_accounts" ON public.admin_accounts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on admin_accounts" ON public.admin_accounts;
CREATE POLICY "Allow public insert on admin_accounts" ON public.admin_accounts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on admin_accounts" ON public.admin_accounts;
CREATE POLICY "Allow public update on admin_accounts" ON public.admin_accounts FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on admin_accounts" ON public.admin_accounts;
CREATE POLICY "Allow public delete on admin_accounts" ON public.admin_accounts FOR DELETE USING (true);

-- 초기 관리자 계정 시드 데이터
INSERT INTO public.admin_accounts (
    id, email, password_hash, password_salt, name, phone, role, status, permissions, memo, mfa_enabled, last_login_at
) VALUES
(
    'adm-super-001',
    'admin@piuda.kr',
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', -- admin1234! sha256
    'piuda_salt_2026',
    '총괄대표관리자',
    '010-9999-8888',
    'super_admin',
    'active',
    '["dashboard", "members", "products", "orders", "delivery", "inventory", "tax", "popups", "admins"]'::jsonb,
    '피우다 본사 최고 권한 마스터 계정 (SMS MFA 필수 적용)',
    true,
    '2026-10-12 14:00:00+09'
),
(
    'adm-sub-001',
    'cs@piuda.kr',
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    'piuda_salt_2026',
    '박물류 (배송/CS)',
    '010-3333-7777',
    'sub_admin',
    'active',
    '["dashboard", "orders", "delivery", "tax"]'::jsonb,
    '주문 배송 및 고객 세금계산서 발행 담당 부관리자',
    false,
    '2026-10-11 11:30:00+09'
),
(
    'adm-sub-002',
    'md@piuda.kr',
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    'piuda_salt_2026',
    '최기획 (MD/상품)',
    '010-5555-1111',
    'sub_admin',
    'active',
    '["dashboard", "products", "inventory", "popups"]'::jsonb,
    '화장품 상품 등록, 원부자재 재고 관리 및 팝업 이벤트 담당',
    false,
    '2026-10-10 16:40:00+09'
),
(
    'adm-sub-003',
    'stopped@piuda.kr',
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    'piuda_salt_2026',
    '정중지 (정지테스트)',
    '010-0000-0000',
    'sub_admin',
    'suspended',
    '["dashboard"]'::jsonb,
    '퇴사 및 권한 회수로 인한 승인중지 테스트 계정 (로그인 및 세션 강제 차단)',
    false,
    NULL
)
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    permissions = EXCLUDED.permissions;

-- ==========================================
-- 19. guest_members (일반인 비회원 가입 및 주문 정보) 테이블
-- ==========================================
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS public.guest_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    order_password_hash TEXT DEFAULT '',
    address TEXT DEFAULT '',
    detail_address TEXT DEFAULT '',
    zipcode TEXT DEFAULT '',
    marketing_agreed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_guest_members_phone ON public.guest_members (phone);

ALTER TABLE public.guest_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on guest_members" ON public.guest_members;
CREATE POLICY "Allow public read on guest_members" ON public.guest_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on guest_members" ON public.guest_members;
CREATE POLICY "Allow public insert on guest_members" ON public.guest_members FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on guest_members" ON public.guest_members;
CREATE POLICY "Allow public update on guest_members" ON public.guest_members FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on guest_members" ON public.guest_members;
CREATE POLICY "Allow public delete on guest_members" ON public.guest_members FOR DELETE USING (true);

-- 비회원 초기 샘플 시드
INSERT INTO public.guest_members (
    id, name, phone, email, order_password_hash, address, detail_address, zipcode
) VALUES (
    'guest-demo-001',
    '이비회원',
    '010-8888-1234',
    'guest@piuda.kr',
    '1234',
    '서울특별시 서초구 강남대로 405',
    '3층',
    '06614'
) ON CONFLICT (id) DO NOTHING;
