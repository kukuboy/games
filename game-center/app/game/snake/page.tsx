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
  const [gameKey, setGameKey] = useState(0);

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
    ctx.fillStyle = '#e8e4e0';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    currentSnake.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? '#7c9eb2' : '#9fc5e8';
      ctx.fillRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    });

    ctx.fillStyle = '#e6a4b4';
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

  const handleStartGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setLocalScore(0);
    setGameOver(false);
    setShowGameOver(false);
    setGameStatus('playing');
    setGameKey(prev => prev + 1);
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

      if (newHead.x === food.x && newHead.y === food.y) {
        setLocalScore(prev => prev + 10);
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
    <div className="min-h-screen pb-12" key={gameKey}>
      <div className="pt-28 px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="clay-button py-2 px-4 text-sm">← 返回</Link>
            <h1 className="text-xl font-semibold">贪吃蛇</h1>
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
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              className="rounded-2xl shadow-lg"
            />
            
            {showGameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
                <div className="clay-card text-center">
                  <p className="text-sm opacity-50 mb-2">游戏结束</p>
                  <p className="text-2xl font-semibold mb-4">{score}</p>
                  <button onClick={handleStartGame} className="clay-button clay-button-primary">
                    再来一局
                  </button>
                </div>
              </div>
            )}

            {gameStatus === 'idle' && !showGameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
                <button onClick={handleStartGame} className="clay-button clay-button-primary">
                  开始游戏
                </button>
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
          <button onClick={handleStartGame} className="clay-button py-2 px-4 text-sm">
            重新开始
          </button>
        </div>
      </div>
    </div>
  );
}
