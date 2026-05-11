import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import { GameProvider } from "@/contexts/GameContext";

export const metadata: Metadata = {
  title: "游戏中心 - 经典小游戏集合",
  description: "集合了俄罗斯方块、贪吃蛇、打砖块、记忆翻牌等多款经典小游戏的在线游戏平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <GameProvider>
            <Navbar />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <footer className="py-6 text-center text-gray-500 text-sm border-t border-white/10">
              <p>© 2024 游戏中心. 保留所有权利.</p>
            </footer>
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
