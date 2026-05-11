'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, RotateCcw, Trophy, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_HEIGHT = 25;
const BRICK_GAP = 5;

type Brick = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points: number;
  active: boolean;
};

type Ball = {
  x: number;
  y: number;
  dx: number;
  dy: number;
};

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const { saveScore, gameStatus, setGameStatus } = useGame();

  const [paddleX, setPaddleX] = useState(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [ball, setBall] = useState<Ball>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 100, dx: 4, dy: -4 });
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [score, setLocalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [lives, setLives] = useState(3);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const ballRef = useRef(ball);
  const paddleRef = useRef(paddleX);

  useEffect(() => {
    paddleRef.current = paddleX;
  }, [paddleX]);

  useEffect(() => {
    ballRef.current = ball;
  }, [ball]);

  const createBricks = useCallback(() => {
    const brickWidth = (CANVAS_WIDTH - (BRICK_COLS + 1) * BRICK_GAP) / BRICK_COLS;
    const newBricks: Brick[] = [];
    const colors = ['#ff2a6d', '#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1'];
    const points = [50, 40, 30, 20, 10];

    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        newBricks.push({
          x: BRICK_GAP + col * (brickWidth + BRICK_GAP),
          y: 60 + row * (BRICK_HEIGHT + BRICK_GAP),
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
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < CANVAS_WIDTH; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i < CANVAS_HEIGHT; i += 30) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }

    currentBricks.forEach(brick => {
      if (!brick.active) return;

      const gradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
      gradient.addColorStop(0, brick.color);
      gradient.addColorStop(1, adjustColor(brick.color, -30));

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
      ctx.fill();

      ctx.shadowColor = brick.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    const paddleGradient = ctx.createLinearGradient(currentPaddleX, CANVAS_HEIGHT - 40, currentPaddleX, CANVAS_HEIGHT - 40 + PADDLE_HEIGHT);
    paddleGradient.addColorStop(0, '#05d9e8');
    paddleGradient.addColorStop(1, '#0088aa');

    ctx.fillStyle = paddleGradient;
    ctx.beginPath();
    ctx.roundRect(currentPaddleX, CANVAS_HEIGHT - 40, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
    ctx.fill();

    ctx.shadowColor = '#05d9e8';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    const ballGradient = ctx.createRadialGradient(
      currentBall.x - 2, currentBall.y - 2, 0,
      currentBall.x, currentBall.y, BALL_RADIUS
    );
    ballGradient.addColorStop(0, '#ffffff');
    ballGradient.addColorStop(0.5, '#ff2a6d');
    ballGradient.addColorStop(1, '#ff2a6d');

    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(currentBall.x, currentBall.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = '#ff2a6d';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, []);

  const adjustColor = (color: string, amount: number) => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    draw(ctx, paddleX, ball, bricks);
  }, [paddleX, ball, bricks, draw]);

  const startGame = useCallback(() => {
    setBricks(createBricks());
    setBall({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 100, dx: 4, dy: -4 });
    setPaddleX(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
    setLocalScore(0);
    setLives(3);
    setGameOver(false);
    setShowGameOver(false);
    setGameStatus('playing');
  }, [createBricks, setGameStatus]);

  useEffect(() => {
    if (gameStatus !== 'playing' || gameOver) return;

    const brickWidth = (CANVAS_WIDTH - (BRICK_COLS + 1) * BRICK_GAP) / BRICK_COLS;

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
        currentBall.y + BALL_RADIUS > CANVAS_HEIGHT - 40 &&
        currentBall.y - BALL_RADIUS < CANVAS_HEIGHT - 40 + PADDLE_HEIGHT &&
        currentBall.x > currentPaddle &&
        currentBall.x < currentPaddle + PADDLE_WIDTH
      ) {
        currentBall.dy = -Math.abs(currentBall.dy);

        const hitPos = (currentBall.x - currentPaddle) / PADDLE_WIDTH;
        const angle = (hitPos - 0.5) * Math.PI * 0.5;
        const speed = Math.sqrt(currentBall.dx * currentBall.dx + currentBall.dy * currentBall.dy);
        currentBall.dx = speed * Math.sin(angle);
        currentBall.dy = -Math.abs(speed * Math.cos(angle));
      }

      if (currentBall.y + BALL_RADIUS > CANVAS_HEIGHT) {
        currentLives--;
        setLives(currentLives);

        if (currentLives <= 0) {
          setGameOver(true);
          setShowGameOver(true);
          setGameStatus('gameover');
          if (isAuthenticated) {
            saveScore(score, 'breakout');
          }
          return;
        } else {
          currentBall = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 100, dx: 4, dy: -4 };
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

          const overlapLeft = currentBall.x + BALL_RADIUS - brick.x;
          const overlapRight = brick.x + brick.width - (currentBall.x - BALL_RADIUS);
          const overlapTop = currentBall.y + BALL_RADIUS - brick.y;
          const overlapBottom = brick.y + brick.height - (currentBall.y - BALL_RADIUS);

          const minOverlapX = Math.min(overlapLeft, overlapRight);
          const minOverlapY = Math.min(overlapTop, overlapBottom);

          if (minOverlapX < minOverlapY) {
            currentBall.dx = -currentBall.dx;
          } else {
            currentBall.dy = -currentBall.dy;
          }

          break;
        }
      }

      if (currentBricks.every(b => !b.active)) {
        const newBricks = createBricks();
        setBricks(newBricks);
        currentBall.dy = Math.min(currentBall.dy + 0.5, 10);
      }

      setBall(currentBall);
      setBricks(currentBricks);

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
  }, [gameStatus, bricks, score, lives, gameOver, isAuthenticated, saveScore, createBricks, setGameStatus]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStatus !== 'playing' || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newPaddleX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2));
    setPaddleX(newPaddleX);
  }, [gameStatus, gameOver]);

  const handleTouch = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameStatus !== 'playing' || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const newPaddleX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2));
    setPaddleX(newPaddleX);
  }, [gameStatus, gameOver]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameStatus !== 'playing' || gameOver) return;

    const step = 30;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setPaddleX(prev => Math.max(0, prev - step));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setPaddleX(prev => Math.min(CANVAS_WIDTH - PADDLE_WIDTH, prev + step));
    }
  }, [gameStatus, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen py-8 px-4" ref={containerRef}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gradient">打砖块</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouch}
              onTouchStart={handleTouch}
              className="rounded-lg border-2 border-blue-500/50 shadow-lg shadow-blue-500/20 cursor-pointer max-w-full"
            />

            {showGameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
                <div className="text-center p-8">
                  <h2 className="text-4xl font-bold text-red-500 mb-4">游戏结束</h2>
                  <p className="text-2xl text-cyan-400 mb-2">得分: {score}</p>
                  <p className="text-gray-400 mb-6">剩余生命: {lives}</p>
                  <button
                    onClick={startGame}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:opacity-90 transition-all flex items-center gap-2 mx-auto"
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
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-xl hover:opacity-90 transition-all flex items-center gap-3"
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
                <span>剩余生命</span>
              </div>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-2xl ${i < lives ? '' : 'opacity-30'}`}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <p className="text-gray-400 text-sm mb-3 text-center">砖块得分</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#ff2a6d' }}>●</span>
                  <span className="text-gray-400">50分</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#ff6b6b' }}>●</span>
                  <span className="text-gray-400">40分</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#feca57' }}>●</span>
                  <span className="text-gray-400">30分</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#48dbfb' }}>●</span>
                  <span className="text-gray-400">20分</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#1dd1a1' }}>●</span>
                  <span className="text-gray-400">10分</span>
                </div>
              </div>
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
              <p className="text-gray-400 text-sm mb-3 text-center">操作说明</p>
              <p className="text-xs text-gray-500 text-center">
                鼠标/触摸移动控制挡板<br />
                消除所有砖块进入下一关
              </p>
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
