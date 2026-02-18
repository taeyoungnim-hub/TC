import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '모두의 리뷰 - 리뷰 메타서치',
  description: '검색어 하나로 여러 곳에 흩어진 리뷰를 한 번에 모아보세요',
  keywords: ['리뷰', '후기', '메타서치', '제품리뷰', '맛집리뷰'],
  openGraph: {
    title: '모두의 리뷰 - All Reviews Hub',
    description: '검색어 하나로 여러 곳에 흩어진 리뷰를 한 번에 모아보세요',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
