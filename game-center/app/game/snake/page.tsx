'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';

const GRID_SIZE = 20;
const CELL_SIZE = 18;

type Position = { x: number; y: number };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isAuthenticated } = useAuth();
  const { saveScore, gameStatus, setGameStatus } = useGame();
  
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [score, setLocalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const directionRef = useRef(direction);
  const gameOverRef = useRef(false);
  const statusRef = useRef(gameStatus);

  useEffect(() => { statusRef.current = gameStatus; }, [gameStatus]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

  const generateFood = useCallback((currentSnake: Position[]) => {
    let newFood: Position;
    do {
      newFood = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#e8e4e0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    snakeRef.current.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? '#7c9eb2' : '#9fc5e8';
      ctx.fillRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    });

    ctx.fillStyle = '#e6a4b4';
    ctx.beginPath();
    ctx.arc(foodRef.current.x * CELL_SIZE + CELL_SIZE / 2, foodRef.current.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 3, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const startGame = () => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    setLocalScore(0);
    setGameOver(false);
    setGameStatus('playing');
    setIsStarted(true);
  };

  useEffect(() => {
    if (!isStarted || statusRef.current !== 'playing' || gameOverRef.current) return;

    const gameLoop = setInterval(() => {
      if (statusRef.current !== 'playing' || gameOverRef.current) return;

      const currentSnake = snakeRef.current;
      const currentFood = foodRef.current;
      const currentDirection = directionRef.current;
      const head = currentSnake[0];
      let newHead: Position;

      switch (currentDirection) {
        case 'UP': newHead = { x: head.x, y: head.y - 1 }; break;
        case 'DOWN': newHead = { x: head.x, y: head.y + 1 }; break;
        case 'LEFT': newHead = { x: head.x - 1, y: head.y }; break;
        case 'RIGHT': newHead = { x: head.x + 1, y: head.y }; break;
      }

      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        setGameStatus('gameover');
        if (isAuthenticated) saveScore(score, 'snake');
        return;
      }

      for (let i = 1; i < currentSnake.length; i++) {
        if (newHead.x === currentSnake[i].x && newHead.y === currentSnake[i].y) {
          setGameOver(true);
          setGameStatus('gameover');
          if (isAuthenticated) saveScore(score, 'snake');
          return;
        }
      }

      let newSnake = [newHead, ...currentSnake];

      if (newHead.x === currentFood.x && newHead.y === currentFood.y) {
        setLocalScore(prev => prev + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake = newSnake.slice(0, -1);
      }

      setSnake(newSnake);
    }, 150);

    return () => clearInterval(gameLoop);
  }, [isStarted, isAuthenticated, saveScore, generateFood, score]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (statusRef.current !== 'playing' || gameOverRef.current) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (directionRef.current !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (directionRef.current !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (directionRef.current !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    draw();
  }, [snake, food, draw]);

  return (
    <div className="min-h-screen pb-12">
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
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * CELL_SIZE}
            height={GRID_SIZE * CELL_SIZE}
            className="rounded-2xl shadow-lg"
          />
        </div>

        {gameOver && (
          <div className="max-w-2xl mx-auto mt-6">
            <div className="clay-card text-center">
              <p className="text-sm opacity-50 mb-2">游戏结束</p>
              <p className="text-2xl font-semibold mb-4">{score} 分</p>
              <button onClick={startGame} className="clay-button clay-button-primary">
                再来一局
              </button>
            </div>
          </div>
        )}

        {!isStarted && !gameOver && (
          <div className="max-w-2xl mx-auto mt-6 text-center">
            <button onClick={startGame} className="clay-button clay-button-primary">
              开始游戏
            </button>
          </div>
        )}

        {isStarted && !gameOver && (
          <div className="max-w-2xl mx-auto mt-6 flex justify-center gap-4">
            <button onClick={() => setGameStatus('paused')} className="clay-button py-2 px-4 text-sm">
              暂停
            </button>
            <button onClick={startGame} className="clay-button py-2 px-4 text-sm">
              重新开始
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
