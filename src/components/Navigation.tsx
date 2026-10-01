import Link from 'next/link';
import { Heart, Gift, Image as ImageIcon, Gamepad2, Music, CheckSquare, Pin } from 'lucide-react';
import styles from './Navigation.module.css';

const Navigation = () => {
  return (
    <header className={`${styles.header} glass`}>
      <div className={styles.logo}>
        <Heart fill="var(--accent)" color="var(--accent)" size={28} />
        <span>Our Space</span>
      </div>
      <nav className={styles.nav}>
        <Link href="/" className={styles.link}>
          <Heart size={20} />
          <span>Home</span>
        </Link>
        <Link href="/random" className={styles.link}>
          <Gift size={20} />
          <span>Random</span>
        </Link>
        <Link href="/gallery" className={styles.link}>
          <ImageIcon size={20} />
          <span>Gallery</span>
        </Link>
        <Link href="/minigame" className={styles.link}>
          <Gamepad2 size={20} />
          <span>Minigame</span>
        </Link>
        <Link href="/music" className={styles.link}>
          <Music size={20} />
          <span>Music</span>
        </Link>
        <Link href="/pins" className={styles.link}>
          <Pin size={20} />
          <span>Pin</span>
        </Link>
        <Link href="/goals" className={styles.link}>
          <CheckSquare size={20} />
          <span>Goals</span>
        </Link>
      </nav>
    </header>
  );
};

export default Navigation;
