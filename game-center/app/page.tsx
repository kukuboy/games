'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getTopScores } from '@/lib/storage';
import { GameInfo } from '@/types';
import { ChevronRight, Sparkles, Trophy, Star, Zap, Crown } from 'lucide-react';

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
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-base font-medium mb-10 animate-in">
            <Sparkles className="w-5 h-5" />
            <span>精选经典游戏</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6 tracking-tight animate-in animation-delay-100">
            轻松游戏
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent"> 快乐生活</span>
          </h1>
          
          <p className="text-xl text-gray-500 mb-12 max-w-lg mx-auto animate-in animation-delay-200">
            精选经典小游戏，随时随地享受游戏乐趣
          </p>
          
          <div className="flex flex-wrap justify-center gap-5 animate-in animation-delay-300">
            <Link
              href={games[0].path}
              className="btn-primary flex items-center gap-2.5 text-base"
            >
              <Zap className="w-5 h-5" />
              开始游戏
            </Link>
            <Link
              href="/leaderboard"
              className="btn-secondary flex items-center gap-2.5 text-base"
            >
              <Trophy className="w-5 h-5 text-amber-500" />
              查看排行榜
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-3">游戏列表</h2>
              <p className="text-lg text-gray-500">选择你喜欢的小游戏开始挑战</p>
            </div>
            <div className="hidden md:flex items-center gap-2.5 text-blue-500">
              <Star className="w-5 h-5" />
              <span className="text-base font-medium">{games.length} 款精选游戏</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <Link
                key={game.id}
                href={game.path}
                className="glass-card group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-4xl mb-6 transition-transform duration-300 group-hover:scale-110`}>
                  {game.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2.5 group-hover:text-blue-500 transition-colors">
                  {game.title}
                </h3>
                <p className="text-base text-gray-500 mb-5">{game.description}</p>
                <div className="flex items-center gap-1.5 text-blue-500 text-base font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>开始游戏</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-3">排行榜预览</h2>
              <p className="text-lg text-gray-500">各游戏最高分玩家</p>
            </div>
            <Link href="/leaderboard" className="text-blue-500 hover:text-blue-600 flex items-center gap-1.5 text-base font-medium">
              查看全部 <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {leaderboardPreview.map((item) => (
              <div key={item.gameId} className="glass-card">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-base text-gray-500">{item.gameName}</p>
                    <p className="font-semibold text-gray-900 text-lg">冠军</p>
                  </div>
                </div>
                {item.topPlayer ? (
                  <div>
                    <p className="text-base font-semibold text-gray-800 truncate">{item.topPlayer.nickname}</p>
                    <p className="text-2xl font-bold text-blue-500">{item.topPlayer.score.toLocaleString()} <span className="text-base text-gray-400 font-normal">分</span></p>
                  </div>
                ) : (
                  <p className="text-base text-gray-400">暂无记录</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-5">准备好挑战了吗？</h2>
          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
            登录后可以保存分数，记录游戏历史，与其他玩家竞争排名
          </p>
          {isAuthenticated ? (
            <div className="inline-flex items-center gap-2.5 px-6 py-4 rounded-xl bg-green-50 border border-green-100 text-green-600 text-lg font-medium">
              <Star className="w-6 h-6" />
              <span>已登录，开始游戏吧！</span>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-5">
              <Link href="/register" className="btn-primary text-base">
                立即注册
              </Link>
              <Link href="/login" className="btn-secondary text-base">
                已有账号？登录
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
