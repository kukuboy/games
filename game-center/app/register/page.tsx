'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }
    if (password.length < 6) {
      setError('密码至少6位');
      return;
    }

    setLoading(true);
    try {
      const result = await register(email, password, nickname);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.message);
      }
    } catch {
      setError('注册时出错');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-8">
      <div className="w-full max-w-sm pt-24">
        <div className="clay-card mb-6">
          <h1 className="text-2xl font-semibold text-center mb-2">注册</h1>
          <p className="text-center text-sm opacity-50">开始游戏之旅</p>
        </div>

        <div className="clay-card">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-100 text-rose-600 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">昵称</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="给自己起个名字"
                required
                className="clay-input"
              />
            </div>

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
                  placeholder="至少6位"
                  required
                  minLength={6}
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

            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">确认密码</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码"
                required
                className="clay-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="clay-button clay-button-primary w-full"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm opacity-60">
              已有账号？{' '}
              <Link href="/login" className="font-medium opacity-80 hover:opacity-100">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
