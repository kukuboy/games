export type GameType = 'tetris' | 'snake' | 'sudoku' | 'breakout' | 'memory';

export interface User {
  id: string;
  email: string;
  nickname: string;
  password: string;
  createdAt: number;
}

export interface AuthToken {
  userId: string;
  email: string;
  nickname: string;
  expiresAt: number;
}

export interface GameScore {
  id: string;
  userId: string;
  gameId: GameType;
  score: number;
  timestamp: number;
  duration?: number;
}

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  score: number;
  timestamp: number;
}

export interface Leaderboard {
  gameId: GameType;
  entries: LeaderboardEntry[];
  lastUpdated: number;
}

export interface GameInfo {
  id: GameType;
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}

export interface AuthContextType {
  user: User | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (email: string, password: string, nickname: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loading: boolean;
}

export interface GameContextType {
  currentScore: number;
  gameStatus: 'idle' | 'playing' | 'paused' | 'gameover';
  highScore: number;
  setScore: (score: number) => void;
  setGameStatus: (status: 'idle' | 'playing' | 'paused' | 'gameover') => void;
  saveScore: (score: number, gameId: GameType) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
}
