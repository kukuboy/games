'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: '首页' },
    { href: '/leaderboard', label: '排行榜' },
    { href: '/profile', label: '个人中心' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="fixed top-4 left-4 right-4 z-50">
        <div className="clay-card py-3 px-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-semibold text-lg">
              游戏中心
            </Link>

            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.href) 
                      ? 'bg-[var(--primary)] text-white shadow-inner' 
                      : 'hover:bg-[var(--bg)]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[var(--shadow-dark)]">
                  <span className="text-sm opacity-70">{user?.nickname}</span>
                  <button 
                    onClick={logout} 
                    className="px-4 py-2 rounded-xl text-sm opacity-70 hover:opacity-100 hover:bg-[var(--bg)] transition-all"
                  >
                    退出
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-[var(--shadow-dark)]">
                  <Link href="/login" className="px-4 py-2 rounded-xl text-sm opacity-70 hover:opacity-100 hover:bg-[var(--bg)] transition-all">
                    登录
                  </Link>
                  <Link href="/register" className="clay-button clay-button-primary py-2 px-4 text-sm">
                    注册
                  </Link>
                </div>
              )}
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-24 px-4">
          <div className="clay-card">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 px-4 rounded-xl text-center font-medium transition-all ${
                    isActive(item.href) 
                      ? 'bg-[var(--primary)] text-white shadow-inner' 
                      : 'hover:bg-[var(--bg)]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-[var(--shadow-dark)]">
              {isAuthenticated ? (
                <>
                  <p className="text-center py-3 opacity-70">{user?.nickname}</p>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 text-center opacity-70 hover:opacity-100"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link 
                    href="/login" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="block py-3 text-center rounded-xl hover:bg-[var(--bg)]"
                  >
                    登录
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="block py-3 text-center rounded-xl bg-[var(--primary)] text-white shadow-inner"
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
