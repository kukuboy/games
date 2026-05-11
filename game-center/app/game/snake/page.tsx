'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, RotateCcw, Trophy, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isAuthenticated, user } = useAuth();
  const { saveScore, setScore, gameStatus, setGameStatus } = useGame();
  
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [score, setLocalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const lastMoveRef = useRef(0);

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const checkCollision = useCallback((head: Position, snakeBody: Position[]): boolean => {
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    for (let i = 1; i < snakeBody.length; i++) {
      if (head.x === snakeBody[i].x && head.y === snakeBody[i].y) {
        return true;
      }
    }
    return false;
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, currentSnake: Position[], currentFood: Position) => {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
    }
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    for (let i = 0; i < currentSnake.length; i++) {
      const segment = currentSnake[i];
      const isHead = i === 0;
      
      const gradient = ctx.createRadialGradient(
        segment.x * CELL_SIZE + CELL_SIZE / 2,
        segment.y * CELL_SIZE + CELL_SIZE / 2,
        0,
        segment.x * CELL_SIZE + CELL_SIZE / 2,
        segment.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2
      );
      
      if (isHead) {
        gradient.addColorStop(0, '#00ff88');
        gradient.addColorStop(1, '#00cc6a');
      } else {
        const alpha = 0.9 - (i / currentSnake.length) * 0.5;
        gradient.addColorStop(0, `rgba(0, 255, 136, ${alpha})`);
        gradient.addColorStop(1, `rgba(0, 200, 100, ${alpha})`);
      }
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(
        segment.x * CELL_SIZE + 2,
        segment.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4,
        4
      );
      ctx.fill();
      
      if (isHead) {
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    ctx.fillStyle = '#ff2a6d';
    ctx.shadowColor = '#ff2a6d';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(
      currentFood.x * CELL_SIZE + CELL_SIZE / 2,
      currentFood.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255, 42, 109, 0.3)';
    ctx.beginPath();
    ctx.arc(
      currentFood.x * CELL_SIZE + CELL_SIZE / 2,
      currentFood.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 + 4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver || gameStatus !== 'playing') return;

    switch (e.key) {
      case 'ArrowUp':
        if (direction !== 'DOWN') setNextDirection('UP');
        break;
      case 'ArrowDown':
        if (direction !== 'UP') setNextDirection('DOWN');
        break;
      case 'ArrowLeft':
        if (direction !== 'RIGHT') setNextDirection('LEFT');
        break;
      case 'ArrowRight':
        if (direction !== 'LEFT') setNextDirection('RIGHT');
        break;
    }
  }, [direction, gameOver, gameStatus]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    draw(ctx, snake, food);
  }, [snake, food, draw]);

  const startGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setLocalScore(0);
    setGameOver(false);
    setShowGameOver(false);
    setGameStarted(true);
    setGameStatus('playing');
    lastMoveRef.current = Date.now();
  }, [generateFood, setGameStatus]);

  useEffect(() => {
    if (gameStatus !== 'playing' || gameOver || !gameStarted) return;

    const speed = Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 10);

    const loop = () => {
      const now = Date.now();
      if (now - lastMoveRef.current < speed) {
        gameLoopRef.current = setTimeout(loop, 16);
        return;
      }
      lastMoveRef.current = now;

      setDirection(nextDirection);
      
      const currentSnake = snake;
      const head = currentSnake[0];
      let newHead: Position;

      switch (nextDirection) {
        case 'UP':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'DOWN':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'LEFT':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'RIGHT':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      if (checkCollision(newHead, currentSnake)) {
        setGameOver(true);
        setShowGameOver(true);
        setGameStatus('gameover');
        if (isAuthenticated) {
          saveScore(score, 'snake');
        }
        return;
      }

      let newSnake = [newHead, ...currentSnake];
      let newFood = food;
      let newScore = score;

      if (newHead.x === food.x && newHead.y === food.y) {
        newScore += 10;
        setLocalScore(newScore);
        newFood = generateFood(newSnake);
        setFood(newFood);
      } else {
        newSnake = newSnake.slice(0, -1);
      }

      setSnake(newSnake);
      setFood(newFood);
      setScore(newScore);

      if (gameStatus === 'playing' && !gameOver) {
        gameLoopRef.current = setTimeout(loop, 16);
      }
    };

    gameLoopRef.current = setTimeout(loop, 16);

    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    };
  }, [gameStatus, snake, food, score, nextDirection, gameOver, gameStarted, checkCollision, generateFood, isAuthenticated, saveScore, setGameStatus, setScore]);

  const handleTouch = (dir: Direction) => {
    if (gameOver || gameStatus !== 'playing') return;
    if (
      (dir === 'UP' && direction !== 'DOWN') ||
      (dir === 'DOWN' && direction !== 'UP') ||
      (dir === 'LEFT' && direction !== 'RIGHT') ||
      (dir === 'RIGHT' && direction !== 'LEFT')
    ) {
      setNextDirection(dir);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gradient">贪吃蛇</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              className="rounded-lg border-2 border-green-500/50 shadow-lg shadow-green-500/20"
            />

            {showGameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
                <div className="text-center p-8">
                  <h2 className="text-4xl font-bold text-red-500 mb-4">游戏结束</h2>
                  <p className="text-2xl text-cyan-400 mb-6">得分: {score}</p>
                  <button
                    onClick={startGame}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold hover:opacity-90 transition-all flex items-center gap-2 mx-auto"
                  >
                    <RotateCcw className="w-5 h-5" />
                    再来一局
                  </button>
                </div>
              </div>
            )}

            {gameStatus === 'idle' && !showGameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
                <button
                  onClick={startGame}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold text-xl hover:opacity-90 transition-all flex items-center gap-3"
                >
                  <Play className="w-6 h-6" />
                  开始游戏
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Zap className="w-4 h-4" />
                <span>当前分数</span>
              </div>
              <p className="text-3xl font-bold text-cyan-400">{score}</p>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Trophy className="w-4 h-4" />
                <span>蛇长度</span>
              </div>
              <p className="text-3xl font-bold text-green-400">{snake.length}</p>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <p className="text-gray-400 text-sm mb-3 text-center">速度</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (INITIAL_SPEED - Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 10)) / INITIAL_SPEED * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">吃食物加速</p>
            </div>

            <div className="flex gap-2">
              {gameStatus === 'playing' && (
                <>
                  <button
                    onClick={() => setGameStatus('paused')}
                    className="flex-1 py-3 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/30 transition-all"
                  >
                    <Pause className="w-5 h-5 mx-auto" />
                  </button>
                  <button
                    onClick={startGame}
                    className="flex-1 py-3 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30 transition-all"
                  >
                    <RotateCcw className="w-5 h-5 mx-auto" />
                  </button>
                </>
              )}
              {gameStatus === 'paused' && (
                <button
                  onClick={() => setGameStatus('playing')}
                  className="flex-1 py-3 rounded-lg bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 transition-all"
                >
                  <Play className="w-5 h-5 mx-auto" />
                </button>
              )}
            </div>

            <div className="glass-card p-4 rounded-xl">
              <p className="text-gray-400 text-sm mb-3 text-center">虚拟摇杆</p>
              <div className="grid grid-cols-3 gap-2">
                <div />
                <button
                  onTouchStart={() => handleTouch('UP')}
                  onClick={() => handleTouch('UP')}
                  className="py-3 rounded-lg bg-white/5 hover:bg-white/10 text-xl active:bg-green-500/30"
                >
                  ↑
                </button>
                <div />
                <button
                  onTouchStart={() => handleTouch('LEFT')}
                  onClick={() => handleTouch('LEFT')}
                  className="py-3 rounded-lg bg-white/5 hover:bg-white/10 text-xl active:bg-green-500/30"
                >
                  ←
                </button>
                <div className="py-3 rounded-lg bg-white/5 text-gray-500 text-xl flex items-center justify-center">
                  ●
                </div>
                <button
                  onTouchStart={() => handleTouch('RIGHT')}
                  onClick={() => handleTouch('RIGHT')}
                  className="py-3 rounded-lg bg-white/5 hover:bg-white/10 text-xl active:bg-green-500/30"
                >
                  →
                </button>
                <div />
                <button
                  onTouchStart={() => handleTouch('DOWN')}
                  onClick={() => handleTouch('DOWN')}
                  className="py-3 rounded-lg bg-white/5 hover:bg-white/10 text-xl active:bg-green-500/30"
                >
                  ↓
                </button>
                <div />
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">桌面端可使用方向键</p>
            </div>

            {!isAuthenticated && (
              <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20 text-sm">
                <p className="text-pink-400 text-center">登录后可保存分数并上榜</p>
                <Link href="/login" className="block mt-2 text-center text-cyan-400 hover:text-cyan-300">
                  去登录 →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
