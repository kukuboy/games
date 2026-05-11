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
  { shape: [[1, 1, 1, 1]], color: '#111' },
  { shape: [[1, 1], [1, 1]], color: '#333' },
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#555' },
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#777' },
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#999' },
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#bbb' },
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#ddd' },
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
  const [score, setLocalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const lastDropRef = useRef(0);

  const createNewPiece = useCallback(() => PIECES[Math.floor(Math.random() * PIECES.length)], []);

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
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_WIDTH; i++) {
      ctx.beginPath();
      ctx.moveTo(i * BLOCK_SIZE, 0);
      ctx.lineTo(i * BLOCK_SIZE, ctx.canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= GRID_HEIGHT; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * BLOCK_SIZE);
      ctx.lineTo(ctx.canvas.width, i * BLOCK_SIZE);
      ctx.stroke();
    }

    for (let row = 0; row < GRID_HEIGHT; row++) {
      for (let col = 0; col < GRID_WIDTH; col++) {
        if (currentGrid[row][col]) {
          ctx.fillStyle = currentGrid[row][col]!;
          ctx.fillRect(col * BLOCK_SIZE + 2, row * BLOCK_SIZE + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
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
            ctx.fillRect(x + 2, y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
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
    const piece = createNewPiece();
    setGrid(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)));
    setCurrentPiece(piece);
    setCurrentX(Math.floor((GRID_WIDTH - piece.shape[0].length) / 2));
    setCurrentY(0);
    setLocalScore(0);
    setGameOver(false);
    setShowGameOver(false);
    setGameStatus('playing');
    lastDropRef.current = Date.now();
  }, [createNewPiece, setGameStatus]);

  useEffect(() => {
    if (gameStatus !== 'playing' || gameOver || !currentPiece) return;
    const dropInterval = 500;

    const loop = () => {
      const now = Date.now();
      if (now - lastDropRef.current > dropInterval) {
        lastDropRef.current = now;
        if (checkCollision(currentPiece, currentX, currentY + 1, grid)) {
          const newGrid = mergePiece(currentPiece, currentX, currentY, grid);
          const { grid: clearedGrid, linesCleared } = clearLines(newGrid);
          
          if (linesCleared > 0) {
            const lineScores = [0, 100, 300, 500, 800];
            setLocalScore(prev => prev + lineScores[linesCleared]);
          }

          const newPiece = createNewPiece();
          if (checkCollision(newPiece, Math.floor((GRID_WIDTH - newPiece.shape[0].length) / 2), 0, clearedGrid)) {
            setGameOver(true);
            setShowGameOver(true);
            setGameStatus('gameover');
            if (isAuthenticated) saveScore(score, 'tetris');
          } else {
            setGrid(clearedGrid);
            setCurrentPiece(newPiece);
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
  }, [gameStatus, currentPiece, currentX, currentY, grid, gameOver, isAuthenticated, score, createNewPiece, checkCollision, mergePiece, clearLines, saveScore, setGameStatus]);

  return (
    <div className="min-h-screen pt-24 px-5">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-xs text-zinc-500 hover:text-black">← 返回</Link>
          <h1 className="text-xl">俄罗斯方块</h1>
          <div className="text-sm">{score}</div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={GRID_WIDTH * BLOCK_SIZE}
              height={GRID_HEIGHT * BLOCK_SIZE}
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
