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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
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
    <div className="min-h-screen py-16 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-5 mb-10">
          <Link href="/" className="p-3 rounded-xl bg-white hover:bg-gray-100 transition-colors border border-gray-200">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-semibold text-gray-900">个人中心</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <User className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <p className="text-base text-gray-500">用户名</p>
                <p className="font-semibold text-xl text-gray-900">{user.nickname}</p>
              </div>
            </div>
            <p className="text-base text-gray-400">{user.email}</p>
          </div>

          <div className="glass-card">
            <p className="text-base text-gray-500 mb-3">总最高分</p>
            <p className="text-3xl font-bold text-blue-500">{totalHighScores.toLocaleString()}</p>
          </div>

          <div className="glass-card">
            <p className="text-base text-gray-500 mb-3">已玩游戏</p>
            <p className="text-3xl font-bold text-gray-900">{gamesPlayed} / {games.length}</p>
          </div>
        </div>

        <div className="glass-card mb-8">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="font-semibold text-xl text-gray-900">各游戏最高分</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {highScores.map((game) => (
              <Link
                key={game.gameId}
                href={`/game/${game.gameId}`}
                className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{game.icon}</span>
                  <span className="font-medium text-lg text-gray-800">{game.gameName}</span>
                </div>
                <span className="font-semibold text-xl text-blue-500">
                  {game.highScore.toLocaleString()} 分
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="font-semibold text-xl text-gray-900">游戏记录</h3>
          </div>
          <div className="p-6">
            <div className="flex gap-3 mb-6">
              {games.map((gameId) => (
                <button
                  key={gameId}
                  onClick={() => setSelectedGame(gameId)}
                  className={`px-4 py-2.5 rounded-xl text-base transition-all ${
                    selectedGame === gameId
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {gameIcons[gameId]} {gameNames[gameId]}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg">暂无记录</p>
                  <Link href={`/game/${selectedGame}`} className="text-blue-500 hover:text-blue-600 mt-2 inline-block text-base">
                    去玩一局 →
                  </Link>
                </div>
              ) : (
                history.map((record, index) => (
                  <div key={record.id} className="flex items-center justify-between py-4 px-5 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-4">
                      <span className="text-base text-gray-400">#{index + 1}</span>
                      <span className="text-base text-gray-600">
                        {new Date(record.timestamp).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <span className="font-semibold text-xl text-blue-500">{record.score.toLocaleString()} 分</span>
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
