'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getTopScores } from '@/lib/storage';
import { GameInfo, GameType } from '@/types';
import { 
  Grid3X3, 
  Trophy, 
  Zap, 
  Clock, 
  ChevronRight,
  Sparkles,
  Gamepad2,
  Users
} from 'lucide-react';

const games: GameInfo[] = [
  {
    id: 'tetris',
    title: '俄罗斯方块',
    description: '经典方块消除游戏',
    icon: '🧱',
    path: '/game/tetris',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'snake',
    title: '贪吃蛇',
    description: '控制蛇吃掉食物',
    icon: '🐍',
    path: '/game/snake',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'breakout',
    title: '打砖块',
    description: '反弹小球击碎砖块',
    icon: '🎯',
    path: '/game/breakout',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'memory',
    title: '记忆翻牌',
    description: '翻转卡牌找配对',
    icon: '🃏',
    path: '/game/memory',
    color: 'from-purple-500 to-violet-500',
  },
];

const gameNames: Record<GameType, string> = {
  tetris: '俄罗斯方块',
  snake: '贪吃蛇',
  breakout: '打砖块',
  memory: '记忆翻牌',
};

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  
  const leaderboardPreview = games.map(game => {
    const topScores = getTopScores(game.id, 1);
    return {
      gameId: game.id,
      gameName: game.title,
      topPlayer: topScores[0] || null,
    };
  });

  return (
    <div className="min-h-screen">
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-500/5 rounded-full blur-[120px] animate-pulse" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>经典游戏 全新体验</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">游戏中心</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            集合多款经典小游戏，随时随地享受游戏乐趣
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={games[0].path}
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold text-lg hover:opacity-90 transition-all duration-300 flex items-center gap-2"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>开始游戏</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/leaderboard"
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
            >
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>查看排行榜</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">游戏列表</h2>
              <p className="text-gray-400">选择你喜欢的小游戏开始挑战</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-cyan-400">
              <Zap className="w-5 h-5" />
              <span>共 {games.length} 款游戏</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <Link
                key={game.id}
                href={game.path}
                className="group relative p-6 rounded-2xl glass-card hover:border-pink-500/50 transition-all duration-500 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`} />
                
                <div className="relative">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {game.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-pink-400 transition-colors">
                    {game.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4">
                    {game.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-pink-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>开始游戏</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-b from-transparent via-pink-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">排行榜预览</h2>
              <p className="text-gray-400">各游戏最高分玩家</p>
            </div>
            <Link
              href="/leaderboard"
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>查看完整排行榜</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {leaderboardPreview.map((item, index) => (
              <div
                key={item.gameId}
                className="p-6 rounded-xl glass-card border border-white/10 hover:border-yellow-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">{item.gameName}</p>
                    <p className="font-bold">冠军榜</p>
                  </div>
                </div>
                
                {item.topPlayer ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-400 font-bold">👑</span>
                      <span className="text-white font-semibold truncate max-w-[150px]">
                        {item.topPlayer.nickname}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-400">
                      <span className="text-sm">最高分</span>
                      <span className="font-bold">{item.topPlayer.score.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">暂无记录</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">准备好挑战了吗？</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            登录后可以保存你的分数，记录游戏历史，与其他玩家竞争排名
          </p>
          
          {isAuthenticated ? (
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
              <Users className="w-5 h-5" />
              <span>已登录，开始游戏吧！</span>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold text-lg hover:opacity-90 transition-all duration-300"
              >
                立即注册
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300"
              >
                已有账号？登录
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
