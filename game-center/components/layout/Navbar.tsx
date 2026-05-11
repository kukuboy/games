'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Gamepad2, Trophy, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: '首页', icon: Gamepad2 },
    { href: '/leaderboard', label: '排行榜', icon: Trophy },
    { href: '/profile', label: '个人中心', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/60">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-[72px]">
          <Link href="/" className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 tracking-tight">游戏中心</span>
          </Link>

          <div className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-base text-gray-500">
                  <span className="text-gray-800 font-medium">{user?.nickname}</span>
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-base text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>退出</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-xl text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl text-base font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all"
                >
                  注册
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-6 py-5 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base transition-all ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            <div className="pt-5 border-t border-gray-200 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 text-base text-gray-500">
                    <span className="font-medium text-gray-800">{user?.nickname}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-gray-600 hover:bg-gray-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>退出登录</span>
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3.5 text-center rounded-xl text-gray-600 hover:bg-gray-50 text-base"
                  >
                    登录
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3.5 text-center rounded-xl bg-blue-500 text-white hover:bg-blue-600 text-base"
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
