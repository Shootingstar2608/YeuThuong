"use client";
import { useState, useEffect } from 'react';
import styles from './pins.module.css';
import { Trash2, Pin as PinIcon } from 'lucide-react';

interface PinItem {
  id: number;
  title: string;
  note?: string;
  author?: string;
}

export default function PinsPage() {
  const [pins, setPins] = useState<PinItem[]>([]);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => { fetchPins(); }, []);

  const fetchPins = async () => {
    const res = await fetch('/api/pins');
    const data = await res.json();
    setPins(data);
  };

  const addPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch('/api/pins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, note, author })
    });
    if (res.ok) {
      setTitle(''); setNote(''); setAuthor(''); fetchPins();
    }
  };

  const deletePin = async (id: number) => {
    const res = await fetch(`/api/pins?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchPins();
  };

  return (
    <div className={styles.container}>
      <h1 className="title">Bảng Ghim Của Chúng Ta</h1>

      <form onSubmit={addPin} className={styles.form}>
        <input placeholder="Tiêu đề" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Ghi chú (tùy chọn)" value={note} onChange={e => setNote(e.target.value)} />
        <input placeholder="Ghim bởi (tên)" value={author} onChange={e => setAuthor(e.target.value)} />
        <button type="submit" className="btn btn-accent">Ghim</button>
      </form>

      <div className={styles.list}>
        {pins.map(p => (
          <div key={p.id} className={styles.pinCard}>
            <div className={styles.pinIcon}><PinIcon color="#ff69b4" /></div>
            <div className={styles.content}>
              <h3>{p.title}</h3>
              <p className={styles.note}>{p.note}</p>
              <small className={styles.author}>{p.author}</small>
            </div>
            <button onClick={() => deletePin(p.id)} className={styles.delete}><Trash2 /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
