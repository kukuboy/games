'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';

const GRID_SIZE = 20;
const CELL_SIZE = 18;
const INITIAL_SPEED = 150;

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isAuthenticated } = useAuth();
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
      newFood = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const checkCollision = useCallback((head: Position, snakeBody: Position[]): boolean => {
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) return true;
    for (let i = 1; i < snakeBody.length; i++) {
      if (head.x === snakeBody[i].x && head.y === snakeBody[i].y) return true;
    }
    return false;
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, currentSnake: Position[], currentFood: Position) => {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    currentSnake.forEach((segment, i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead ? '#22c55e' : '#4ade80';
      ctx.beginPath();
      ctx.roundRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4, 4);
      ctx.fill();
    });

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(currentFood.x * CELL_SIZE + CELL_SIZE / 2, currentFood.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver || gameStatus !== 'playing') return;
    switch (e.key) {
      case 'ArrowUp': if (direction !== 'DOWN') setNextDirection('UP'); break;
      case 'ArrowDown': if (direction !== 'UP') setNextDirection('DOWN'); break;
      case 'ArrowLeft': if (direction !== 'RIGHT') setNextDirection('LEFT'); break;
      case 'ArrowRight': if (direction !== 'LEFT') setNextDirection('RIGHT'); break;
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
        case 'UP': newHead = { x: head.x, y: head.y - 1 }; break;
        case 'DOWN': newHead = { x: head.x, y: head.y + 1 }; break;
        case 'LEFT': newHead = { x: head.x - 1, y: head.y }; break;
        case 'RIGHT': newHead = { x: head.x + 1, y: head.y }; break;
      }

      if (checkCollision(newHead, currentSnake)) {
        setGameOver(true);
        setShowGameOver(true);
        setGameStatus('gameover');
        if (isAuthenticated) saveScore(score, 'snake');
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
    return () => { if (gameLoopRef.current) clearTimeout(gameLoopRef.current); };
  }, [gameStatus, snake, food, score, nextDirection, gameOver, gameStarted, checkCollision, generateFood, isAuthenticated, saveScore, setGameStatus, setScore]);

  return (
    <div className="min-h-screen py-8 px-4 bg-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="p-2 rounded-lg bg-white hover:bg-slate-200 transition-colors border border-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">贪吃蛇</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              className="rounded-lg border-2 border-slate-300 shadow-lg bg-slate-800"
            />

            {showGameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 rounded-lg">
                <div className="text-center p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">游戏结束</h2>
                  <p className="text-xl text-indigo-400 mb-4">得分: {score}</p>
                  <button onClick={startGame} className="px-5 py-2 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors flex items-center gap-2 mx-auto">
                    <RotateCcw className="w-4 h-4" /> 再来一局
                  </button>
                </div>
              </div>
            )}

            {gameStatus === 'idle' && !showGameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 rounded-lg">
                <button onClick={startGame} className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors flex items-center gap-2">
                  <Play className="w-5 h-5" /> 开始游戏
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 w-full max-w-[200px]">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">当前分数</p>
              <p className="text-2xl font-bold text-indigo-500">{score}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">蛇长度</p>
              <p className="text-2xl font-bold text-slate-700">{snake.length}</p>
            </div>

            <div className="flex gap-2">
              {gameStatus === 'playing' && (
                <button onClick={() => setGameStatus('paused')} className="flex-1 py-2 rounded-lg bg-amber-100 text-amber-600 border border-amber-200 hover:bg-amber-200 transition-colors">
                  <Pause className="w-4 h-4 mx-auto" />
                </button>
              )}
              {gameStatus === 'paused' && (
                <button onClick={() => setGameStatus('playing')} className="flex-1 py-2 rounded-lg bg-green-100 text-green-600 border border-green-200 hover:bg-green-200 transition-colors">
                  <Play className="w-4 h-4 mx-auto" />
                </button>
              )}
              <button onClick={startGame} className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors">
                <RotateCcw className="w-4 h-4 mx-auto" />
              </button>
            </div>

            {!isAuthenticated && (
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-sm text-center">
                <p className="text-indigo-500">登录后可保存分数</p>
                <Link href="/login" className="text-indigo-400 hover:text-indigo-600">去登录 →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
