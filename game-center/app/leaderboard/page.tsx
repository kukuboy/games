'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLeaderboard } from '@/lib/storage';
import { GameType, LeaderboardEntry } from '@/types';

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
    setLeaderboard(getLeaderboard(selectedGame).entries);
  }, [selectedGame]);

  return (
    <div className="min-h-screen pb-12">
      <div className="pt-28 px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="clay-button py-2 px-4 text-sm">← 返回</Link>
            <h1 className="text-xl font-semibold">排行榜</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {gameTabs.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`clay-button py-2 px-4 text-sm whitespace-nowrap ${
                  selectedGame === game.id 
                    ? 'clay-button-primary' 
                    : ''
                }`}
              >
                {game.icon} {game.name}
              </button>
            ))}
          </div>

          <div className="clay-card">
            {leaderboard.length === 0 ? (
              <div className="py-12 text-center">
                <p className="opacity-50">还没有记录</p>
                <p className="text-sm opacity-40 mt-1">成为第一个上榜的玩家吧！</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div key={`${entry.nickname}-${entry.timestamp}`} className="flex items-center justify-between py-3 px-4 rounded-xl bg-[var(--bg)]">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        i === 0 ? 'bg-amber-200 text-amber-700' :
                        i === 1 ? 'bg-gray-200 text-gray-600' :
                        i === 2 ? 'bg-orange-200 text-orange-600' :
                        'bg-[var(--surface)]'
                      }`}>
                        {i + 1}
                      </div>
                      <span className="font-medium">{entry.nickname}</span>
                    </div>
                    <span className="font-semibold text-lg">{entry.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
