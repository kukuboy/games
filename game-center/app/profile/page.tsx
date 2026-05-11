'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserScoreHistory, getUserHighScores } from '@/lib/storage';
import { GameType, GameScore } from '@/types';

const games: GameType[] = ['tetris', 'snake', 'sudoku', 'breakout', 'memory'];
const gameNames: Record<GameType, string> = {
  tetris: '俄罗斯方块',
  snake: '贪吃蛇',
  sudoku: '数独',
  breakout: '打砖块',
  memory: '记忆翻牌',
};
const gameIcons: Record<GameType, string> = {
  tetris: '🧱',
  snake: '🐍',
  sudoku: '🔢',
  breakout: '🎯',
  memory: '🃏',
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

  const highScores = games.map(gameId => ({
    gameId,
    gameName: gameNames[gameId],
    icon: gameIcons[gameId],
    highScore: getUserHighScores(user.id, gameId),
  }));

  const totalScore = highScores.reduce((sum, g) => sum + g.highScore, 0);

  return (
    <div className="min-h-screen pb-12">
      <div className="pt-28 px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="clay-button py-2 px-4 text-sm">← 返回</Link>
            <h1 className="text-xl font-semibold">{user.nickname}</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="clay-card">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center py-4 rounded-xl bg-[var(--bg)]">
                <p className="text-2xl font-semibold">{totalScore.toLocaleString()}</p>
                <p className="text-sm opacity-50">总最高分</p>
              </div>
              <div className="text-center py-4 rounded-xl bg-[var(--bg)]">
                <p className="text-2xl font-semibold">{highScores.filter(g => g.highScore > 0).length}</p>
                <p className="text-sm opacity-50">已玩游戏</p>
              </div>
            </div>
          </div>

          <div>
            <div className="clay-badge mb-4">
              <span className="text-sm font-medium opacity-70">各游戏最高分</span>
            </div>
            <div className="clay-card">
              <div className="space-y-2">
                {highScores.map((game) => (
                  <Link
                    key={game.gameId}
                    href={`/game/${game.gameId}`}
                    className="flex items-center justify-between py-3 px-4 rounded-xl bg-[var(--bg)] hover:bg-[var(--shadow-dark)] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{game.icon}</span>
                      <span className="font-medium">{game.gameName}</span>
                    </div>
                    <span className="font-semibold">{game.highScore > 0 ? game.highScore.toLocaleString() : '-'}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="clay-badge mb-4">
              <span className="text-sm font-medium opacity-70">游戏记录</span>
            </div>
            
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {games.map((game) => (
                <button
                  key={game}
                  onClick={() => setSelectedGame(game)}
                  className={`clay-button py-2 px-4 text-sm whitespace-nowrap ${
                    selectedGame === game ? 'clay-button-primary' : ''
                  }`}
                >
                  {gameIcons[game]} {gameNames[game]}
                </button>
              ))}
            </div>

            <div className="clay-card">
              {history.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="opacity-50">还没有记录</p>
                  <Link href={`/game/${selectedGame}`} className="text-sm opacity-50 hover:opacity-80 mt-1 inline-block">
                    去玩一局 →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((score) => (
                    <div key={score.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-[var(--bg)]">
                      <span className="text-sm opacity-50">
                        {new Date(score.timestamp).toLocaleDateString()}
                      </span>
                      <span className="font-semibold">{score.score.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
