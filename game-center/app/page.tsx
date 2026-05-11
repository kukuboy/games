'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getTopScores } from '@/lib/storage';
import { GameInfo } from '@/types';
import { ChevronRight, Sparkles, Trophy } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50">
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 mb-4">
            轻松游戏
            <span className="text-gradient ml-2">快乐生活</span>
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto">
            精选经典小游戏，随时随地享受游戏乐趣
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={games[0].path}
              className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              开始游戏
            </Link>
            <Link
              href="/leaderboard"
              className="px-6 py-3 rounded-xl bg-white text-slate-700 font-medium hover:bg-slate-100 transition-colors border border-slate-200"
            >
              查看排行榜
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">游戏列表</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {games.map((game) => (
              <Link
                key={game.id}
                href={game.path}
                className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-105 transition-transform`}>
                  {game.icon}
                </div>
                <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                  {game.title}
                </h3>
                <p className="text-sm text-slate-500">{game.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">排行榜预览</h2>
            <Link href="/leaderboard" className="text-sm text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {leaderboardPreview.map((item) => (
              <div key={item.gameId} className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-slate-600">{item.gameName}</span>
                </div>
                {item.topPlayer ? (
                  <div>
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.topPlayer.nickname}</p>
                    <p className="text-lg font-bold text-indigo-500">{item.topPlayer.score.toLocaleString()} 分</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">暂无记录</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-3">准备好挑战了吗？</h2>
          <p className="text-slate-500 mb-6">
            登录后可以保存分数，记录游戏历史，与其他玩家竞争排名
          </p>
          {isAuthenticated ? (
            <p className="text-indigo-500 font-medium">已登录，开始游戏吧！</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/register" className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors">
                立即注册
              </Link>
              <Link href="/login" className="px-6 py-3 rounded-xl bg-white text-slate-700 font-medium hover:bg-slate-100 transition-colors border border-slate-200">
                登录
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
