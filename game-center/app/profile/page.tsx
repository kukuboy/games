'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserScoreHistory, getUserHighScores } from '@/lib/storage';
import { GameType, GameScore } from '@/types';
import { User, ArrowLeft, Trophy } from 'lucide-react';

const gameNames: Record<GameType, string> = {
  tetris: '俄罗斯方块',
  snake: '贪吃蛇',
  breakout: '打砖块',
  memory: '记忆翻牌',
};

const gameIcons: Record<GameType, string> = {
  tetris: '🧱',
  snake: '🐍',
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
      const userHistory = getUserScoreHistory(user.id, selectedGame);
      setHistory(userHistory);
    }
  }, [user, selectedGame]);

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const games: GameType[] = ['tetris', 'snake', 'breakout', 'memory'];
  const highScores = games.map(gameId => ({
    gameId,
    gameName: gameNames[gameId],
    icon: gameIcons[gameId],
    highScore: getUserHighScores(user.id, gameId),
  }));

  const totalHighScores = highScores.reduce((sum, g) => sum + g.highScore, 0);
  const gamesPlayed = games.filter(g => getUserHighScores(user.id, g) > 0).length;

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-lg bg-white hover:bg-slate-100 transition-colors border border-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">个人中心</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">用户名</p>
                <p className="font-semibold text-slate-900">{user.nickname}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">{user.email}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">总最高分</p>
            <p className="text-2xl font-bold text-indigo-500">{totalHighScores.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">已玩游戏</p>
            <p className="text-2xl font-bold text-indigo-500">{gamesPlayed} / {games.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">各游戏最高分</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {highScores.map((game) => (
              <Link
                key={game.gameId}
                href={`/game/${game.gameId}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{game.icon}</span>
                  <span className="font-medium text-slate-800">{game.gameName}</span>
                </div>
                <span className="font-semibold text-indigo-500">
                  {game.highScore.toLocaleString()} 分
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">游戏记录</h3>
          </div>
          <div className="p-4">
            <div className="flex gap-2 mb-4">
              {games.map((gameId) => (
                <button
                  key={gameId}
                  onClick={() => setSelectedGame(gameId)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    selectedGame === gameId
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {gameIcons[gameId]} {gameNames[gameId]}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>暂无记录</p>
                  <Link href={`/game/${selectedGame}`} className="text-indigo-500 hover:text-indigo-600 mt-1 inline-block">
                    去玩一局 →
                  </Link>
                </div>
              ) : (
                history.map((record, index) => (
                  <div key={record.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-400">#{index + 1}</span>
                      <span className="text-sm text-slate-600">
                        {new Date(record.timestamp).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <span className="font-semibold text-indigo-500">{record.score.toLocaleString()} 分</span>
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
