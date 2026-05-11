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

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const ballRef = useRef(ball);
  const paddleRef = useRef(paddleX);

  useEffect(() => { paddleRef.current = paddleX; }, [paddleX]);
  useEffect(() => { ballRef.current = ball; }, [ball]);

  const createBricks = useCallback(() => {
    const brickWidth = (CANVAS_WIDTH - 40) / BRICK_COLS;
    const newBricks: Brick[] = [];
    const colors = ['#e6a4b4', '#f9cb9c', '#ffe599', '#b4a7d6', '#9fc5e8'];
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
    ctx.fillStyle = '#e8e4e0';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    currentBricks.forEach(brick => {
      if (!brick.active) return;
      ctx.fillStyle = '#f5f2ef';
      ctx.beginPath();
      ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
      ctx.fill();
      ctx.strokeStyle = brick.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.fillStyle = '#7c9eb2';
    ctx.beginPath();
    ctx.roundRect(currentPaddleX, CANVAS_HEIGHT - 30, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
    ctx.fill();

    ctx.fillStyle = '#e6a4b4';
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
        setGameOver(true);
        setShowGameOver(true);
        setGameStatus('gameover');
        if (isAuthenticated) saveScore(score, 'breakout');
        return;
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
  }, [gameStatus, bricks, score, gameOver, isAuthenticated, saveScore, createBricks, setGameStatus]);

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
    <div className="min-h-screen pb-12">
      <div className="pt-28 px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="clay-button py-2 px-4 text-sm">← 返回</Link>
            <h1 className="text-xl font-semibold">打砖块</h1>
            <div className="clay-card py-2 px-4">
              <span className="text-lg font-semibold">{score}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="max-w-2xl mx-auto flex justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onMouseMove={handleMouseMove}
              className="rounded-2xl shadow-lg cursor-pointer"
            />
            
            {showGameOver && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="clay-card text-center">
                  <p className="text-sm opacity-50 mb-2">游戏结束</p>
                  <p className="text-2xl font-semibold mb-4">{score}</p>
                  <button onClick={startGame} className="clay-button clay-button-primary">
                    再来一局
                  </button>
                </div>
              </div>
            )}

            {gameStatus === 'idle' && !showGameOver && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="clay-card">
                  <button onClick={startGame} className="clay-button clay-button-primary">
                    开始游戏
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-6 flex justify-center gap-4">
          {gameStatus === 'playing' && (
            <button onClick={() => setGameStatus('paused')} className="clay-button py-2 px-4 text-sm">
              暂停
            </button>
          )}
          {gameStatus === 'paused' && (
            <button onClick={() => setGameStatus('playing')} className="clay-button py-2 px-4 text-sm">
              继续
            </button>
          )}
          <button onClick={startGame} className="clay-button py-2 px-4 text-sm">
            重新开始
          </button>
        </div>
      </div>
    </div>
  );
}
