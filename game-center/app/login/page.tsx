'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';

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
      setError('登录时出现错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">欢迎回来</h1>
          <p className="text-xl text-gray-500">登录到游戏中心</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card">
          {error && (
            <div className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-lg">
              {error}
            </div>
          )}

          <div className="space-y-7">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  required
                  className="input-field pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-6 h-6" />
                  <span>登录</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-10 text-center">
            <p className="text-lg text-gray-500">
              还没有账号？{' '}
              <Link href="/register" className="text-blue-500 hover:text-blue-600 font-medium">
                立即注册
              </Link>
            </p>
          </div>
        </form>

        <div className="mt-8 p-6 rounded-2xl bg-white border border-gray-200">
          <p className="text-base text-gray-500 text-center mb-3">测试账号（演示用）：</p>
          <p className="text-lg text-gray-600 text-center">邮箱：player1@game.com</p>
          <p className="text-lg text-gray-600 text-center">密码：demo123</p>
        </div>
      </div>
    </div>
  );
}
