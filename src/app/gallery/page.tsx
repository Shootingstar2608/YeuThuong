"use client";

import { useState, useEffect } from 'react';
import styles from './gallery.module.css';

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');

  useEffect(() => { fetchPhotos(); }, []);

  const fetchPhotos = async () => {
    const res = await fetch('/api/photos');
    const data = await res.json();
    setImages(data);
  };

  const addPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    const res = await fetch('/api/photos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, caption })
    });
    if (res.ok) { setUrl(''); setCaption(''); fetchPhotos(); }
  };

  return (
    <div className={styles.container}>
      <h1 className="title">Thư Viện Ảnh</h1>

      <form onSubmit={addPhoto} className={styles.uploadForm}>
        <input placeholder="URL ảnh" value={url} onChange={e => setUrl(e.target.value)} />
        <input placeholder="Chú thích" value={caption} onChange={e => setCaption(e.target.value)} />
        <button className="btn" type="submit">Thêm ảnh</button>
      </form>

      <div className={styles.grid}>
        {images.map((img) => (
          <div key={img.id} className={styles.card}>
            <img src={img.url} alt={img.caption || 'Ảnh'} className={styles.image} />
            <div className={styles.overlay}>
              <h3>{img.caption || 'Không có chú thích'}</h3>
              <p>Hover để xem thêm thông tin chi tiết về bức ảnh này.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
