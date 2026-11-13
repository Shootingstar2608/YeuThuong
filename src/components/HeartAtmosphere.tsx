'use client';

import styles from './HeartAtmosphere.module.css';

const PARTICLES = [
  { left: '5%',  delay: 0,   dur: 12, size: 14, type: 'heart' },
  { left: '12%', delay: 3.5, dur: 16, size: 10, type: 'dot' },
  { left: '22%', delay: 1.5, dur: 11, size: 18, type: 'heart' },
  { left: '33%', delay: 5,   dur: 14, size: 9,  type: 'dot' },
  { left: '44%', delay: 0.8, dur: 13, size: 16, type: 'heart' },
  { left: '55%', delay: 4,   dur: 10, size: 12, type: 'sparkle' },
  { left: '65%', delay: 2,   dur: 15, size: 14, type: 'heart' },
  { left: '76%', delay: 6,   dur: 12, size: 10, type: 'dot' },
  { left: '88%', delay: 1,   dur: 13, size: 20, type: 'heart' },
  { left: '95%', delay: 3,   dur: 16, size: 11, type: 'sparkle' },
];

function ParticleSymbol({ type, size }: { type: string; size: number }) {
  if (type === 'heart') return <span style={{ fontSize: size }}>♥</span>;
  if (type === 'sparkle') return <span style={{ fontSize: size }}>✦</span>;
  return <span style={{ width: size * 0.5, height: size * 0.5, borderRadius: '50%', background: 'currentColor', display: 'block' }} />;
}

export default function HeartAtmosphere() {
  return (
    <div className={styles.atmosphere} aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className={styles.particle}
          style={{
            left: p.left,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            color: `hsl(${340 + i * 5}deg 80% ${65 + (i % 3) * 5}%)`,
            opacity: 0.35 + (i % 4) * 0.07,
          }}
        >
          <ParticleSymbol type={p.type} size={p.size} />
        </div>
      ))}
      {/* Ambient glow blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
    </div>
  );
}
