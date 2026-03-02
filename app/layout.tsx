import type { Metadata } from 'next';
import './globals.css';
import { BGMPlayer } from '@/components/BGMPlayer';

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
      <body>
        {children}
        <BGMPlayer />
      </body>
    </html>
  );
}
