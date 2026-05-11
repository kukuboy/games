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
  const [isStarted, setIsStarted] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const lastDropRef = useRef(0);
  const pieceRef = useRef<Piece | null>(null);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const scoreRef = useRef(0);
  const gridRef = useRef(grid);
  const gameOverRef = useRef(false);
  const statusRef = useRef(gameStatus);

  useEffect(() => { statusRef.current = gameStatus; }, [gameStatus]);
  useEffect(() => { pieceRef.current = currentPiece; }, [currentPiece]);
  useEffect(() => { xRef.current = currentX; }, [currentX]);
  useEffect(() => { yRef.current = currentY; }, [currentY]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

  const createNewPiece = useCallback(() => PIECES[Math.floor(Math.random() * PIECES.length)], []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#e8e4e0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < GRID_HEIGHT; row++) {
      for (let col = 0; col < GRID_WIDTH; col++) {
        if (gridRef.current[row][col]) {
          ctx.fillStyle = gridRef.current[row][col]!;
          ctx.fillRect(col * BLOCK_SIZE + 3, row * BLOCK_SIZE + 3, BLOCK_SIZE - 6, BLOCK_SIZE - 6);
        }
      }
    }

    const piece = pieceRef.current;
    if (piece && !gameOverRef.current) {
      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col]) {
            const x = (xRef.current + col) * BLOCK_SIZE;
            const y = (yRef.current + row) * BLOCK_SIZE;
            ctx.fillStyle = piece.color;
            ctx.fillRect(x + 3, y + 3, BLOCK_SIZE - 6, BLOCK_SIZE - 6);
          }
        }
      }
    }
  }, []);

  const startGame = () => {
    const piece = createNewPiece();
    setGrid(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)));
    setCurrentPiece(piece);
    setCurrentX(Math.floor((GRID_WIDTH - piece.shape[0].length) / 2));
    setCurrentY(0);
    setLocalScore(0);
    setGameOver(false);
    setGameStatus('playing');
    setIsStarted(true);
    lastDropRef.current = Date.now();
  };

  useEffect(() => {
    if (!isStarted || statusRef.current !== 'playing' || gameOverRef.current) return;
    
    const checkCollision = (piece: Piece, x: number, y: number) => {
      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col]) {
            const newX = x + col;
            const newY = y + row;
            if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) return true;
            if (newY >= 0 && gridRef.current[newY][newX]) return true;
          }
        }
      }
      return false;
    };

    const rotatePiece = (piece: Piece) => {
      const rotated = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
      return { ...piece, shape: rotated };
    };

    const loop = () => {
      if (statusRef.current !== 'playing' || gameOverRef.current) return;
      
      const now = Date.now();
      if (now - lastDropRef.current > 500) {
        lastDropRef.current = now;
        const piece = pieceRef.current;
        if (!piece) return;

        if (checkCollision(piece, xRef.current, yRef.current + 1)) {
          const newGrid = gridRef.current.map(row => [...row]);
          for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
              if (piece.shape[row][col]) {
                const newY = yRef.current + row;
                const newX = xRef.current + col;
                if (newY >= 0 && newY < GRID_HEIGHT && newX >= 0 && newX < GRID_WIDTH) {
                  newGrid[newY][newX] = piece.color;
                }
              }
            }
          }
          setGrid(newGrid);
          
          const newGrid2 = newGrid.filter(row => row.some(cell => cell === null));
          const clearedCount = GRID_HEIGHT - newGrid2.length;
          for (let i = 0; i < clearedCount; i++) {
            newGrid2.unshift(Array(GRID_WIDTH).fill(null));
          }
          
          if (clearedCount > 0) {
            const lineScores = [0, 100, 300, 500, 800];
            setLocalScore(prev => prev + lineScores[clearedCount]);
          }
          
          const newPiece = createNewPiece();
          const startX = Math.floor((GRID_WIDTH - newPiece.shape[0].length) / 2);
          if (checkCollision(newPiece, startX, 0)) {
            setGameOver(true);
            setGameStatus('gameover');
            if (isAuthenticated) saveScore(scoreRef.current, 'tetris');
            return;
          }
          setGrid(newGrid2);
          setCurrentPiece(newPiece);
          setCurrentX(startX);
          setCurrentY(0);
        } else {
          setCurrentY(prev => prev + 1);
        }
      }
      
      draw();
      gameLoopRef.current = setTimeout(loop, 16);
    };
    
    gameLoopRef.current = setTimeout(loop, 16);
    return () => { if (gameLoopRef.current) clearTimeout(gameLoopRef.current); };
  }, [isStarted, isAuthenticated, saveScore, createNewPiece, draw]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (statusRef.current !== 'playing' || gameOverRef.current || !pieceRef.current) return;
      
      const checkCollision = (piece: Piece, x: number, y: number) => {
        for (let row = 0; row < piece.shape.length; row++) {
          for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
              const newX = x + col;
              const newY = y + row;
              if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) return true;
              if (newY >= 0 && gridRef.current[newY][newX]) return true;
            }
          }
        }
        return false;
      };

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (!checkCollision(pieceRef.current!, xRef.current - 1, yRef.current)) setCurrentX(prev => prev - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (!checkCollision(pieceRef.current!, xRef.current + 1, yRef.current)) setCurrentX(prev => prev + 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!checkCollision(pieceRef.current!, xRef.current, yRef.current + 1)) setCurrentY(prev => prev + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          const rotated = { ...pieceRef.current!, shape: pieceRef.current!.shape[0].map((_, i) => pieceRef.current!.shape.map(row => row[i]).reverse()) };
          if (!checkCollision(rotated, xRef.current, yRef.current)) setCurrentPiece(rotated);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    draw();
  }, [grid, currentPiece, currentX, currentY, draw]);

  return (
    <div className="min-h-screen pb-12">
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
          <canvas
            ref={canvasRef}
            width={GRID_WIDTH * BLOCK_SIZE}
            height={GRID_HEIGHT * BLOCK_SIZE}
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
