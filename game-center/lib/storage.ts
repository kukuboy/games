import { User, AuthToken, GameScore, Leaderboard, LeaderboardEntry, GameType } from '@/types';

const STORAGE_KEYS = {
  USERS: 'gamecenter_users',
  TOKEN: 'gamecenter_token',
  SCORES: 'gamecenter_scores',
  LEADERBOARD: 'gamecenter_leaderboard',
} as const;

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hashed_' + Math.abs(hash).toString(16);
};

export const getUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const saveUsers = (users: User[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getToken = (): AuthToken | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!data) return null;
  const token: AuthToken = JSON.parse(data);
  if (token.expiresAt < Date.now()) {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    return null;
  }
  return token;
};

export const saveToken = (token: AuthToken): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TOKEN, JSON.stringify(token));
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
};

export const getScores = (): GameScore[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.SCORES);
  return data ? JSON.parse(data) : [];
};

export const saveScoreRecord = (score: GameScore): void => {
  if (typeof window === 'undefined') return;
  const scores = getScores();
  scores.push(score);
  localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));
};

export const getUserById = (userId: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

export const getLeaderboard = (gameId: GameType): Leaderboard => {
  if (typeof window === 'undefined') {
    return { gameId, entries: [], lastUpdated: Date.now() };
  }
  const data = localStorage.getItem(`${STORAGE_KEYS.LEADERBOARD}_${gameId}`);
  if (!data) return { gameId, entries: [], lastUpdated: Date.now() };
  return JSON.parse(data);
};

export const updateLeaderboard = (gameId: GameType, nickname: string, score: number): void => {
  if (typeof window === 'undefined') return;
  const leaderboard = getLeaderboard(gameId);
  
  const existingIndex = leaderboard.entries.findIndex(e => e.nickname === nickname);
  
  if (existingIndex >= 0) {
    if (leaderboard.entries[existingIndex].score < score) {
      leaderboard.entries[existingIndex].score = score;
      leaderboard.entries[existingIndex].timestamp = Date.now();
    }
  } else {
    leaderboard.entries.push({
      rank: 0,
      nickname,
      score,
      timestamp: Date.now(),
    });
  }
  
  leaderboard.entries.sort((a, b) => b.score - a.score);
  leaderboard.entries = leaderboard.entries.slice(0, 100);
  leaderboard.entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  
  leaderboard.lastUpdated = Date.now();
  localStorage.setItem(`${STORAGE_KEYS.LEADERBOARD}_${gameId}`, JSON.stringify(leaderboard));
};

export const getTopScores = (gameId: GameType, limit: number = 10): LeaderboardEntry[] => {
  const leaderboard = getLeaderboard(gameId);
  return leaderboard.entries.slice(0, limit);
};

export const getUserHighScores = (userId: string, gameId: GameType): number => {
  const scores = getScores().filter(s => s.userId === userId && s.gameId === gameId);
  if (scores.length === 0) return 0;
  return Math.max(...scores.map(s => s.score));
};

export const getUserScoreHistory = (userId: string, gameId: GameType): GameScore[] => {
  return getScores()
    .filter(s => s.userId === userId && s.gameId === gameId)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50);
};

export const initDemoData = (): void => {
  if (typeof window === 'undefined') return;
  
  const demoUsers: User[] = [
    { id: 'demo1', email: 'player1@game.com', nickname: '游戏达人', password: hashPassword('demo123'), createdAt: Date.now() - 86400000 * 7 },
    { id: 'demo2', email: 'player2@game.com', nickname: '方块王', password: hashPassword('demo123'), createdAt: Date.now() - 86400000 * 5 },
    { id: 'demo3', email: 'player3@game.com', nickname: '贪吃蛇王', password: hashPassword('demo123'), createdAt: Date.now() - 86400000 * 3 },
  ];
  
  const existingUsers = getUsers();
  if (existingUsers.length === 0) {
    saveUsers(demoUsers);
  }
  
  const gameIds: GameType[] = ['tetris', 'snake', 'breakout', 'memory'];
  gameIds.forEach(gameId => {
    const leaderboard = getLeaderboard(gameId);
    if (leaderboard.entries.length === 0) {
      demoUsers.forEach((user, index) => {
        const baseScore = 1000 - index * 150;
        updateLeaderboard(gameId, user.nickname, baseScore + Math.floor(Math.random() * 300));
      });
    }
  });
};
