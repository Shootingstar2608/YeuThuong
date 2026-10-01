"use client";

import { useState, useEffect } from 'react';
import styles from './music.module.css';
import { Music as MusicIcon, Trash2 } from 'lucide-react';

interface Track { id: number; title: string; artist?: string; url: string }

export default function MusicPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => { fetchTracks(); }, []);

  const fetchTracks = async () => {
    const res = await fetch('/api/music');
    const data = await res.json();
    setTracks(data);
  };

  const addTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    const res = await fetch('/api/music', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, artist, url }) });
    if (res.ok) { setTitle(''); setArtist(''); setUrl(''); fetchTracks(); }
  };

  const deleteTrack = async (id: number) => {
    const res = await fetch(`/api/music?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchTracks();
  };

  return (
    <div className={styles.container}>
      <h1 className="title">Góc Âm Nhạc</h1>

      <form onSubmit={addTrack} className={styles.addForm}>
        <input placeholder="Tiêu đề" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Nghệ sĩ" value={artist} onChange={e => setArtist(e.target.value)} />
        <input placeholder="URL nhạc (mp3)" value={url} onChange={e => setUrl(e.target.value)} />
        <button className="btn" type="submit">Thêm bài hát</button>
      </form>

      <div className={styles.trackList}>
        {tracks.map(t => (
          <div key={t.id} className={styles.track}>
            <div className={styles.info}>
              <MusicIcon />
              <div>
                <strong>{t.title}</strong>
                <div className={styles.artist}>{t.artist}</div>
              </div>
            </div>
            <audio controls src={t.url} className={styles.audio}></audio>
            <button onClick={() => deleteTrack(t.id)} className={styles.delete}><Trash2 /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
