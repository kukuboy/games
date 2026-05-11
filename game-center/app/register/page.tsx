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
    if (nickname.length < 2) {
      setError('昵称至少2位');
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
    <div className="min-h-screen pt-24 px-5">
      <div className="max-w-xs mx-auto">
        <h1 className="text-xl mb-8">注册</h1>

        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="你的昵称"
              required
              minLength={2}
              className="w-full px-0 py-2 border-0 border-b border-zinc-200 focus:outline-none focus:border-black text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="w-full px-0 py-2 border-0 border-b border-zinc-200 focus:outline-none focus:border-black text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">密码</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少6位"
                required
                minLength={6}
                className="w-full px-0 py-2 border-0 border-b border-zinc-200 focus:outline-none focus:border-black text-sm pr-8"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">确认密码</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入"
              required
              className="w-full px-0 py-2 border-0 border-b border-zinc-200 focus:outline-none focus:border-black text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-sm font-medium bg-black text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <p className="text-xs text-zinc-500 mt-6">
          已有账号？ <Link href="/login" className="text-black">登录</Link>
        </p>
      </div>
    </div>
  );
}
