'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, RotateCcw, Trophy, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BLOCK_SIZE = 30;

type Piece = {
  shape: number[][];
  color: string;
};

const PIECES: Piece[] = [
  { shape: [[1, 1, 1, 1]], color: '#05d9e8' },
  { shape: [[1, 1], [1, 1]], color: '#ffff00' },
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#9b59b6' },
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#3498db' },
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#e67e22' },
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#2ecc71' },
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#e74c3c' },
];

export default function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user } = useAuth();
  const { currentScore, setScore, saveScore, gameStatus, setGameStatus } = useGame();
  
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
          
          if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) {
            return true;
          }
          
          if (newY >= 0 && currentGrid[newY][newX]) {
            return true;
          }
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
    const rotated = piece.shape[0].map((_, i) =>
      piece.shape.map(row => row[i]).reverse()
    );
    return { ...piece, shape: rotated };
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, currentGrid: (string | null)[][], piece: Piece | null, px: number, py: number, next: Piece | null) => {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i <= GRID_WIDTH; i++) {
      ctx.beginPath();
      ctx.moveTo(i * BLOCK_SIZE, 0);
      ctx.lineTo(i * BLOCK_SIZE, GRID_HEIGHT * BLOCK_SIZE);
      ctx.stroke();
    }
    for (let i = 0; i <= GRID_HEIGHT; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * BLOCK_SIZE);
      ctx.lineTo(GRID_WIDTH * BLOCK_SIZE, i * BLOCK_SIZE);
      ctx.stroke();
    }

    for (let row = 0; row < GRID_HEIGHT; row++) {
      for (let col = 0; col < GRID_WIDTH; col++) {
        if (currentGrid[row][col]) {
          ctx.fillStyle = currentGrid[row][col]!;
          ctx.fillRect(col * BLOCK_SIZE + 1, row * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
          
          ctx.shadowColor = currentGrid[row][col]!;
          ctx.shadowBlur = 10;
          ctx.fillRect(col * BLOCK_SIZE + 2, row * BLOCK_SIZE + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
          ctx.shadowBlur = 0;
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
            
            ctx.shadowColor = piece.color;
            ctx.shadowBlur = 15;
            ctx.fillRect(x + 2, y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
            ctx.shadowBlur = 0;
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
        setCurrentX(prev => {
          if (!checkCollision(currentPiece, prev - 1, currentY, grid)) {
            return prev - 1;
          }
          return prev;
        });
        break;
      case 'ArrowRight':
        e.preventDefault();
        setCurrentX(prev => {
          if (!checkCollision(currentPiece, prev + 1, currentY, grid)) {
            return prev + 1;
          }
          return prev;
        });
        break;
      case 'ArrowDown':
        e.preventDefault();
        setCurrentY(prev => {
          if (!checkCollision(currentPiece, currentX, prev + 1, grid)) {
            return prev + 1;
          }
          return prev;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        const rotated = rotatePiece(currentPiece);
        if (!checkCollision(rotated, currentX, currentY, grid)) {
          setCurrentPiece(rotated);
        }
        break;
      case ' ':
        e.preventDefault();
        while (!checkCollision(currentPiece, currentX, currentY + 1, grid)) {
          setCurrentY(prev => prev + 1);
        }
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

    draw(ctx, grid, currentPiece, currentX, currentY, nextPiece);
  }, [grid, currentPiece, currentX, currentY, nextPiece, draw]);

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
            const newScore = lineScores[linesCleared] * level;
            setLocalScore(prev => {
              const updated = prev + newScore;
              setScore(updated);
              return updated;
            });
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
            if (isAuthenticated) {
              saveScore(score, 'tetris');
            }
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

    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    };
  }, [gameStatus, currentPiece, currentX, currentY, grid, level, gameOver, isAuthenticated, score, createNewPiece, checkCollision, mergePiece, clearLines, saveScore, setGameStatus, setScore]);

  const handleTouch = (direction: 'left' | 'right' | 'down' | 'rotate') => {
    if (!currentPiece || gameOver || gameStatus !== 'playing') return;

    switch (direction) {
      case 'left':
        if (!checkCollision(currentPiece, currentX - 1, currentY, grid)) {
          setCurrentX(prev => prev - 1);
        }
        break;
      case 'right':
        if (!checkCollision(currentPiece, currentX + 1, currentY, grid)) {
          setCurrentX(prev => prev + 1);
        }
        break;
      case 'down':
        if (!checkCollision(currentPiece, currentX, currentY + 1, grid)) {
          setCurrentY(prev => prev + 1);
        }
        break;
      case 'rotate':
        const rotated = rotatePiece(currentPiece);
        if (!checkCollision(rotated, currentX, currentY, grid)) {
          setCurrentPiece(rotated);
        }
        break;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" ref={containerRef}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gradient">俄罗斯方块</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={GRID_WIDTH * BLOCK_SIZE}
              height={GRID_HEIGHT * BLOCK_SIZE}
              className="rounded-lg border-2 border-pink-500/50 shadow-lg shadow-pink-500/20"
            />
            
            {showGameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
                <div className="text-center p-8">
                  <h2 className="text-4xl font-bold text-red-500 mb-4">游戏结束</h2>
                  <p className="text-2xl text-cyan-400 mb-6">得分: {score.toLocaleString()}</p>
                  <button
                    onClick={startGame}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold hover:opacity-90 transition-all flex items-center gap-2 mx-auto"
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
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold text-xl hover:opacity-90 transition-all flex items-center gap-3"
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
                <span>分数</span>
              </div>
              <p className="text-3xl font-bold text-cyan-400">{score.toLocaleString()}</p>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Trophy className="w-4 h-4" />
                <span>等级</span>
              </div>
              <p className="text-3xl font-bold text-pink-400">{level}</p>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <span>消除行数</span>
              </div>
              <p className="text-3xl font-bold text-purple-400">{lines}</p>
            </div>

            {nextPiece && (
              <div className="glass-card p-4 rounded-xl">
                <p className="text-gray-400 text-sm mb-3">下一个</p>
                <div className="flex justify-center">
                  <canvas
                    width={4 * BLOCK_SIZE}
                    height={4 * BLOCK_SIZE}
                    className="bg-black/30 rounded"
                    ref={(canvas) => {
                      if (!canvas) return;
                      const ctx = canvas.getContext('2d');
                      if (!ctx) return;
                      
                      ctx.fillStyle = '#0a0a0f';
                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                      
                      const offsetX = (4 - nextPiece.shape[0].length) / 2;
                      const offsetY = (4 - nextPiece.shape.length) / 2;
                      
                      for (let row = 0; row < nextPiece.shape.length; row++) {
                        for (let col = 0; col < nextPiece.shape[row].length; col++) {
                          if (nextPiece.shape[row][col]) {
                            ctx.fillStyle = nextPiece.color;
                            ctx.fillRect(
                              (offsetX + col) * BLOCK_SIZE + 2,
                              (offsetY + row) * BLOCK_SIZE + 2,
                              BLOCK_SIZE - 4,
                              BLOCK_SIZE - 4
                            );
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

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
              <div className="grid grid-cols-4 gap-2">
                <button
                  onTouchStart={() => handleTouch('left')}
                  onClick={() => handleTouch('left')}
                  className="py-3 rounded-lg bg-white/5 hover:bg-white/10 text-xl"
                >
                  ←
                </button>
                <button
                  onTouchStart={() => handleTouch('rotate')}
                  onClick={() => handleTouch('rotate')}
                  className="py-3 rounded-lg bg-white/5 hover:bg-white/10 text-xl"
                >
                  ↻
                </button>
                <button
                  onTouchStart={() => handleTouch('down')}
                  onClick={() => handleTouch('down')}
                  className="py-3 rounded-lg bg-white/5 hover:bg-white/10 text-xl"
                >
                  ↓
                </button>
                <button
                  onTouchStart={() => handleTouch('right')}
                  onClick={() => handleTouch('right')}
                  className="py-3 rounded-lg bg-white/5 hover:bg-white/10 text-xl"
                >
                  →
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">桌面端可使用方向键控制</p>
            </div>

            {!isAuthenticated && (
              <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20 text-sm">
                <p className="text-pink-400 text-center">
                  登录后可保存分数并上榜
                </p>
                <Link
                  href="/login"
                  className="block mt-2 text-center text-cyan-400 hover:text-cyan-300"
                >
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
