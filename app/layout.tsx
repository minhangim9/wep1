import type { Metadata } from 'next';
import './globals.css';
import { ShopProvider } from '@/context/ShopContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { QuickFloatingMenu } from '@/components/layout/QuickFloatingMenu';
import { PopupModal } from '@/components/common/PopupModal';
import { ChatbotModal } from '@/components/common/ChatbotModal';
import { AuthModal } from '@/components/common/AuthModal';
import { SupabaseKeyModalWrapper } from '@/components/common/SupabaseKeyModalWrapper';
import { Toast } from '@/components/common/Toast';

export const metadata: Metadata = {
  title: '아빠사랑 | 피우다 (Piuda) - 프리미엄 K-뷰티 화장품 쇼핑몰',
  description: '민감성 피부를 위한 저자극 고효능 비건 스킨케어, 1+1 타임특가, 아빠사랑 피우다(Piuda) 공식 온라인 스토어',
  keywords: '화장품, 피우다, Piuda, 아빠사랑, 스킨케어, 1+1, 세럼, 앰플, 수분크림, 선크림, 비건뷰티, K-beauty',
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
          <AuthModal />
          <SupabaseKeyModalWrapper />
          <ChatbotModal />
          <Toast />
        </ShopProvider>
      </body>
    </html>
  );
}
