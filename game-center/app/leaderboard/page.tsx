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
    if (rank === 2) return 'bg-slate-100 text-slate-500';
    if (rank === 3) return 'bg-orange-50 text-orange-500';
    return '';
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-lg bg-white hover:bg-slate-100 transition-colors border border-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">排行榜</h1>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {gameTabs.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedGame === game.id
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="mr-1.5">{game.icon}</span>
              {game.name}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {leaderboard.length === 0 ? (
            <div className="py-16 text-center">
              <Trophy className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">暂无记录</p>
              <p className="text-sm text-slate-400 mt-1">成为第一个上榜的玩家吧！</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {leaderboard.map((entry) => (
                <div key={`${entry.nickname}-${entry.timestamp}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${getRankStyle(entry.rank)}`}>
                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{entry.nickname}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(entry.timestamp).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-indigo-500">{entry.score.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">分</p>
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
