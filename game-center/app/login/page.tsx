'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.message);
      }
    } catch {
      setError('登录时出现错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-8">
      <div className="w-full max-w-sm pt-24">
        <div className="clay-card mb-6">
          <h1 className="text-2xl font-semibold text-center mb-2">登录</h1>
          <p className="text-center text-sm opacity-50">欢迎回到游戏中心</p>
        </div>

        <div className="clay-card">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-100 text-rose-600 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                required
                className="clay-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  required
                  className="clay-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="clay-button clay-button-primary w-full"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm opacity-60">
              还没有账号？{' '}
              <Link href="/register" className="font-medium opacity-80 hover:opacity-100">
                立即注册
              </Link>
            </p>
          </div>
        </div>

        <div className="clay-card mt-4">
          <p className="text-xs text-center opacity-50">测试账号：player1@game.com / demo123</p>
        </div>
      </div>
    </div>
  );
}
