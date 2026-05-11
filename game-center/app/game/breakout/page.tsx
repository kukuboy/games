'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
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

type Brick = { x: number; y: number; width: number; height: number; points: number; active: boolean };
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
    const points = [50, 40, 30, 20, 10];

    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        newBricks.push({
          x: 20 + col * (brickWidth + 4),
          y: 50 + row * (BRICK_HEIGHT + 4),
          width: brickWidth,
          height: BRICK_HEIGHT,
          points: points[row],
          active: true,
        });
      }
    }
    return newBricks;
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, currentPaddleX: number, currentBall: Ball, currentBricks: Brick[]) => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    currentBricks.forEach(brick => {
      if (!brick.active) return;
      ctx.fillStyle = '#333';
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    });

    ctx.fillStyle = '#111';
    ctx.fillRect(currentPaddleX, CANVAS_HEIGHT - 30, PADDLE_WIDTH, PADDLE_HEIGHT);

    ctx.fillStyle = '#111';
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
    <div className="min-h-screen pt-24 px-5">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-xs text-zinc-500 hover:text-black">← 返回</Link>
          <h1 className="text-xl">打砖块</h1>
          <div className="text-sm">{score}</div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onMouseMove={handleMouseMove}
              className="border border-zinc-200"
            />
            
            {showGameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/95">
                <div className="text-center">
                  <p className="text-sm text-zinc-500 mb-2">游戏结束</p>
                  <p className="text-2xl font-medium mb-4">{score}</p>
                  <button onClick={startGame} className="text-sm text-black border-b border-black pb-0.5">
                    再来一局
                  </button>
                </div>
              </div>
            )}

            {gameStatus === 'idle' && !showGameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/95">
                <button onClick={startGame} className="text-sm text-black border-b border-black pb-0.5">
                  开始
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {gameStatus === 'playing' && (
            <button onClick={() => setGameStatus('paused')} className="text-sm text-zinc-500 hover:text-black">
              暂停
            </button>
          )}
          {gameStatus === 'paused' && (
            <button onClick={() => setGameStatus('playing')} className="text-sm text-zinc-500 hover:text-black">
              继续
            </button>
          )}
          <button onClick={startGame} className="text-sm text-zinc-500 hover:text-black">
            重新开始
          </button>
        </div>
      </div>
    </div>
  );
}
