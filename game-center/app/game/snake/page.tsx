'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';

const GRID_SIZE = 20;
const CELL_SIZE = 18;

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isAuthenticated } = useAuth();
  const { saveScore, gameStatus, setGameStatus } = useGame();
  
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [score, setLocalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

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
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, ctx.canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(ctx.canvas.width, i * CELL_SIZE);
      ctx.stroke();
    }

    currentSnake.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? '#111' : '#555';
      ctx.fillRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    });

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(currentFood.x * CELL_SIZE + CELL_SIZE / 2, currentFood.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 3, 0, Math.PI * 2);
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
    setGameStatus('playing');
    lastMoveRef.current = Date.now();
  }, [generateFood, setGameStatus]);

  useEffect(() => {
    if (gameStatus !== 'playing' || gameOver) return;
    const speed = 150;

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

      if (gameStatus === 'playing' && !gameOver) {
        gameLoopRef.current = setTimeout(loop, 16);
      }
    };

    gameLoopRef.current = setTimeout(loop, 16);
    return () => { if (gameLoopRef.current) clearTimeout(gameLoopRef.current); };
  }, [gameStatus, snake, food, score, nextDirection, gameOver, checkCollision, generateFood, isAuthenticated, saveScore, setGameStatus]);

  return (
    <div className="min-h-screen pt-24 px-5">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-xs text-zinc-500 hover:text-black">← 返回</Link>
          <h1 className="text-xl">贪吃蛇</h1>
          <div className="text-sm">{score}</div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
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
