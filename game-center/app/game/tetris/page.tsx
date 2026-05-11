'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BLOCK_SIZE = 25;

type Piece = {
  shape: number[][];
  color: string;
};

const PIECES: Piece[] = [
  { shape: [[1, 1, 1, 1]], color: '#6366f1' },
  { shape: [[1, 1], [1, 1]], color: '#fbbf24' },
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#8b5cf6' },
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#3b82f6' },
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#f97316' },
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#10b981' },
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#ef4444' },
];

export default function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isAuthenticated } = useAuth();
  const { saveScore, gameStatus, setGameStatus } = useGame();
  
  const [grid, setGrid] = useState<(string | null)[][]>(() => 
    Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [nextPiece, setNextPiece] = useState<Piece | null>(null);
  const [score, setLocalScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const lastDropRef = useRef(0);

  const createNewPiece = useCallback(() => {
    const randomPiece = PIECES[Math.floor(Math.random() * PIECES.length)];
    const randomNext = PIECES[Math.floor(Math.random() * PIECES.length)];
    return { piece: randomPiece, next: randomNext };
  }, []);

  const checkCollision = useCallback((piece: Piece, x: number, y: number, currentGrid: (string | null)[][]) => {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) return true;
          if (newY >= 0 && currentGrid[newY][newX]) return true;
        }
      }
    }
    return false;
  }, []);

  const mergePiece = useCallback((piece: Piece, x: number, y: number, currentGrid: (string | null)[][]) => {
    const newGrid = currentGrid.map(row => [...row]);
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const newY = y + row;
          const newX = x + col;
          if (newY >= 0 && newY < GRID_HEIGHT && newX >= 0 && newX < GRID_WIDTH) {
            newGrid[newY][newX] = piece.color;
          }
        }
      }
    }
    return newGrid;
  }, []);

  const clearLines = useCallback((currentGrid: (string | null)[][]) => {
    const newGrid = currentGrid.filter(row => row.some(cell => cell === null));
    const clearedCount = GRID_HEIGHT - newGrid.length;
    for (let i = 0; i < clearedCount; i++) {
      newGrid.unshift(Array(GRID_WIDTH).fill(null));
    }
    return { grid: newGrid, linesCleared: clearedCount };
  }, []);

  const rotatePiece = useCallback((piece: Piece) => {
    const rotated = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
    return { ...piece, shape: rotated };
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, currentGrid: (string | null)[][], piece: Piece | null, px: number, py: number) => {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let row = 0; row < GRID_HEIGHT; row++) {
      for (let col = 0; col < GRID_WIDTH; col++) {
        if (currentGrid[row][col]) {
          ctx.fillStyle = currentGrid[row][col]!;
          ctx.fillRect(col * BLOCK_SIZE + 1, row * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
        }
      }
    }

    if (piece && !gameOver) {
      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col]) {
            const x = (px + col) * BLOCK_SIZE;
            const y = (py + row) * BLOCK_SIZE;
            ctx.fillStyle = piece.color;
            ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
          }
        }
      }
    }
  }, [gameOver]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!currentPiece || gameOver || gameStatus !== 'playing') return;
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (!checkCollision(currentPiece, currentX - 1, currentY, grid)) setCurrentX(prev => prev - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (!checkCollision(currentPiece, currentX + 1, currentY, grid)) setCurrentX(prev => prev + 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!checkCollision(currentPiece, currentX, currentY + 1, grid)) setCurrentY(prev => prev + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        const rotated = rotatePiece(currentPiece);
        if (!checkCollision(rotated, currentX, currentY, grid)) setCurrentPiece(rotated);
        break;
    }
  }, [currentPiece, currentX, currentY, grid, gameOver, gameStatus, checkCollision, rotatePiece]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    draw(ctx, grid, currentPiece, currentX, currentY);
  }, [grid, currentPiece, currentX, currentY, draw]);

  const startGame = useCallback(() => {
    const { piece, next } = createNewPiece();
    setGrid(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)));
    setCurrentPiece(piece);
    setNextPiece(next);
    setCurrentX(Math.floor((GRID_WIDTH - piece.shape[0].length) / 2));
    setCurrentY(0);
    setLocalScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setShowGameOver(false);
    setGameStatus('playing');
    lastDropRef.current = Date.now();
  }, [createNewPiece, setGameStatus]);

  useEffect(() => {
    if (gameStatus !== 'playing' || gameOver || !currentPiece) return;
    const dropInterval = Math.max(100, 1000 - (level - 1) * 100);

    const loop = () => {
      const now = Date.now();
      if (now - lastDropRef.current > dropInterval) {
        lastDropRef.current = now;
        if (checkCollision(currentPiece, currentX, currentY + 1, grid)) {
          const newGrid = mergePiece(currentPiece, currentX, currentY, grid);
          const { grid: clearedGrid, linesCleared } = clearLines(newGrid);
          
          if (linesCleared > 0) {
            const lineScores = [0, 100, 300, 500, 800];
            setLocalScore(prev => prev + lineScores[linesCleared] * level);
            setLines(prev => {
              const newLines = prev + linesCleared;
              setLevel(Math.floor(newLines / 10) + 1);
              return newLines;
            });
          }

          const { piece: newPiece } = createNewPiece();
          if (checkCollision(newPiece, Math.floor((GRID_WIDTH - newPiece.shape[0].length) / 2), 0, clearedGrid)) {
            setGameOver(true);
            setShowGameOver(true);
            setGameStatus('gameover');
            if (isAuthenticated) saveScore(score, 'tetris');
          } else {
            setGrid(clearedGrid);
            setCurrentPiece(newPiece);
            setNextPiece(PIECES[Math.floor(Math.random() * PIECES.length)]);
            setCurrentX(Math.floor((GRID_WIDTH - newPiece.shape[0].length) / 2));
            setCurrentY(0);
          }
        } else {
          setCurrentY(prev => prev + 1);
        }
      }
      if (gameStatus === 'playing' && !gameOver) {
        gameLoopRef.current = setTimeout(loop, 16);
      }
    };
    gameLoopRef.current = setTimeout(loop, 16);
    return () => { if (gameLoopRef.current) clearTimeout(gameLoopRef.current); };
  }, [gameStatus, currentPiece, currentX, currentY, grid, level, gameOver, isAuthenticated, score, createNewPiece, checkCollision, mergePiece, clearLines, saveScore, setGameStatus]);

  return (
    <div className="min-h-screen py-8 px-4 bg-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="p-2 rounded-lg bg-white hover:bg-slate-200 transition-colors border border-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">俄罗斯方块</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={GRID_WIDTH * BLOCK_SIZE}
              height={GRID_HEIGHT * BLOCK_SIZE}
              className="rounded-lg border-2 border-slate-300 shadow-lg bg-slate-800"
            />
            
            {showGameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 rounded-lg">
                <div className="text-center p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">游戏结束</h2>
                  <p className="text-xl text-indigo-400 mb-4">得分: {score.toLocaleString()}</p>
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
              <p className="text-xs text-slate-500 mb-1">分数</p>
              <p className="text-2xl font-bold text-indigo-500">{score.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">等级</p>
              <p className="text-2xl font-bold text-slate-700">{level}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">消除行数</p>
              <p className="text-2xl font-bold text-slate-700">{lines}</p>
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
