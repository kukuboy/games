'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getTopScores } from '@/lib/storage';
import { GameInfo } from '@/types';

const games: GameInfo[] = [
  { id: 'tetris', title: '俄罗斯方块', description: '经典方块消除', icon: '🧱', path: '/game/tetris', color: 'from-rose-400 to-pink-500' },
  { id: 'snake', title: '贪吃蛇', description: '控制蛇吃食物', icon: '🐍', path: '/game/snake', color: 'from-emerald-400 to-teal-500' },
  { id: 'breakout', title: '打砖块', description: '反弹球击碎砖块', icon: '🎯', path: '/game/breakout', color: 'from-blue-400 to-cyan-500' },
  { id: 'memory', title: '记忆翻牌', description: '翻转卡牌配对', icon: '🃏', path: '/game/memory', color: 'from-violet-400 to-purple-500' },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <section className="pt-24 pb-8 px-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl mb-2">游戏中心</h1>
          <p className="text-sm text-zinc-500">玩个游戏，放松一下</p>
        </div>
      </section>

      <section className="px-5 pb-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xs text-zinc-500 mb-4 uppercase tracking-wider">游戏</h2>
          
          <div className="space-y-0">
            {games.map((game) => (
              <Link
                key={game.id}
                href={game.path}
                className="flex items-center justify-between py-4 border-t border-zinc-100 hover:bg-zinc-50 -mx-5 px-5"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl">{game.icon}</span>
                  <div>
                    <p className="font-medium">{game.title}</p>
                    <p className="text-xs text-zinc-500">{game.description}</p>
                  </div>
                </div>
                <span className="text-zinc-300">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-12">
        <div className="max-w-2xl mx-auto border-t border-zinc-100 pt-8">
          <h2 className="text-xs text-zinc-500 mb-4 uppercase tracking-wider">排行榜</h2>
          
          <div className="space-y-2">
            {games.map((game) => {
              const top = getTopScores(game.id, 1)[0];
              return (
                <Link key={game.id} href="/leaderboard" className="flex items-center justify-between py-2 hover:bg-zinc-50 -mx-5 px-5">
                  <span>{game.title}</span>
                  <span className="text-zinc-500">
                    {top ? `${top.nickname} · ${top.score}分` : '暂无'}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
