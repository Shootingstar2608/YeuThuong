'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Heart, Gift, Images, Gamepad2, Music2,
  CheckSquare, MapPin, LogIn,
  MessageCircle, Sparkles, Settings, Home, Flame,
} from 'lucide-react';
import styles from './Navigation.module.css';

const navItems = [
  { href: '/',         icon: Home,          label: 'Home' },
  { href: '/random',   icon: Sparkles,      label: 'Quay' },
  { href: '/birthday', icon: Gift,          label: 'Quà' },
  { href: '/gallery',  icon: Images,        label: 'Ảnh' },
  { href: '/minigame', icon: Gamepad2,      label: 'Game' },
  { href: '/music',    icon: Music2,        label: 'Nhạc' },
  { href: '/chat',     icon: MessageCircle, label: 'Chat' },
  { href: '/pins',     icon: MapPin,        label: 'Pin' },
  { href: '/goals',    icon: CheckSquare,   label: 'Goals' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [user, setUser]     = useState<{ name: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(async (r) => {
      if (r.ok) setUser((await r.json()).user);
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/auth/login';
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* ── Top bar (desktop) ── */}
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoHeart}>
            <Heart size={20} fill="currentColor" />
          </span>
          <span className={styles.logoText}>Yêu Thương</span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Điều hướng chính">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.link} ${isActive(href) ? styles.active : ''}`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.userSection}>
          {user ? (
            <>
              <Link
                href="/secret"
                className={`${styles.iconBtn} ${isActive('/secret') ? styles.active : ''}`}
                title="Lãnh địa bí mật 18+ (Boss & Slave)"
              >
                <Flame size={18} color="#ff3366" />
              </Link>
              <Link href="/space" className={`${styles.iconBtn} ${isActive('/space') ? styles.active : ''}`} title="Space">
                <Settings size={18} />
              </Link>
              <button type="button" className={styles.avatarBtn} onClick={logout} title={`Đăng xuất (${user.name})`}>
                <span className={styles.avatarRing}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="btn" style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}>
              <LogIn size={15} /> Đăng nhập
            </Link>
          )}
        </div>
      </header>

      {/* ── Bottom navigation (mobile) ── */}
      <nav className={styles.bottomNav} aria-label="Điều hướng dưới">
        {navItems.slice(0, 4).map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.bottomLink} ${isActive(href) ? styles.bottomActive : ''}`}
          >
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        ))}
        <Link
          href="/secret"
          className={`${styles.bottomLink} ${isActive('/secret') ? styles.bottomActive : ''}`}
        >
          <Flame size={22} color="#ff3366" />
          <span>Bí Mật</span>
        </Link>
        <Link
          href="/space"
          className={`${styles.bottomLink} ${isActive('/space') ? styles.bottomActive : ''}`}
        >
          <Settings size={22} />
          <span>Space</span>
        </Link>
      </nav>
    </>
  );
}
