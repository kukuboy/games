'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserScoreHistory, getUserHighScores } from '@/lib/storage';
import { GameType, GameScore } from '@/types';
import { User, Mail, Calendar, Trophy, ArrowLeft, Gamepad2, TrendingUp, Clock } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'stats' | 'history'>('stats');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
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
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-4xl font-bold text-gradient">个人中心</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl lg:col-span-1">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-cyan-500 flex items-center justify-center text-4xl mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">{user.nickname}</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="w-4 h-4" />
                <span className="text-sm truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  注册于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl lg:col-span-2">
            <h3 className="text-lg font-bold mb-4">游戏统计</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-5 h-5 text-pink-400" />
                  <span className="text-gray-400 text-sm">总最高分</span>
                </div>
                <p className="text-3xl font-bold text-pink-400">
                  {totalHighScores.toLocaleString()}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <Gamepad2 className="w-5 h-5 text-cyan-400" />
                  <span className="text-gray-400 text-sm">游玩游戏数</span>
                </div>
                <p className="text-3xl font-bold text-cyan-400">
                  {gamesPlayed} / {games.length}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {highScores.map((game) => (
                <Link
                  key={game.gameId}
                  href={`/game/${game.gameId}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{game.icon}</span>
                    <span className="font-medium">{game.gameName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-cyan-400 font-bold">
                      {game.highScore.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">分</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'bg-pink-500/10 text-pink-400 border-b-2 border-pink-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              最高分
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              游戏记录
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'stats' ? (
              <div className="space-y-4">
                {highScores.map((game) => (
                  <div
                    key={game.gameId}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500/20 to-cyan-500/20 flex items-center justify-center text-2xl">
                        {game.icon}
                      </div>
                      <div>
                        <p className="font-bold">{game.gameName}</p>
                        <p className="text-sm text-gray-400">历史最高</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-cyan-400">
                        {game.highScore.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="flex gap-2 mb-4">
                  {games.map((gameId) => (
                    <button
                      key={gameId}
                      onClick={() => setSelectedGame(gameId)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        selectedGame === gameId
                          ? 'bg-pink-500/20 text-pink-400'
                          : 'bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {gameIcons[gameId]} {gameNames[gameId]}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {history.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>暂无游戏记录</p>
                      <Link
                        href={`/game/${selectedGame}`}
                        className="text-pink-400 hover:text-pink-300 mt-2 inline-block"
                      >
                        去玩一局 →
                      </Link>
                    </div>
                  ) : (
                    history.map((record, index) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500 text-sm">#{index + 1}</span>
                          <span className="text-gray-400 text-sm">
                            {new Date(record.timestamp).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-cyan-400 font-bold">
                            {record.score.toLocaleString()} 分
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
