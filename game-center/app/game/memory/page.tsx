'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Zap, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';

type Card = {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const SYMBOLS = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎺'];

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const createCards = (): Card[] => {
  const selectedSymbols = SYMBOLS.slice(0, 8);
  const cards: Card[] = [];
  
  selectedSymbols.forEach((symbol, index) => {
    cards.push(
      { id: index * 2, symbol, isFlipped: false, isMatched: false },
      { id: index * 2 + 1, symbol, isFlipped: false, isMatched: false }
    );
  });
  
  return shuffleArray(cards);
};

export default function MemoryGame() {
  const { isAuthenticated } = useAuth();
  const { saveScore, gameStatus, setGameStatus } = useGame();
  
  const [cards, setCards] = useState<Card[]>(createCards);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const calculateScore = useCallback((time: number, moves: number) => {
    const baseScore = 1000;
    const timeBonus = Math.max(0, 500 - time * 2);
    const movesBonus = Math.max(0, 300 - moves * 10);
    return baseScore + timeBonus + movesBonus;
  }, []);

  useEffect(() => {
    if (gameStatus !== 'playing' || isGameWon) return;

    const interval = setInterval(() => {
      setGameTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStatus, isGameWon]);

  const handleCardClick = (cardId: number) => {
    if (gameStatus !== 'playing' || isProcessing || isGameWon) return;

    const cardIndex = cards.findIndex(c => c.id === cardId);
    const card = cards[cardIndex];

    if (card.isFlipped || card.isMatched) return;
    if (flippedCards.length >= 2) return;

    const newCards = [...cards];
    newCards[cardIndex].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      setIsProcessing(true);

      const [firstId, secondId] = newFlippedCards;
      const firstCard = newCards.find(c => c.id === firstId)!;
      const secondCard = newCards.find(c => c.id === secondId)!;

      if (firstCard.symbol === secondCard.symbol) {
        setTimeout(() => {
          const matchedCards = newCards.map(c => {
            if (c.id === firstId || c.id === secondId) {
              return { ...c, isMatched: true };
            }
            return c;
          });
          setCards(matchedCards);
          setMatches(prev => {
            const newMatches = prev + 1;
            if (newMatches === 8) {
              setIsGameWon(true);
              setGameStatus('gameover');
              const finalScore = calculateScore(gameTime, moves + 1);
              if (isAuthenticated) {
                saveScore(finalScore, 'memory');
              }
            }
            return newMatches;
          });
          setFlippedCards([]);
          setIsProcessing(false);
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = newCards.map(c => {
            if (c.id === firstId || c.id === secondId) {
              return { ...c, isFlipped: false };
            }
            return c;
          });
          setCards(resetCards);
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  const startGame = () => {
    setCards(createCards());
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameTime(0);
    setIsGameWon(false);
    setIsProcessing(false);
    setGameStarted(true);
    setGameStatus('playing');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const finalScore = calculateScore(gameTime, moves);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gradient">记忆翻牌</h1>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-8">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-xl transition-all duration-500 ${
                card.isFlipped || card.isMatched
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                  : 'bg-white/10 hover:bg-white/20'
              } ${
                card.isMatched
                  ? 'ring-2 ring-green-400 shadow-lg shadow-green-400/30'
                  : ''
              }`}
            >
              <div className={`w-full h-full flex items-center justify-center text-4xl transition-all duration-300 ${
                card.isFlipped || card.isMatched
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-90'
              }`}>
                {card.symbol}
              </div>
            </button>
          ))}
        </div>

        {isGameWon && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
            <div className="text-center p-8 glass-card rounded-2xl max-w-md mx-4">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-4xl font-bold text-gradient mb-4">恭喜通关!</h2>
              <p className="text-gray-400 mb-6">你完成了所有配对</p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-2xl font-bold text-cyan-400">{moves}</p>
                  <p className="text-xs text-gray-400">步数</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-2xl font-bold text-pink-400">{formatTime(gameTime)}</p>
                  <p className="text-xs text-gray-400">用时</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-2xl font-bold text-purple-400">{finalScore}</p>
                  <p className="text-xs text-gray-400">得分</p>
                </div>
              </div>

              <button
                onClick={startGame}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold hover:opacity-90 transition-all flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-5 h-5" />
                再玩一局
              </button>
            </div>
          </div>
        )}

        {gameStatus === 'idle' && !isGameWon && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
            <div className="text-center p-8 glass-card rounded-2xl max-w-md mx-4">
              <div className="text-6xl mb-4">🧠</div>
              <h2 className="text-3xl font-bold text-gradient mb-4">记忆翻牌</h2>
              <p className="text-gray-400 mb-6">
                翻开卡牌找到相同的配对<br />
                用时越少、步数越少，得分越高
              </p>
              <button
                onClick={startGame}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl hover:opacity-90 transition-all"
              >
                开始游戏
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-4">
          <div className="glass-card p-4 rounded-xl min-w-[120px]">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Zap className="w-4 h-4" />
              <span>步数</span>
            </div>
            <p className="text-3xl font-bold text-cyan-400">{moves}</p>
          </div>

          <div className="glass-card p-4 rounded-xl min-w-[120px]">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Trophy className="w-4 h-4" />
              <span>配对</span>
            </div>
            <p className="text-3xl font-bold text-pink-400">{matches}/8</p>
          </div>

          <div className="glass-card p-4 rounded-xl min-w-[120px]">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <span>用时</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">{formatTime(gameTime)}</p>
          </div>

          {gameStatus === 'playing' && !isGameWon && (
            <button
              onClick={startGame}
              className="glass-card p-4 rounded-xl min-w-[120px] hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <RotateCcw className="w-4 h-4" />
                <span>重开</span>
              </div>
            </button>
          )}
        </div>

        <div className="mt-6 text-center">
          {!isAuthenticated ? (
            <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20 inline-block">
              <p className="text-pink-400">登录后可保存分数并上榜</p>
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 ml-2">
                去登录 →
              </Link>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">
              最高可达 <span className="text-cyan-400 font-bold">{calculateScore(0, 0)}</span> 分
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
