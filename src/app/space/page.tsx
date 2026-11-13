'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './space.module.css';
import { Heart, Copy, Check, Calendar, Users, AlertTriangle, LogIn, Link2, Smartphone, ShieldCheck, Share2 } from 'lucide-react';

interface SpaceData {
  name: string;
  inviteCode: string;
  birthday: string | null;
  anniversaryDate: string | null;
  role: string | null;
  members: { role: string; user: { name: string; email: string } }[];
}

export default function SpacePage() {
  const router = useRouter();
  const [space, setSpace]               = useState<SpaceData | null>(null);
  const [inviteCode, setInviteCode]     = useState('');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [copiedCode, setCopiedCode]     = useState(false);
  const [copiedLink, setCopiedLink]     = useState(false);
  const [birthday, setBirthday]         = useState('');
  const [anniversary, setAnniversary]   = useState('');
  const [dateSaved, setDateSaved]       = useState(false);

  useEffect(() => {
    fetch('/api/space').then(async (r) => {
      if (r.ok) {
        const result = await r.json();
        const s = { ...result.space, role: result.role } as SpaceData;
        setSpace(s);
        setBirthday(s.birthday ?? '');
        setAnniversary(s.anniversaryDate ?? '');
      }
    });
  }, []);

  async function joinSpace(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/space', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? 'Không thể tham gia space'); return; }
    router.refresh();
    window.location.reload();
  }

  async function copyCode() {
    if (!space) return;
    await navigator.clipboard.writeText(space.inviteCode);
    setCopiedCode(true);
    window.setTimeout(() => setCopiedCode(false), 2000);
  }

  async function copyInviteLink() {
    if (!space) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const inviteUrl = `${origin}/auth/register?invite=${space.inviteCode}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2000);
  }

  async function saveSettings(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError(''); setDateSaved(false);
    const res = await fetch('/api/space', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthday: birthday || null, anniversaryDate: anniversary || null }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? 'Không thể lưu'); return; }
    setSpace(s => s ? { ...s, birthday: data.space.birthday, anniversaryDate: data.space.anniversaryDate } : s);
    setDateSaved(true);
    window.setTimeout(() => setDateSaved(false), 2500);
  }

  async function leaveSpace() {
    const confirmed = window.confirm('Rời Shared Space sẽ xóa toàn bộ dữ liệu chung. Bạn có chắc không?');
    if (!confirmed) return;
    setLoading(true);
    const res = await fetch('/api/space', { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Không thể rời space');
      setLoading(false);
      return;
    }
    window.location.reload();
  }

  const isFull = (space?.members?.length ?? 0) >= 2;

  return (
    <div className={styles.page}>
      {space ? (
        <>
          {/* Space info */}
          <section className={styles.card}>
            <div className={styles.spaceHeader}>
              <div className={styles.spaceBadge}><Heart size={24} fill="currentColor" /></div>
              <div>
                <p className="eyebrow">Shared Space</p>
                <h1 className={styles.spaceName}>{space.name}</h1>
              </div>
            </div>

            {/* Status pill: locked or waiting for partner */}
            {isFull ? (
              <div className={styles.lockBadge}>
                <ShieldCheck size={18} />
                <span>Không gian đã đủ 2 người & Khóa riêng tư tuyệt đối</span>
              </div>
            ) : (
              <div className={styles.waitingBadge}>
                <Heart size={16} />
                <span>Đang chờ người yêu tham gia cùng</span>
              </div>
            )}

            {/* Invite code & invite link */}
            <div className={styles.inviteSection}>
              <p className={styles.label}>Mời người yêu tham gia</p>

              <div className={styles.actionButtons}>
                <button className={styles.inviteLinkBtn} type="button" onClick={copyInviteLink}>
                  {copiedLink ? <Check size={18} /> : <Link2 size={18} />}
                  <span>{copiedLink ? 'Đã copy link mời!' : 'Sao chép Link mời trực tiếp'}</span>
                </button>
              </div>

              <div className={styles.codeRow}>
                <code className={styles.code}>{space.inviteCode}</code>
                <button className={styles.copyBtn} type="button" onClick={copyCode}>
                  {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                  {copiedCode ? 'Đã copy mã!' : 'Copy mã'}
                </button>
              </div>
              <p className={styles.hint}>
                💡 Gửi link mời qua Zalo/Messenger cho bạn gái: bạn gái chỉ cần bấm vào là tự điền mã mời, chỉ cần nhập tên và mật khẩu là vào app!
              </p>
            </div>

            {/* Members */}
            <div className={styles.members}>
              <p className={styles.label}><Users size={14} /> Thành viên ({space.members.length}/2)</p>
              <div className={styles.memberList}>
                {space.members.map(m => (
                  <div key={m.user.email} className={styles.memberCard}>
                    <div className={styles.memberAvatar}>{m.user.name.charAt(0).toUpperCase()}</div>
                    <div className={styles.memberInfo}>
                      <strong>{m.user.name}</strong>
                      <span className={styles.memberRole}>
                        {m.role === 'OWNER' ? '👑 Chủ space' : '💕 Partner'} • {m.user.email}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PWA Install Guide */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}><Smartphone size={18} /> Cài đặt làm App trên điện thoại</h2>
            <p className={styles.cardSub}>Thêm ra màn hình chính để dùng như một ứng dụng độc lập, không vướng thanh địa chỉ trình duyệt.</p>
            <div className={styles.pwaGuideList}>
              <div className={styles.pwaGuideItem}>
                <div className={styles.pwaIcon}>🍎</div>
                <div>
                  <strong>Dành cho iPhone (Safari):</strong>
                  <p>Mở web bằng <strong>Safari</strong> ➔ Bấm nút <strong>Chia sẻ (Share <Share2 size={13} style={{display:'inline'}} />)</strong> ở dưới ➔ Chọn <strong>&quot;Thêm vào MH chính&quot; (Add to Home Screen)</strong>.</p>
                </div>
              </div>
              <div className={styles.pwaGuideItem}>
                <div className={styles.pwaIcon}>🤖</div>
                <div>
                  <strong>Dành cho Android (Chrome):</strong>
                  <p>Mở web bằng <strong>Chrome</strong> ➔ Bấm dấu <strong>3 chấm (⋮)</strong> góc trên ➔ Chọn <strong>&quot;Cài đặt ứng dụng&quot;</strong> hoặc <strong>&quot;Thêm vào màn hình chính&quot;</strong>.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Settings (owner only) */}
          {space.role === 'OWNER' && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}><Calendar size={18} /> Ngày kỷ niệm & Sinh nhật</h2>
              <p className={styles.cardSub}>Cài đặt này chỉ chủ space mới có thể thay đổi.</p>
              <form onSubmit={saveSettings} className={styles.form}>
                <label className={styles.fieldGroup}>
                  <span>💕 Ngày bắt đầu yêu nhau</span>
                  <input type="date" value={anniversary} onChange={e => setAnniversary(e.target.value)} />
                  <small>Dùng để đếm số ngày hai bạn bên nhau trên trang chủ</small>
                </label>
                <label className={styles.fieldGroup}>
                  <span>🎂 Ngày sinh nhật</span>
                  <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} />
                  <small>Dùng để mở quà sinh nhật đúng ngày</small>
                </label>
                {error && <p className={styles.error}>{error}</p>}
                {dateSaved && <p className={styles.success}>✓ Đã lưu thành công!</p>}
                <button className="btn" type="submit" disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
                </button>
              </form>
            </section>
          )}

          {/* Join another space if needed */}
          {!isFull && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}><LogIn size={18} /> Tham gia bằng mã mời khác</h2>
              <p className={styles.cardSub}>Dùng khi bạn có mã từ người yêu nhưng chưa vào chung space.</p>
              <form onSubmit={joinSpace} className={styles.form}>
                <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="Nhập mã mời..." required />
                {error && <p className={styles.error}>{error}</p>}
                <button className="btn" type="submit" disabled={loading}>{loading ? 'Đang tham gia...' : 'Tham gia space này'}</button>
              </form>
            </section>
          )}

          {/* Danger zone */}
          <section className={`${styles.card} ${styles.dangerCard}`}>
            <h2 className={styles.dangerTitle}><AlertTriangle size={18} /> Danger Zone</h2>
            <p>Rời space sẽ xóa vĩnh viễn toàn bộ ảnh, goals, pins, nhạc, chat. Tài khoản vẫn được giữ.</p>
            <button className={styles.dangerBtn} type="button" onClick={leaveSpace} disabled={loading}>
              Rời và xóa space
            </button>
          </section>
        </>
      ) : (
        <section className={styles.card}>
          <div className={styles.spaceHeader}>
            <div className={styles.spaceBadge}><Heart size={22} fill="currentColor" /></div>
            <div>
              <p className="eyebrow">Bước đầu tiên</p>
              <h1 className={styles.spaceName}>Tham gia Shared Space</h1>
            </div>
          </div>
          <p className={styles.cardSub}>Nhập mã mời từ người yêu để bắt đầu chia sẻ không gian chung.</p>
          <form onSubmit={joinSpace} className={styles.form}>
            <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="Ví dụ: A1B2C3D4" required />
            {error && <p className={styles.error}>{error}</p>}
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Đang tham gia...' : 'Tham gia'}</button>
          </form>
        </section>
      )}
    </div>
  );
}
