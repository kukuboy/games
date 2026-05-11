'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLeaderboard } from '@/lib/storage';
import { GameType, LeaderboardEntry } from '@/types';

const gameTabs: { id: GameType; name: string }[] = [
  { id: 'tetris', name: '俄罗斯方块' },
  { id: 'snake', name: '贪吃蛇' },
  { id: 'breakout', name: '打砖块' },
  { id: 'memory', name: '记忆翻牌' },
];

export default function LeaderboardPage() {
  const [selectedGame, setSelectedGame] = useState<GameType>('tetris');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setLeaderboard(getLeaderboard(selectedGame).entries);
  }, [selectedGame]);

  return (
    <div className="min-h-screen pt-24 px-5">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl">排行榜</h1>
          <Link href="/" className="text-xs text-zinc-500 hover:text-black">← 返回</Link>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto">
          {gameTabs.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`text-sm shrink-0 ${
                selectedGame === game.id ? 'text-black border-b border-black pb-1' : 'text-zinc-500 hover:text-black'
              }`}
            >
              {game.name}
            </button>
          ))}
        </div>

        {leaderboard.length === 0 ? (
          <p className="text-sm text-zinc-500">还没有记录</p>
        ) : (
          <div className="space-y-0">
            {leaderboard.map((entry, i) => (
              <div key={`${entry.nickname}-${entry.timestamp}`} className="flex items-center justify-between py-3 border-t border-zinc-100">
                <div className="flex items-center gap-4">
                  <span className={`text-xs ${i < 3 ? 'font-medium' : 'text-zinc-400'}`}>
                    {i + 1}
                  </span>
                  <span className="text-sm">{entry.nickname}</span>
                </div>
                <span className="text-sm font-medium">{entry.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
