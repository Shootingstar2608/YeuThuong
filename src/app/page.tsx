'use client';
import styles from './page.module.css';
import { CalendarDays, CheckCircle2, Heart, Images, Music2, Sparkles, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardData {
  user: { name: string; spaceName: string | null; spaceId: number | null };
  goals: { id: number; title: string; isCompleted: boolean }[];
  photos: { id: number; url: string; caption: string | null }[];
  tracks: { id: number; title: string; artist: string | null }[];
  space: { anniversaryDate: string | null; birthday: string | null } | null;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [greeting] = useState(getGreeting);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    async function load() {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) return;
      const user = (await meRes.json()).user;
      const [goalsRes, photosRes, musicRes, spaceRes] = await Promise.all([
        fetch('/api/goals'), fetch('/api/photos'), fetch('/api/music'), fetch('/api/space'),
      ]);
      setData({
        user,
        goals:  goalsRes.ok  ? await goalsRes.json()  : [],
        photos: photosRes.ok ? await photosRes.json() : [],
        tracks: musicRes.ok  ? await musicRes.json()  : [],
        space:  spaceRes.ok  ? (await spaceRes.json()).space : null,
      });
    }
    load();
  }, []);

  const completedGoals = data?.goals.filter(g => g.isCompleted).length ?? 0;
  const daysTogether   = data?.space?.anniversaryDate
    ? Math.max(0, Math.floor((now - new Date(data.space.anniversaryDate).getTime()) / 86400000))
    : 0;

  const quickLinks = [
    { href: '/gallery',  icon: Images,        label: 'Album ảnh',     color: '#ff6b9d' },
    { href: '/music',    icon: Music2,         label: 'Góc nhạc',      color: '#9b59b6' },
    { href: '/goals',    icon: CheckCircle2,   label: 'Mục tiêu',      color: '#2dbd7e' },
    { href: '/chat',     icon: MessageCircle,  label: 'Nhắn tin',      color: '#3b82f6' },
    { href: '/random',   icon: Sparkles,       label: 'Vòng quay',     color: '#f59e0b' },
    { href: '/minigame', icon: CalendarDays,   label: 'Mini game',     color: '#ec4899' },
  ];

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroGreeting}>
            <Sparkles size={14} /> {greeting}, {data?.user.name ?? '...'}
          </p>
          <h1 className={styles.heroTitle}>
            {data?.user.spaceName ?? 'Our Little Corner'}
          </h1>
          <p className={styles.heroSub}>
            Không gian nhỏ để hai bạn giữ lại những điều đáng nhớ ♥
          </p>
          <div className={styles.heroActions}>
            <Link href="/gallery" className="btn">Mở kỷ niệm</Link>
            <Link href="/chat"    className="btn btn-ghost">Gửi lời yêu ♥</Link>
          </div>
        </div>
        <div className={styles.heroHeart} aria-hidden="true">
          <Heart size={60} fill="currentColor" />
          <div className={styles.heartRipple} />
          <div className={styles.heartRipple} style={{ animationDelay: '0.5s' }} />
        </div>
      </section>

      {/* ── Anniversary Counter ── */}
      {data?.space?.anniversaryDate && (
        <section className={styles.anniversaryBanner}>
          <div className={styles.annInner}>
            <div className={styles.annLeft}>
              <span className={styles.annEmoji}>💕</span>
              <div>
                <p className={styles.annLabel}>Chúng mình đã bên nhau</p>
                <p className={styles.annDays}>
                  <strong>{daysTogether.toLocaleString()}</strong> ngày
                </p>
              </div>
            </div>
            <div className={styles.annRight}>
              <p className={styles.annSince}>
                Từ{' '}
                {new Date(data.space.anniversaryDate).toLocaleDateString('vi-VN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Stats ── */}
      <section className={styles.stats}>
        {[
          { icon: CheckCircle2, value: `${completedGoals}/${data?.goals.length ?? 0}`,  label: 'mục tiêu hoàn thành', color: '#2dbd7e' },
          { icon: Images,       value: data?.photos.length ?? 0,                          label: 'kỷ niệm trong album',  color: '#9b59b6' },
          { icon: Music2,       value: data?.tracks.length ?? 0,                          label: 'bài hát của chúng mình', color: '#3b82f6' },
          { icon: Heart,        value: '♥',                                                label: 'mỗi ngày cùng nhau',   color: '#f72c5b' },
        ].map(({ icon: Icon, value, label, color }, i) => (
          <article key={i} className={styles.statCard} style={{ '--stat-color': color } as React.CSSProperties}>
            <div className={styles.statIcon}><Icon size={22} /></div>
            <div>
              <strong className={styles.statValue}>{value}</strong>
              <span className={styles.statLabel}>{label}</span>
            </div>
          </article>
        ))}
      </section>

      {/* ── Quick Links ── */}
      <section className={styles.quickLinks}>
        <div className={styles.sectionHeader}>
          <h2>Khám phá</h2>
        </div>
        <div className={styles.quickGrid}>
          {quickLinks.map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href} className={styles.quickCard} style={{ '--card-color': color } as React.CSSProperties}>
              <div className={styles.quickIcon}><Icon size={24} /></div>
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Dashboard Grid ── */}
      <section className={styles.dashGrid}>
        {/* Goals panel */}
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2><CheckCircle2 size={18} /> Mục tiêu gần đây</h2>
            <Link href="/goals" className={styles.panelLink}>Xem tất cả →</Link>
          </div>
          {data?.goals.slice(0, 4).map(goal => (
            <div key={goal.id} className={`${styles.goalItem} ${goal.isCompleted ? styles.goalDone : ''}`}>
              <span className={styles.goalCheck}>{goal.isCompleted ? '✓' : '○'}</span>
              <p>{goal.title}</p>
            </div>
          ))}
          {!data?.goals.length && (
            <div className={styles.emptyPanel}>
              <span>🎯</span>
              <p>Thêm mục tiêu đầu tiên cho hai bạn!</p>
            </div>
          )}
        </article>

        {/* Photos panel */}
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2><Images size={18} /> Ảnh mới nhất</h2>
            <Link href="/gallery" className={styles.panelLink}>Mở album →</Link>
          </div>
          {data?.photos.length ? (
            <div className={styles.photoGrid}>
              {data.photos.slice(0, 6).map(photo => (
                <div key={photo.id} className={styles.photoThumb}>
                  <img src={photo.url} alt={photo.caption ?? 'Kỷ niệm'} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyPanel}>
              <span>📸</span>
              <p>Album đang chờ kỷ niệm đầu tiên!</p>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
