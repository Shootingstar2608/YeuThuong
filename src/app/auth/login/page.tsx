'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Heart, Mail, Lock, ArrowRight } from 'lucide-react';
import styles from '../auth.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? 'Đăng nhập thất bại');
      return;
    }
    window.location.href = '/';
  }

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <div className={styles.heartLogo}>
          <Heart size={28} fill="currentColor" />
        </div>
        <p className={styles.eyebrow}>Yêu Thương App</p>
        <h1 className={styles.title}>Chào mừng trở lại</h1>
        <p className={styles.subtitle}>Đăng nhập để mở góc riêng của hai bạn.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            <span className={styles.labelText}><Mail size={14} /> Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            <span className={styles.labelText}><Lock size={14} /> Mật khẩu</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button className={`btn btn-accent ${styles.submit}`} type="submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : <><Heart size={15} fill="currentColor" /> Vào góc yêu thương <ArrowRight size={15} /></>}
          </button>
        </form>

        <p className={styles.switch}>
          Lần đầu dùng app? <Link href="/auth/register">Đăng ký tài khoản</Link>
        </p>
      </section>
    </div>
  );
}
