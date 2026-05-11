'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

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
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    if (nickname.length < 2) {
      setError('昵称至少需要2个字符');
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
      setError('注册时出现错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">创建账号</h1>
          <p className="text-xl text-gray-500">开始游戏之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card">
          {error && (
            <div className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-lg">
              {error}
            </div>
          )}

          <div className="space-y-7">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">昵称</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="给自己起个名字"
                required
                minLength={2}
                className="input-field"
              />
            </div>

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
                  placeholder="至少6个字符"
                  required
                  minLength={6}
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

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">确认密码</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码"
                required
                className="input-field"
              />
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
                  <UserPlus className="w-6 h-6" />
                  <span>注册</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-10 text-center">
            <p className="text-lg text-gray-500">
              已有账号？{' '}
              <Link href="/login" className="text-blue-500 hover:text-blue-600 font-medium">
                立即登录
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
