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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-zinc-100">
        <div className="max-w-2xl mx-auto px-5">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="font-medium">
              游戏中心
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm ${
                    isActive(item.href) ? 'text-black' : 'text-zinc-500 hover:text-black'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-zinc-500">{user?.nickname}</span>
                  <button onClick={logout} className="text-sm text-zinc-500 hover:text-black">
                    退出
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="text-sm text-zinc-500 hover:text-black">
                    登录
                  </Link>
                  <Link href="/register" className="text-sm text-black">
                    注册
                  </Link>
                </div>
              )}
            </div>

            <button
              className="md:hidden p-2 -mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed top-14 left-0 right-0 bottom-0 z-40 bg-white md:hidden">
          <div className="px-5 pt-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 ${
                  isActive(item.href) ? 'text-black' : 'text-zinc-500'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="pt-4 border-t border-zinc-100">
              {isAuthenticated ? (
                <>
                  <p className="text-sm text-zinc-500 mb-4">{user?.nickname}</p>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm text-zinc-500"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-500">
                    登录
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-black">
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
