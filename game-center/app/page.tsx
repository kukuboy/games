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
    <div className="min-h-screen bg-[#faf9f7]">
      <section className="py-24 px-5">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-medium mb-8 animate-in">
            <Sparkles className="w-4 h-4" />
            <span>精选经典游戏</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-5 tracking-tight animate-in animation-delay-100">
            轻松游戏
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"> 快乐生活</span>
          </h1>
          
          <p className="text-lg text-gray-500 mb-10 max-w-lg mx-auto animate-in animation-delay-200">
            精选经典小游戏，随时随地享受游戏乐趣
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 animate-in animation-delay-300">
            <Link
              href={games[0].path}
              className="btn-primary flex items-center gap-2 text-base"
            >
              <Zap className="w-4 h-4" />
              开始游戏
            </Link>
            <Link
              href="/leaderboard"
              className="btn-secondary flex items-center gap-2 text-base"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              查看排行榜
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-2">游戏列表</h2>
              <p className="text-gray-500">选择你喜欢的小游戏开始挑战</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-orange-500">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">{games.length} 款精选游戏</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {games.map((game, index) => (
              <Link
                key={game.id}
                href={game.path}
                className="group glass-card p-6"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl mb-5 transition-transform duration-300 group-hover:scale-110`}>
                  {game.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">
                  {game.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{game.description}</p>
                <div className="flex items-center gap-1 text-orange-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>开始游戏</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-2">排行榜预览</h2>
              <p className="text-gray-500">各游戏最高分玩家</p>
            </div>
            <Link href="/leaderboard" className="text-orange-500 hover:text-orange-600 flex items-center gap-1 text-sm font-medium">
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {leaderboardPreview.map((item) => (
              <div key={item.gameId} className="glass-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{item.gameName}</p>
                    <p className="font-semibold text-gray-900">冠军</p>
                  </div>
                </div>
                {item.topPlayer ? (
                  <div>
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.topPlayer.nickname}</p>
                    <p className="text-xl font-bold text-orange-500">{item.topPlayer.score.toLocaleString()} <span className="text-sm text-gray-400 font-normal">分</span></p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">暂无记录</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">准备好挑战了吗？</h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">
            登录后可以保存分数，记录游戏历史，与其他玩家竞争排名
          </p>
          {isAuthenticated ? (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-green-50 border border-green-100 text-green-600 text-base font-medium">
              <Star className="w-5 h-5" />
              <span>已登录，开始游戏吧！</span>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
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
