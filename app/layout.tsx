import type { Metadata } from 'next';
import { Shippori_Mincho } from 'next/font/google';
import './globals.css';
import { BGMPlayer } from '@/components/BGMPlayer';

const shippori = Shippori_Mincho({ weight: ['400', '600', '700'], subsets: ['latin', 'japanese'], display: 'swap' });

export const metadata: Metadata = {
  title: '趣味でCursorさわってみる会',
  description: '日程を調整しましょう',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={shippori.className}>
        {children}
        <BGMPlayer />
      </body>
    </html>
  );
}
