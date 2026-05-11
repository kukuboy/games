import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';
import { GameProvider } from '@/contexts/GameContext';

export const metadata: Metadata = {
  title: '游戏中心',
  description: '经典小游戏',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          <GameProvider>
            <Navbar />
            <main>{children}</main>
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
