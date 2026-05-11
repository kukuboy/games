'use client';

import { useState, useEffect } from 'react';
import { getLeaderboard } from '@/lib/storage';
import { GameType, LeaderboardEntry } from '@/types';
import { Trophy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const gameTabs: { id: GameType; name: string; icon: string }[] = [
  { id: 'tetris', name: '俄罗斯方块', icon: '🧱' },
  { id: 'snake', name: '贪吃蛇', icon: '🐍' },
  { id: 'breakout', name: '打砖块', icon: '🎯' },
  { id: 'memory', name: '记忆翻牌', icon: '🃏' },
];

export default function LeaderboardPage() {
  const [selectedGame, setSelectedGame] = useState<GameType>('tetris');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const data = getLeaderboard(selectedGame);
    setLeaderboard(data.entries);
  }, [selectedGame]);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-amber-50 text-amber-600';
    if (rank === 2) return 'bg-gray-100 text-gray-500';
    if (rank === 3) return 'bg-orange-50 text-orange-500';
    return '';
  };

  return (
    <div className="min-h-screen py-16 px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-5 mb-10">
          <Link href="/" className="p-3 rounded-xl bg-white hover:bg-gray-100 transition-colors border border-gray-200">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-semibold text-gray-900">排行榜</h1>
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          {gameTabs.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`px-5 py-3 rounded-xl text-base font-medium transition-all ${
                selectedGame === game.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="mr-2">{game.icon}</span>
              {game.name}
            </button>
          ))}
        </div>

        <div className="glass-card">
          {leaderboard.length === 0 ? (
            <div className="py-20 text-center">
              <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-5" />
              <p className="text-xl text-gray-500">暂无记录</p>
              <p className="text-base text-gray-400 mt-2">成为第一个上榜的玩家吧！</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {leaderboard.map((entry) => (
                <div key={`${entry.nickname}-${entry.timestamp}`} className="flex items-center gap-5 px-6 py-5 hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold ${getRankStyle(entry.rank)}`}>
                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg text-gray-900 truncate">{entry.nickname}</p>
                    <p className="text-base text-gray-400">
                      {new Date(entry.timestamp).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-500">{entry.score.toLocaleString()}</p>
                    <p className="text-base text-gray-400">分</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
