'use client';
import styles from './page.module.css';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [hearts, setHearts] = useState<{ id: number; left: number; animationDuration: number }[]>([]);

  useEffect(() => {
    // Generate random floating hearts
    const newHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 3 + Math.random() * 5,
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.iconContainer}>
          <Heart size={64} color="var(--accent)" fill="var(--accent)" className={styles.heartbeat} />
        </div>
        <h1 className={styles.title}>Our Little Corner</h1>
        <p className={styles.subtitle}>Nơi lưu giữ những kỷ niệm, mục tiêu và yêu thương của chúng mình 💖</p>
        
        <div className={styles.actions}>
          <Link href="/gallery" className="btn btn-accent">Xem Ảnh</Link>
          <Link href="/random" className="btn">Quay Quà & Đồ Ăn</Link>
        </div>
      </div>

      <div className={styles.floatingHearts}>
        {hearts.map(heart => (
          <div 
            key={heart.id} 
            className={styles.floatingHeart}
            style={{ 
              left: `${heart.left}%`,
              animationDuration: `${heart.animationDuration}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            <Heart size={20} color="var(--primary-hover)" fill="var(--primary-hover)" opacity={0.5} />
          </div>
        ))}
      </div>
    </div>
  );
}
