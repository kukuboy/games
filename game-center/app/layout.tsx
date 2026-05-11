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
            <main className="flex-1">
              {children}
            </main>
            <footer className="py-10 text-center text-base text-gray-400 border-t border-gray-200">
              <p>© 2024 游戏中心</p>
            </footer>
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
