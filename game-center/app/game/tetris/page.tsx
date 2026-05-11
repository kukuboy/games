'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
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
  { shape: [[1, 1, 1, 1]], color: '#7c9eb2' },
  { shape: [[1, 1], [1, 1]], color: '#e6a4b4' },
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#b4a7d6' },
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#9fc5e8' },
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#f9cb9c' },
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#a8d8a8' },
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#f4a4a4' },
];

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

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
  const [gameKey, setGameKey] = useState(0);

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
    ctx.fillStyle = '#e8e4e0';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let row = 0; row < GRID_HEIGHT; row++) {
      for (let col = 0; col < GRID_WIDTH; col++) {
        if (currentGrid[row][col]) {
          ctx.fillStyle = currentGrid[row][col]!;
          drawRoundedRect(ctx, col * BLOCK_SIZE + 2, row * BLOCK_SIZE + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4, 4);
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
            drawRoundedRect(ctx, x + 2, y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4, 4);
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

  const handleStartGame = useCallback(() => {
    const piece = createNewPiece();
    setGrid(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)));
    setCurrentPiece(piece);
    setCurrentX(Math.floor((GRID_WIDTH - piece.shape[0].length) / 2));
    setCurrentY(0);
    setLocalScore(0);
    setGameOver(false);
    setShowGameOver(false);
    setGameStatus('playing');
    setGameKey(prev => prev + 1);
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
    <div className="min-h-screen pb-12" key={gameKey}>
      <div className="pt-28 px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="clay-button py-2 px-4 text-sm">← 返回</Link>
            <h1 className="text-xl font-semibold">俄罗斯方块</h1>
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
              width={GRID_WIDTH * BLOCK_SIZE}
              height={GRID_HEIGHT * BLOCK_SIZE}
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
