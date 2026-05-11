'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getTopScores } from '@/lib/storage';
import { GameInfo } from '@/types';
import { ChevronRight } from 'lucide-react';

const games: GameInfo[] = [
  { id: 'tetris', title: '俄罗斯方块', description: '经典方块消除', icon: '🧱', path: '/game/tetris', color: 'from-rose-300 to-pink-300' },
  { id: 'snake', title: '贪吃蛇', description: '控制蛇吃食物', icon: '🐍', path: '/game/snake', color: 'from-emerald-300 to-teal-300' },
  { id: 'sudoku', title: '数独', description: '逻辑推理填数', icon: '🔢', path: '/game/sudoku', color: 'from-blue-300 to-cyan-300' },
  { id: 'breakout', title: '打砖块', description: '反弹球击碎砖块', icon: '🎯', path: '/game/breakout', color: 'from-blue-300 to-indigo-300' },
  { id: 'memory', title: '记忆翻牌', description: '翻转卡牌配对', icon: '🃏', path: '/game/memory', color: 'from-violet-300 to-purple-300' },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen pb-12">
      <section className="pt-28 pb-10 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="clay-card mb-8">
            <h1 className="text-2xl font-semibold mb-2">游戏中心</h1>
            <p className="text-base opacity-60">玩个游戏，放松一下</p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="clay-badge mb-5">
            <span className="text-sm font-medium opacity-70">游戏列表</span>
          </div>
          
          <div className="space-y-4">
            {games.map((game) => (
              <Link
                key={game.id}
                href={game.path}
                className="clay-card flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl shadow-inner`}>
                    {game.icon}
                  </div>
                  <div>
                    <p className="font-medium text-lg">{game.title}</p>
                    <p className="text-sm opacity-50">{game.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-70 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="clay-badge mb-5">
            <span className="text-sm font-medium opacity-70">排行榜</span>
          </div>
          
          <div className="clay-card">
            <div className="space-y-3">
              {games.map((game) => {
                const top = getTopScores(game.id, 1)[0];
                return (
                  <Link key={game.id} href="/leaderboard" className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{game.icon}</span>
                      <span className="font-medium">{game.title}</span>
                    </div>
                    <span className="text-sm opacity-60">
                      {top ? `${top.nickname} · ${top.score}分` : '暂无记录'}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6">
        <div className="max-w-2xl mx-auto text-center">
          {isAuthenticated ? (
            <div className="clay-card">
              <p className="opacity-70">已登录，开始游戏吧！</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register" className="clay-button clay-button-primary">
                立即注册
              </Link>
              <Link href="/login" className="clay-button">
                登录
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
