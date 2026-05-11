'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType, User, AuthToken } from '@/types';
import {
  getUsers,
  saveUsers,
  getToken,
  saveToken,
  removeToken,
  getUserByEmail,
  generateId,
  hashPassword,
  updateLeaderboard,
  initDemoData,
} from '@/lib/storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<AuthToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDemoData();
    
    const storedToken = getToken();
    if (storedToken) {
      setToken(storedToken);
      const users = getUsers();
      const foundUser = users.find(u => u.id === storedToken.userId);
      if (foundUser) {
        setUser(foundUser);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const foundUser = getUserByEmail(email);
    
    if (!foundUser) {
      return { success: false, message: '用户不存在' };
    }
    
    const hashedPassword = hashPassword(password);
    if (foundUser.password !== hashedPassword) {
      return { success: false, message: '密码错误' };
    }
    
    const newToken: AuthToken = {
      userId: foundUser.id,
      email: foundUser.email,
      nickname: foundUser.nickname,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    
    saveToken(newToken);
    setToken(newToken);
    setUser(foundUser);
    
    return { success: true, message: '登录成功' };
  };

  const register = async (email: string, password: string, nickname: string): Promise<{ success: boolean; message: string }> => {
    if (!email || !password || !nickname) {
      return { success: false, message: '请填写所有字段' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: '请输入有效的邮箱地址' };
    }
    
    if (password.length < 6) {
      return { success: false, message: '密码至少需要6个字符' };
    }
    
    if (nickname.length < 2) {
      return { success: false, message: '昵称至少需要2个字符' };
    }
    
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return { success: false, message: '该邮箱已被注册' };
    }
    
    const newUser: User = {
      id: generateId(),
      email,
      nickname,
      password: hashPassword(password),
      createdAt: Date.now(),
    };
    
    const users = getUsers();
    users.push(newUser);
    saveUsers(users);
    
    const newToken: AuthToken = {
      userId: newUser.id,
      email: newUser.email,
      nickname: newUser.nickname,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    
    saveToken(newToken);
    setToken(newToken);
    setUser(newUser);
    
    return { success: true, message: '注册成功' };
  };

  const logout = () => {
    removeToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
