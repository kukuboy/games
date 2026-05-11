'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';

const GRID_SIZE = 9;
const BOX_SIZE = 3;

type Cell = {
  value: number;
  isFixed: boolean;
  isError: boolean;
  notes: number[];
};

type Difficulty = 'easy' | 'medium' | 'hard';

const generateSudoku = (difficulty: Difficulty): number[][] => {
  const solution: number[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  
  const isValid = (grid: number[][], row: number, col: number, num: number): boolean => {
    for (let i = 0; i < GRID_SIZE; i++) {
      if (grid[row][i] === num || grid[i][col] === num) return false;
    }
    const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
    for (let i = 0; i < BOX_SIZE; i++) {
      for (let j = 0; j < BOX_SIZE; j++) {
        if (grid[boxRow + i][boxCol + j] === num) return false;
      }
    }
    return true;
  };

  const solve = (grid: number[][]): boolean => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col] === 0) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (const num of nums) {
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num;
              if (solve(grid)) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  solve(solution);

  const puzzle = solution.map(row => [...row]);
  const cellsToRemove = difficulty === 'easy' ? 40 : difficulty === 'medium' ? 50 : 55;
  
  let removed = 0;
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }

  return puzzle;
};

const checkConflicts = (grid: number[][], row: number, col: number, num: number): boolean => {
  if (num === 0) return false;
  for (let i = 0; i < GRID_SIZE; i++) {
    if (i !== col && grid[row][i] === num) return true;
    if (i !== row && grid[i][col] === num) return true;
  }
  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let i = 0; i < BOX_SIZE; i++) {
    for (let j = 0; j < BOX_SIZE; j++) {
      const r = boxRow + i;
      const c = boxCol + j;
      if ((r !== row || c !== col) && grid[r][c] === num) return true;
    }
  }
  return false;
};

export default function SudokuGame() {
  const { isAuthenticated } = useAuth();
  const { saveScore, gameStatus, setGameStatus } = useGame();

  const [puzzle, setPuzzle] = useState<number[][]>([]);
  const [grid, setGrid] = useState<(number | null)[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [timer, setTimer] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());

  const calculateScore = useCallback((time: number, diff: Difficulty) => {
    const baseScore = diff === 'easy' ? 500 : diff === 'medium' ? 1000 : 1500;
    const timeBonus = Math.max(0, 2000 - time * 2);
    return baseScore + timeBonus;
  }, []);

  const checkWin = useCallback((currentGrid: (number | null)[][]) => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (currentGrid[row][col] === null || currentGrid[row][col] === 0) return false;
      }
    }
    return true;
  }, []);

  const validateGrid = useCallback((currentGrid: (number | null)[][], original: number[][]) => {
    const newErrors = new Set<string>();
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const val = currentGrid[row][col];
        if (val !== null && val !== 0 && original[row][col] === 0) {
          if (checkConflicts(currentGrid.map(r => r.map(c => c ?? 0)), row, col, val)) {
            newErrors.add(`${row}-${col}`);
          }
        }
      }
    }
    setErrors(newErrors);
  }, []);

  const startGame = useCallback((diff: Difficulty) => {
    const newPuzzle = generateSudoku(diff);
    setPuzzle(newPuzzle);
    setGrid(newPuzzle.map(row => row.map(cell => cell === 0 ? null : cell)));
    setSelectedCell(null);
    setDifficulty(diff);
    setTimer(0);
    setIsGameWon(false);
    setIsStarted(true);
    setErrors(new Set());
    setGameStatus('playing');
  }, [setGameStatus]);

  const handleNumberInput = useCallback((num: number | null) => {
    if (!selectedCell || isGameWon || !isStarted) return;
    if (puzzle[selectedCell.row][selectedCell.col] !== 0) return;

    const newGrid = grid.map(row => [...row]);
    newGrid[selectedCell.row][selectedCell.col] = num;
    setGrid(newGrid);
    validateGrid(newGrid, puzzle);

    if (checkWin(newGrid)) {
      setIsGameWon(true);
      setGameStatus('gameover');
      const score = calculateScore(timer, difficulty);
      if (isAuthenticated) saveScore(score, 'sudoku');
    }
  }, [selectedCell, isGameWon, isStarted, grid, puzzle, timer, difficulty, isAuthenticated, saveScore, setGameStatus, validateGrid, checkWin, calculateScore]);

  const clearCell = useCallback(() => {
    if (!selectedCell || isGameWon || !isStarted) return;
    if (puzzle[selectedCell.row][selectedCell.col] !== 0) return;
    handleNumberInput(null);
  }, [selectedCell, isGameWon, isStarted, puzzle, handleNumberInput]);

  useEffect(() => {
    if (!isStarted || isGameWon || gameStatus !== 'playing') return;
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isStarted, isGameWon, gameStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderCell = (row: number, col: number) => {
    const value = grid[row]?.[col];
    const isFixed = puzzle[row]?.[col] !== 0;
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const hasError = errors.has(`${row}-${col}`);
    const isSameRow = selectedCell?.row === row;
    const isSameCol = selectedCell?.col === col;
    const isSameBox = Math.floor(row / BOX_SIZE) === Math.floor(selectedCell?.row! / BOX_SIZE) &&
                      Math.floor(col / BOX_SIZE) === Math.floor(selectedCell?.col! / BOX_SIZE);

    return (
      <button
        key={`${row}-${col}`}
        onClick={() => setSelectedCell({ row, col })}
        className={`
          w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-medium
          border border-blue-200 transition-all
          ${isFixed ? 'bg-blue-50 text-blue-800 font-semibold cursor-default' : 'bg-white text-blue-600 cursor-pointer hover:bg-blue-50'}
          ${hasError ? 'bg-red-100 text-red-600' : ''}
          ${isSelected ? 'bg-blue-500 text-white ring-2 ring-blue-300' : ''}
          ${!isSelected && (isSameRow || isSameCol || isSameBox) ? 'bg-blue-100' : ''}
          ${row % BOX_SIZE === 0 ? 'border-t-2 border-t-blue-400' : ''}
          ${col % BOX_SIZE === 0 ? 'border-l-2 border-l-blue-400' : ''}
          ${row === GRID_SIZE - 1 ? 'border-b-2 border-b-blue-400' : ''}
          ${col === GRID_SIZE - 1 ? 'border-r-2 border-r-blue-400' : ''}
        `}
      >
        {value || ''}
      </button>
    );
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="pt-28 px-6 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="px-4 py-2 bg-white rounded-xl text-blue-600 text-sm font-medium shadow-sm border border-blue-200 hover:bg-blue-50 transition-colors">
              ← 返回
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">数独</h1>
            <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-blue-200">
              <span className="text-lg font-semibold text-blue-600">{formatTime(timer)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="max-w-lg mx-auto">
          {!isStarted ? (
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
              <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">选择难度</h2>
              <div className="space-y-3">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => startGame(diff)}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium text-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                  >
                    {diff === 'easy' ? '简单' : diff === 'medium' ? '中等' : '困难'}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-4 mx-auto inline-block">
                <div className="grid grid-cols-9 gap-0">
                  {Array.from({ length: GRID_SIZE }, (_, row) =>
                    Array.from({ length: GRID_SIZE }, (_, col) => renderCell(row, col))
                  )}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleNumberInput(num)}
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl text-lg font-semibold text-blue-600 shadow-sm border border-blue-200 hover:bg-blue-500 hover:text-white transition-all"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={clearCell}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl text-lg font-semibold text-gray-600 shadow-sm border border-gray-200 hover:bg-gray-200 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {isGameWon && (
                <div className="mt-6 bg-white rounded-2xl shadow-lg border border-blue-100 p-6 text-center">
                  <div className="text-4xl mb-2">🎉</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">恭喜通关！</h3>
                  <p className="text-gray-500 mb-4">用时：{formatTime(timer)}</p>
                  <button
                    onClick={() => startGame(difficulty)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
                  >
                    再玩一局
                  </button>
                </div>
              )}

              {!isGameWon && (
                <div className="mt-4 flex justify-center gap-3">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => startGame(diff)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        difficulty === diff
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      {diff === 'easy' ? '简单' : diff === 'medium' ? '中等' : '困难'}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
