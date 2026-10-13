/**
 * Supabase Storage 'products' 버킷에 4종 화장품 이미지 및 쇼케이스 배너 자동 업로드 스크립트
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://psblczhzozsuicstbefl.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzYmxjemh6b3pzdWljc3RiZWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3OTc5OTcsImV4cCI6MjEwNjM3Mzk5N30.Bqdx1qn4yFVZrHr1_6Y-3rUk4acX_Wt726unuSvPbNk';

const supabase = createClient(url, key);

const imagesToUpload = [
  {
    local: 'public/product_1_piuda_mascot.png',
    target: 'uploads/product_1_piuda_mascot.png',
    title: '1. 피우다 호랑이 마스코트 뷰티케어 앰플 (NEW)',
  },
  {
    local: 'public/product_2_facial_care.png',
    target: 'uploads/product_2_facial_care.png',
    title: '2. 페이셜 에스테틱 시카 머드팩/마스크 (BEST)',
  },
  {
    local: 'public/product_3_cica_cream.png',
    target: 'uploads/product_3_cica_cream.png',
    title: '3. 1+1 증정 기획 진정 카밍 튜브 크림 & 괄사 세트 (BEST)',
  },
  {
    local: 'public/product_4_makeup_palette.png',
    target: 'uploads/product_4_makeup_palette.png',
    title: '4. 벨벳 롱래스팅 아이섀도우 팔레트 & 메이크업 세트 (NEW)',
  },
  {
    local: 'public/products_showcase_banner.png',
    target: 'uploads/products_showcase_banner.png',
    title: '5. 화장품 4종 통합 쇼케이스 배너 이미지',
  },
];

async function main() {
  console.log('🚀 Supabase Storage products 버킷에 화장품 이미지 업로드 시작...\n');

  for (const item of imagesToUpload) {
    if (!fs.existsSync(item.local)) {
      console.warn(`⚠️ 로컬 파일 없음: ${item.local}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(item.local);
    const { data, error } = await supabase.storage
      .from('products')
      .upload(item.target, fileBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.error(`❌ [${item.title}] 업로드 실패:`, error.message);
      if (error.message.includes('not found') || error.message.includes('NoSuchBucket')) {
        console.log(`💡 안내: Supabase 대시보드 Storage에서 'products' 버킷을 생성하거나 schema.sql의 Storage 섹션을 실행해주세요.`);
      }
    } else {
      const { data: pubData } = supabase.storage.from('products').getPublicUrl(item.target);
      console.log(`✅ [${item.title}] 업로드 성공!`);
      console.log(`   Public URL: ${pubData.publicUrl}\n`);
    }
  }

  console.log('✨ 업로드 작업 종료.');
}

main();
