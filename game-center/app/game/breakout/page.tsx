'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const BALL_RADIUS = 6;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_HEIGHT = 20;

type Brick = { x: number; y: number; width: number; height: number; color: string; points: number; active: boolean };
type Ball = { x: number; y: number; dx: number; dy: number };

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isAuthenticated } = useAuth();
  const { saveScore, gameStatus, setGameStatus } = useGame();

  const [paddleX, setPaddleX] = useState(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [ball, setBall] = useState<Ball>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 80, dx: 4, dy: -4 });
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [score, setLocalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [lives, setLives] = useState(3);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const ballRef = useRef(ball);
  const paddleRef = useRef(paddleX);

  useEffect(() => { paddleRef.current = paddleX; }, [paddleX]);
  useEffect(() => { ballRef.current = ball; }, [ball]);

  const createBricks = useCallback(() => {
    const brickWidth = (CANVAS_WIDTH - 40) / BRICK_COLS;
    const newBricks: Brick[] = [];
    const colors = ['#ef4444', '#f97316', '#fbbf24', '#22c55e', '#3b82f6'];
    const points = [50, 40, 30, 20, 10];

    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        newBricks.push({
          x: 20 + col * (brickWidth + 4),
          y: 50 + row * (BRICK_HEIGHT + 4),
          width: brickWidth,
          height: BRICK_HEIGHT,
          color: colors[row],
          points: points[row],
          active: true,
        });
      }
    }
    return newBricks;
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, currentPaddleX: number, currentBall: Ball, currentBricks: Brick[]) => {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    currentBricks.forEach(brick => {
      if (!brick.active) return;
      ctx.fillStyle = brick.color;
      ctx.beginPath();
      ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
      ctx.fill();
    });

    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.roundRect(currentPaddleX, CANVAS_HEIGHT - 30, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(currentBall.x, currentBall.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    draw(ctx, paddleX, ball, bricks);
  }, [paddleX, ball, bricks, draw]);

  const startGame = useCallback(() => {
    setBricks(createBricks());
    setBall({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 80, dx: 4, dy: -4 });
    setPaddleX(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
    setLocalScore(0);
    setLives(3);
    setGameOver(false);
    setShowGameOver(false);
    setGameStatus('playing');
  }, [createBricks, setGameStatus]);

  useEffect(() => {
    if (gameStatus !== 'playing' || gameOver) return;

    const loop = () => {
      let currentBall = ballRef.current;
      let currentPaddle = paddleRef.current;
      let currentScore = score;
      let currentBricks = [...bricks];
      let currentLives = lives;

      currentBall.x += currentBall.dx;
      currentBall.y += currentBall.dy;

      if (currentBall.x + BALL_RADIUS > CANVAS_WIDTH || currentBall.x - BALL_RADIUS < 0) {
        currentBall.dx = -currentBall.dx;
      }
      if (currentBall.y - BALL_RADIUS < 0) {
        currentBall.dy = -currentBall.dy;
      }

      if (
        currentBall.y + BALL_RADIUS > CANVAS_HEIGHT - 30 &&
        currentBall.y < CANVAS_HEIGHT - 30 + PADDLE_HEIGHT &&
        currentBall.x > currentPaddle &&
        currentBall.x < currentPaddle + PADDLE_WIDTH
      ) {
        currentBall.dy = -Math.abs(currentBall.dy);
      }

      if (currentBall.y + BALL_RADIUS > CANVAS_HEIGHT) {
        currentLives--;
        setLives(currentLives);
        if (currentLives <= 0) {
          setGameOver(true);
          setShowGameOver(true);
          setGameStatus('gameover');
          if (isAuthenticated) saveScore(score, 'breakout');
          return;
        } else {
          currentBall = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 80, dx: 4, dy: -4 };
          setBall(currentBall);
        }
      }

      for (let i = 0; i < currentBricks.length; i++) {
        const brick = currentBricks[i];
        if (!brick.active) continue;
        if (
          currentBall.x + BALL_RADIUS > brick.x &&
          currentBall.x - BALL_RADIUS < brick.x + brick.width &&
          currentBall.y + BALL_RADIUS > brick.y &&
          currentBall.y - BALL_RADIUS < brick.y + brick.height
        ) {
          brick.active = false;
          currentScore += brick.points;
          setLocalScore(currentScore);
          currentBall.dy = -currentBall.dy;
          break;
        }
      }

      if (currentBricks.every(b => !b.active)) {
        setBricks(createBricks());
      }

      setBall(currentBall);
      setBricks(currentBricks);

      if (gameStatus === 'playing' && !gameOver) {
        gameLoopRef.current = setTimeout(loop, 16);
      }
    };

    gameLoopRef.current = setTimeout(loop, 16);
    return () => { if (gameLoopRef.current) clearTimeout(gameLoopRef.current); };
  }, [gameStatus, bricks, score, lives, gameOver, isAuthenticated, saveScore, createBricks, setGameStatus]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStatus !== 'playing' || gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setPaddleX(Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2)));
  }, [gameStatus, gameOver]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameStatus !== 'playing' || gameOver) return;
    if (e.key === 'ArrowLeft') setPaddleX(prev => Math.max(0, prev - 20));
    if (e.key === 'ArrowRight') setPaddleX(prev => Math.min(CANVAS_WIDTH - PADDLE_WIDTH, prev + 20));
  }, [gameStatus, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen py-8 px-4 bg-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="p-2 rounded-lg bg-white hover:bg-slate-200 transition-colors border border-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">打砖块</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onMouseMove={handleMouseMove}
              className="rounded-lg border-2 border-slate-300 shadow-lg bg-slate-800 cursor-pointer"
            />

            {showGameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 rounded-lg">
                <div className="text-center p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">游戏结束</h2>
                  <p className="text-xl text-indigo-400 mb-2">得分: {score}</p>
                  <p className="text-sm text-slate-400 mb-4">剩余生命: {lives}</p>
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
              <p className="text-xs text-slate-500 mb-1">剩余生命</p>
              <p className="text-2xl font-bold text-slate-700">{'❤️'.repeat(lives)}</p>
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
