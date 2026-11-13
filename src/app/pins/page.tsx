'use client';
import { useState, useEffect } from 'react';
import styles from './pins.module.css';
import { Trash2, PinIcon, Plus, Heart } from 'lucide-react';

interface PinItem { id: number; title: string; note?: string; author?: string; }

const PIN_COLORS = [
  '#ffd6e0', '#ffe4c4', '#d4f0ff', '#d4f0d4', '#e8d5f5', '#fff3cd',
];

export default function PinsPage() {
  const [pins, setPins]     = useState<PinItem[]>([]);
  const [title, setTitle]   = useState('');
  const [note, setNote]     = useState('');
  const [author, setAuthor] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchPins = async () => {
    const res  = await fetch('/api/pins');
    if (res.ok) {
      const data = await res.json();
      setPins(data);
    }
  };

  useEffect(() => {
    fetch('/api/pins').then(async (r) => {
      if (r.ok) setPins(await r.json());
    });
  }, []);

  const addPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch('/api/pins', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, note, author }),
    });
    if (res.ok) { setTitle(''); setNote(''); setAuthor(''); setShowForm(false); fetchPins(); }
  };

  const deletePin = async (id: number) => {
    const res = await fetch(`/api/pins?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchPins();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className="eyebrow"><Heart size={13} /> Our Board</p>
          <h1 className={styles.title}>Bảng Ghim Của Chúng Ta</h1>
          <p className={styles.sub}>Những điều muốn nhớ mãi mãi</p>
        </div>
        <button className="btn" type="button" onClick={() => setShowForm(v => !v)}>
          <Plus size={17} /> {showForm ? 'Huỷ' : 'Thêm ghim'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addPin} className={styles.addForm}>
          <input placeholder="Tiêu đề *" value={title}  onChange={e => setTitle(e.target.value)}  required />
          <textarea placeholder="Ghi chú (tuỳ chọn)..." value={note}   onChange={e => setNote(e.target.value)} />
          <input placeholder="Người ghim (tên)" value={author} onChange={e => setAuthor(e.target.value)} />
          <button className="btn" type="submit"><PinIcon size={16} /> Ghim lên bảng</button>
        </form>
      )}

      {pins.length === 0 && !showForm && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📌</div>
          <h2>Bảng ghim đang trống</h2>
          <p>Ghim những điều quan trọng, lời nhắn nhủ, hay kỷ niệm đáng nhớ lên đây!</p>
          <button className="btn" type="button" onClick={() => setShowForm(true)}><Plus size={16} /> Tạo ghim đầu tiên</button>
        </div>
      )}

      <div className={styles.board}>
        {pins.map((p, i) => (
          <div
            key={p.id}
            className={styles.pinCard}
            style={{ background: PIN_COLORS[i % PIN_COLORS.length], animationDelay: `${i * 0.06}s` }}
          >
            <div className={styles.pinNail} aria-hidden="true">
              <PinIcon size={18} />
            </div>
            <div className={styles.pinContent}>
              <h3 className={styles.pinTitle}>{p.title}</h3>
              {p.note && <p className={styles.pinNote}>{p.note}</p>}
              {p.author && <span className={styles.pinAuthor}>— {p.author}</span>}
            </div>
            <button type="button" className={styles.deleteBtn} onClick={() => deletePin(p.id)} title="Xoá ghim">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
