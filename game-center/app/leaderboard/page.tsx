'use client';

import { useState, useEffect } from 'react';
import { getLeaderboard } from '@/lib/storage';
import { GameType, LeaderboardEntry } from '@/types';
import { Trophy, Medal, Crown, ArrowLeft } from 'lucide-react';
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/50';
      case 2:
        return 'from-gray-400/10 to-gray-500/10 border-gray-400/30';
      case 3:
        return 'from-amber-600/10 to-amber-700/10 border-amber-600/30';
      default:
        return 'glass-card border-white/5';
    }
  };

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
          <div>
            <h1 className="text-4xl font-bold text-gradient">排行榜</h1>
            <p className="text-gray-400 mt-1">查看各游戏的最高分玩家</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {gameTabs.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedGame === game.id
                  ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white'
                  : 'glass-card hover:bg-white/10 text-gray-300'
              }`}
            >
              <span className="mr-2">{game.icon}</span>
              {game.name}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {leaderboard.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">暂无记录</p>
              <p className="text-gray-500 text-sm mt-2">成为第一个上榜的玩家吧！</p>
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <div
                key={`${entry.nickname}-${entry.timestamp}`}
                className={`p-4 rounded-xl border ${getRankBg(entry.rank)} transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg truncate">{entry.nickname}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(entry.timestamp).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-cyan-400">
                      {entry.score.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">分</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {leaderboard.length > 0 && (
          <div className="mt-8 p-6 rounded-xl glass-card border border-white/10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>上榜条件</span>
            </h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span>登录账号后玩游戏，分数会自动记录并更新排行榜</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span>每位玩家在每个游戏中只保留最高分记录</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span>排行榜显示前100名玩家</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
