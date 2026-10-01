'use client';
import { useState, useEffect } from 'react';
import styles from './minigame.module.css';

const ICONS = ['💖', '🎁', '🍰', '🐶', '🌹', '💑', '🧸', '🍓'];

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MinigamePage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const duplicatedIcons = [...ICONS, ...ICONS];
    const shuffledCards = duplicatedIcons
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffledCards);
    setFlippedIndices([]);
    setMoves(0);
  };

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setMoves(m => m + 1);
      const [firstIndex, secondIndex] = newFlippedIndices;
      
      if (cards[firstIndex].icon === cards[secondIndex].icon) {
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1 className="title">Trò Chơi Lật Bài</h1>
      
      <div className={styles.header}>
        <p>Số bước: {moves}</p>
        <button className="btn btn-accent" onClick={initializeGame}>Chơi lại</button>
      </div>

      <div className={styles.grid}>
        {cards.map((card, index) => (
          <div 
            key={card.id} 
            className={`${styles.card} ${card.isFlipped || card.isMatched ? styles.flipped : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div className={styles.cardInner}>
              <div className={styles.cardFront}>?</div>
              <div className={styles.cardBack}>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>
      
      {cards.length > 0 && cards.every(c => c.isMatched) && (
        <div className={styles.winMessage}>
          <h2>Chúc mừng! Bạn đã thắng! 🎉</h2>
        </div>
      )}
    </div>
  );
}
