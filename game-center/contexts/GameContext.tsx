'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { GameContextType, GameType } from '@/types';
import { saveScoreRecord, generateId, updateLeaderboard, getUserHighScores } from '@/lib/storage';
import { useAuth } from './AuthContext';

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [currentScore, setCurrentScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [highScore, setHighScore] = useState(0);
  const { user, isAuthenticated } = useAuth();

  const saveScore = (score: number, gameId: GameType) => {
    const userId = isAuthenticated ? user!.id : 'anonymous';
    
    const scoreRecord = {
      id: generateId(),
      userId,
      gameId,
      score,
      timestamp: Date.now(),
    };
    
    saveScoreRecord(scoreRecord);
    
    if (isAuthenticated) {
      updateLeaderboard(gameId, user!.nickname, score);
    }
    
    if (score > highScore) {
      setHighScore(score);
    }
  };

  const startGame = () => {
    setGameStatus('playing');
    setCurrentScore(0);
  };

  const pauseGame = () => {
    setGameStatus('paused');
  };

  const resumeGame = () => {
    setGameStatus('playing');
  };

  const resetGame = () => {
    setGameStatus('idle');
    setCurrentScore(0);
  };

  return (
    <GameContext.Provider
      value={{
        currentScore,
        gameStatus,
        highScore,
        setScore: setCurrentScore,
        setGameStatus,
        saveScore,
        startGame,
        pauseGame,
        resumeGame,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
