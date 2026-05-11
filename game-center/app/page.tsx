'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getTopScores } from '@/lib/storage';
import { GameInfo } from '@/types';
import { ChevronRight, Sparkles, Trophy, Zap, Crown } from 'lucide-react';

const games: GameInfo[] = [
  { id: 'tetris', title: '俄罗斯方块', description: '经典方块消除', icon: '🧱', path: '/game/tetris', color: 'from-rose-400 to-pink-500' },
  { id: 'snake', title: '贪吃蛇', description: '控制蛇吃食物', icon: '🐍', path: '/game/snake', color: 'from-emerald-400 to-teal-500' },
  { id: 'breakout', title: '打砖块', description: '反弹球击碎砖块', icon: '🎯', path: '/game/breakout', color: 'from-blue-400 to-cyan-500' },
  { id: 'memory', title: '记忆翻牌', description: '翻转卡牌配对', icon: '🃏', path: '/game/memory', color: 'from-violet-400 to-purple-500' },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  const leaderboardPreview = games.map(game => ({
    gameId: game.id,
    gameName: game.title,
    topPlayer: getTopScores(game.id, 1)[0] || null,
  }));

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>精选经典游戏</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
              游戏中心
            </h1>
            
            <p className="text-gray-500 mb-8">
              随时随地享受游戏乐趣
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={games[0].path}
                className="px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                开始游戏
              </Link>
              <Link
                href="/leaderboard"
                className="px-6 py-3 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors border border-gray-200 flex items-center gap-2"
              >
                <Trophy className="w-5 h-5 text-amber-500" />
                排行榜
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">游戏列表</h2>
            <span className="text-sm text-gray-500">{games.length} 款游戏</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {games.map((game) => (
              <Link
                key={game.id}
                href={game.path}
                className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl mb-3`}>
                  {game.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-500 transition-colors">
                  {game.title}
                </h3>
                <p className="text-sm text-gray-500">{game.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">排行榜</h2>
            <Link href="/leaderboard" className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {leaderboardPreview.map((item) => (
              <div key={item.gameId} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-700">{item.gameName}</span>
                </div>
                {item.topPlayer ? (
                  <div>
                    <p className="text-sm text-gray-500 truncate">{item.topPlayer.nickname}</p>
                    <p className="text-lg font-bold text-blue-500">{item.topPlayer.score.toLocaleString()} 分</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">暂无记录</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          {isAuthenticated ? (
            <p className="text-gray-600">已登录，开始游戏吧！</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register" className="px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors">
                立即注册
              </Link>
              <Link href="/login" className="px-6 py-3 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors border border-gray-200">
                登录
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
