'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';

type Card = { id: number; symbol: string; isFlipped: boolean; isMatched: boolean };

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

  const calculateScore = useCallback((time: number, moves: number) => {
    const baseScore = 1000;
    const timeBonus = Math.max(0, 500 - time * 2);
    const movesBonus = Math.max(0, 300 - moves * 10);
    return baseScore + timeBonus + movesBonus;
  }, []);

  useEffect(() => {
    if (gameStatus !== 'playing' || isGameWon) return;
    const interval = setInterval(() => setGameTime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [gameStatus, isGameWon]);

  const handleCardClick = (cardId: number) => {
    if (gameStatus !== 'playing' || isProcessing || isGameWon) return;

    const cardIndex = cards.findIndex(c => c.id === cardId);
    const card = cards[cardIndex];
    if (card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

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
            if (c.id === firstId || c.id === secondId) return { ...c, isMatched: true };
            return c;
          });
          setCards(matchedCards);
          setMatches(prev => {
            const newMatches = prev + 1;
            if (newMatches === 8) {
              setIsGameWon(true);
              setGameStatus('gameover');
              const finalScore = calculateScore(gameTime, moves + 1);
              if (isAuthenticated) saveScore(finalScore, 'memory');
            }
            return newMatches;
          });
          setFlippedCards([]);
          setIsProcessing(false);
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = newCards.map(c => {
            if (c.id === firstId || c.id === secondId) return { ...c, isFlipped: false };
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
    setGameStatus('playing');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const finalScore = calculateScore(gameTime, moves);

  return (
    <div className="min-h-screen py-8 px-4 bg-slate-100">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="p-2 rounded-lg bg-white hover:bg-slate-200 transition-colors border border-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">记忆翻牌</h1>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-xl text-3xl transition-all duration-300 ${
                card.isFlipped || card.isMatched
                  ? 'bg-white border-2 border-indigo-300'
                  : 'bg-indigo-500 hover:bg-indigo-600'
              } ${card.isMatched ? 'ring-2 ring-green-400' : ''}`}
            >
              {(card.isFlipped || card.isMatched) ? card.symbol : '?'}
            </button>
          ))}
        </div>

        {isGameWon && (
          <div className="fixed inset-0 flex items-center justify-center bg-slate-900/80 z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">恭喜通关!</h2>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-lg bg-slate-100">
                  <p className="text-lg font-bold text-slate-700">{moves}</p>
                  <p className="text-xs text-slate-500">步数</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-100">
                  <p className="text-lg font-bold text-slate-700">{formatTime(gameTime)}</p>
                  <p className="text-xs text-slate-500">用时</p>
                </div>
                <div className="p-3 rounded-lg bg-indigo-100">
                  <p className="text-lg font-bold text-indigo-600">{finalScore}</p>
                  <p className="text-xs text-indigo-500">得分</p>
                </div>
              </div>
              <button onClick={startGame} className="w-full py-2.5 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" /> 再玩一局
              </button>
            </div>
          </div>
        )}

        {gameStatus === 'idle' && !isGameWon && (
          <div className="fixed inset-0 flex items-center justify-center bg-slate-900/80 z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">记忆翻牌</h2>
              <p className="text-slate-500 mb-6">翻开卡牌找到相同的配对</p>
              <button onClick={startGame} className="w-full py-2.5 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors">
                开始游戏
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <div className="bg-white rounded-xl px-5 py-3 border border-slate-200">
            <p className="text-sm text-slate-500">步数</p>
            <p className="text-xl font-bold text-slate-700">{moves}</p>
          </div>
          <div className="bg-white rounded-xl px-5 py-3 border border-slate-200">
            <p className="text-sm text-slate-500">配对</p>
            <p className="text-xl font-bold text-slate-700">{matches}/8</p>
          </div>
          <div className="bg-white rounded-xl px-5 py-3 border border-slate-200">
            <p className="text-sm text-slate-500">用时</p>
            <p className="text-xl font-bold text-slate-700">{formatTime(gameTime)}</p>
          </div>
          {gameStatus === 'playing' && !isGameWon && (
            <button onClick={startGame} className="px-5 py-3 rounded-xl bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> 重开
            </button>
          )}
        </div>

        {!isAuthenticated && (
          <div className="mt-6 text-center">
            <div className="inline-block p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <p className="text-indigo-500">登录后可保存分数</p>
              <Link href="/login" className="text-indigo-400 hover:text-indigo-600 ml-1">去登录 →</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
