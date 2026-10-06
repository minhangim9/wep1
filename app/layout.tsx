import type { Metadata } from 'next';
import './globals.css';
import { ShopProvider } from '@/context/ShopContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { QuickFloatingMenu } from '@/components/layout/QuickFloatingMenu';
import { PopupModal } from '@/components/common/PopupModal';
import { ChatbotModal } from '@/components/common/ChatbotModal';
import { Toast } from '@/components/common/Toast';

export const metadata: Metadata = {
  title: '다써바 (DASSEOBA) | K-뷰티 화장품 전문 쇼핑몰 - 1+1 특별 기획전',
  description: '민감성 피부를 위한 저자극 비건 스킨케어, 1+1 타임특가, 피부타입 맞춤 화장품 추천 쇼핑몰 다써바',
  keywords: '화장품, 스킨케어, 1+1, 세럼, 앰플, 수분크림, 선크림, 비건뷰티, 다써바, K-beauty',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-white text-neutral-900 antialiased selection:bg-rose-500 selection:text-white">
        <ShopProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <QuickFloatingMenu />
          <PopupModal />
          <ChatbotModal />
          <Toast />
        </ShopProvider>
      </body>
    </html>
  );
}
