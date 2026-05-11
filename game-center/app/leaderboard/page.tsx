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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">排行榜</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {gameTabs.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedGame === game.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {game.icon} {game.name}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {leaderboard.length === 0 ? (
            <div className="py-16 text-center">
              <Trophy className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">暂无记录</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {leaderboard.map((entry) => (
                <div key={`${entry.nickname}-${entry.timestamp}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-gray-100">
                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{entry.nickname}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-500">{entry.score.toLocaleString()}</p>
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
