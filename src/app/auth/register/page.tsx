'use client';

import Link from 'next/link';
import { FormEvent, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Heart, Mail, Lock, User, KeyRound, Sparkles, ArrowRight } from 'lucide-react';
import styles from '../auth.module.css';

function RegisterForm() {
  const searchParams = useSearchParams();
  const prefillCode = searchParams.get('invite') ?? '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState(prefillCode);
  const [spaceName, setSpaceName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'join' | 'create'>(prefillCode ? 'join' : 'create');

  // Khi URL có ?invite=... thì tự chuyển sang chế độ "Tham gia space"
  useEffect(() => {
    if (prefillCode) {
      setInviteCode(prefillCode);
      setMode('join');
    }
  }, [prefillCode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        inviteCode: mode === 'join' ? inviteCode : undefined,
        spaceName: mode === 'create' ? spaceName : undefined,
      }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? 'Đăng ký thất bại');
      return;
    }
    window.location.href = '/';
  }

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        {/* Logo Heart */}
        <div className={styles.heartLogo}>
          <Heart size={28} fill="currentColor" />
        </div>
        <p className={styles.eyebrow}>Yêu Thương App</p>
        <h1 className={styles.title}>
          {mode === 'join' ? 'Tham gia góc yêu thương' : 'Tạo góc yêu thương'}
        </h1>
        <p className={styles.subtitle}>
          {mode === 'join'
            ? 'Nhập thông tin của bạn để tham gia góc riêng của hai người.'
            : 'Tạo không gian riêng tư cho hai bạn, sau đó mời người yêu vào.'}
        </p>

        {/* Mode toggle */}
        <div className={styles.modeToggle}>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === 'create' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('create')}
          >
            <Sparkles size={15} /> Tạo space mới
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === 'join' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('join')}
          >
            <KeyRound size={15} /> Có mã mời
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            <span className={styles.labelText}><User size={14} /> Tên hiển thị</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Chồng yêu của em 💕"
              required
            />
          </label>
          <label>
            <span className={styles.labelText}><Mail size={14} /> Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
          </label>
          <label>
            <span className={styles.labelText}><Lock size={14} /> Mật khẩu</span>
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              required
            />
          </label>

          {mode === 'join' && (
            <label>
              <span className={styles.labelText}><KeyRound size={14} /> Mã mời</span>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã mời từ người yêu"
                style={{ letterSpacing: '0.12em', fontWeight: 700 }}
                required
              />
            </label>
          )}

          {mode === 'create' && (
            <label>
              <span className={styles.labelText}><Heart size={14} /> Tên không gian</span>
              <input
                type="text"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                placeholder="Ví dụ: Góc nhỏ của chúng mình ♥"
              />
            </label>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button className={`btn btn-accent ${styles.submit}`} type="submit" disabled={loading}>
            {loading ? 'Đang tạo tài khoản...' : (
              <>{mode === 'join' ? 'Tham gia ngay' : 'Tạo không gian'} <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className={styles.switch}>Đã có tài khoản? <Link href="/auth/login">Đăng nhập</Link></p>
      </section>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
