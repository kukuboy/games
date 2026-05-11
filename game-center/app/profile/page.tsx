'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserScoreHistory, getUserHighScores } from '@/lib/storage';
import { GameType, GameScore } from '@/types';

const games: GameType[] = ['tetris', 'snake', 'breakout', 'memory'];
const gameNames: Record<GameType, string> = {
  tetris: '俄罗斯方块',
  snake: '贪吃蛇',
  breakout: '打砖块',
  memory: '记忆翻牌',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [selectedGame, setSelectedGame] = useState<GameType>('tetris');
  const [history, setHistory] = useState<GameScore[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (user) {
      setHistory(getUserScoreHistory(user.id, selectedGame));
    }
  }, [user, selectedGame]);

  if (loading || !isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen pt-24 px-5">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl">{user.nickname}</h1>
          <Link href="/" className="text-xs text-zinc-500 hover:text-black">← 返回</Link>
        </div>

        <div className="space-y-6">
          <div className="border-t border-zinc-100 pt-6">
            <h2 className="text-xs text-zinc-500 uppercase tracking-wider mb-4">最高分</h2>
            <div className="space-y-0">
              {games.map((game) => {
                const high = getUserHighScores(user.id, game);
                return (
                  <Link
                    key={game}
                    href={`/game/${game}`}
                    className="flex items-center justify-between py-3 border-t border-zinc-100 -mx-5 px-5 hover:bg-zinc-50"
                  >
                    <span className="text-sm">{gameNames[game]}</span>
                    <span className="text-sm font-medium">{high}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-6">
            <h2 className="text-xs text-zinc-500 uppercase tracking-wider mb-4">历史记录</h2>
            
            <div className="flex gap-4 mb-6 overflow-x-auto">
              {games.map((game) => (
                <button
                  key={game}
                  onClick={() => setSelectedGame(game)}
                  className={`text-xs shrink-0 ${
                    selectedGame === game ? 'text-black border-b border-black pb-1' : 'text-zinc-500 hover:text-black'
                  }`}
                >
                  {gameNames[game]}
                </button>
              ))}
            </div>

            <div className="space-y-0">
              {history.length === 0 ? (
                <p className="text-sm text-zinc-500">还没有记录</p>
              ) : (
                history.map((score, i) => (
                  <div key={score.id} className="flex items-center justify-between py-3 border-t border-zinc-100">
                    <span className="text-xs text-zinc-500">
                      {new Date(score.timestamp).toLocaleDateString()}
                    </span>
                    <span className="text-sm font-medium">{score.score}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
