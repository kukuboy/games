'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';

type Card = { id: number; symbol: string; isFlipped: boolean; isMatched: boolean };

const SYMBOLS = ['◆', '◇', '●', '○', '■', '□', '▲', '△'];

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
  const [isGameWon, setIsGameWon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateScore = useCallback((moves: number) => {
    return Math.max(100, 1000 - moves * 30);
  }, []);

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
              const finalScore = calculateScore(moves + 1);
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
    setIsGameWon(false);
    setIsProcessing(false);
    setGameStatus('playing');
  };

  return (
    <div className="min-h-screen pt-24 px-5">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-xs text-zinc-500 hover:text-black">← 返回</Link>
          <h1 className="text-xl">记忆翻牌</h1>
          <div className="text-sm">{moves}</div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6 max-w-md mx-auto">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square text-xl border transition-all ${
                card.isFlipped || card.isMatched
                  ? 'bg-white border-black'
                  : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200'
              }`}
            >
              {(card.isFlipped || card.isMatched) ? card.symbol : ''}
            </button>
          ))}
        </div>

        {isGameWon && (
          <div className="text-center mb-6">
            <p className="text-sm text-zinc-500 mb-2">完成！</p>
            <p className="text-2xl font-medium mb-4">{moves} 步</p>
            <button onClick={startGame} className="text-sm text-black border-b border-black pb-0.5">
              再玩一局
            </button>
          </div>
        )}

        {gameStatus === 'idle' && !isGameWon && (
          <div className="text-center mb-6">
            <button onClick={startGame} className="text-sm text-black border-b border-black pb-0.5">
              开始
            </button>
          </div>
        )}

        {gameStatus === 'playing' && !isGameWon && (
          <div className="flex justify-center gap-4">
            <button onClick={startGame} className="text-sm text-zinc-500 hover:text-black">
              重新开始
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
