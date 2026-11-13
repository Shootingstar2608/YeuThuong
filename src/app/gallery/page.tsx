'use client';

import { useState, useEffect } from 'react';
import styles from './gallery.module.css';
import { Plus, X, Images, Trash2 } from 'lucide-react';

interface Photo { id: number; url: string; caption: string | null }

export default function GalleryPage() {
  const [images, setImages]   = useState<Photo[]>([]);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl]           = useState('');
  const [caption, setCaption]   = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchPhotos = async () => {
    const res  = await fetch('/api/photos');
    if (res.ok) {
      const data = await res.json();
      setImages(data);
    }
  };

  useEffect(() => {
    fetch('/api/photos').then(async (r) => {
      if (r.ok) setImages(await r.json());
    });
  }, []);

  const addPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    const res = await fetch('/api/photos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, caption }),
    });
    if (res.ok) { setUrl(''); setCaption(''); setShowForm(false); fetchPhotos(); }
  };

  const deletePhoto = async (id: number) => {
    setDeleting(id);
    const res = await fetch(`/api/photos?id=${id}`, { method: 'DELETE' });
    if (res.ok) { fetchPhotos(); if (selected?.id === id) setSelected(null); }
    setDeleting(null);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className="eyebrow"><Images size={13} /> Shared Memories</p>
          <h1 className={styles.title}>Thư Viện Ảnh</h1>
          <p className={styles.subtitle}>{images.length} kỷ niệm được lưu giữ</p>
        </div>
        <button className="btn" onClick={() => setShowForm(v => !v)} type="button">
          <Plus size={17} /> {showForm ? 'Huỷ' : 'Thêm ảnh'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={addPhoto} className={styles.addForm}>
          <div className={styles.formFields}>
            <input placeholder="URL ảnh (bắt buộc)" value={url} onChange={e => setUrl(e.target.value)} type="url" required />
            <input placeholder="Chú thích (tuỳ chọn)" value={caption} onChange={e => setCaption(e.target.value)} />
          </div>
          {url && (
            <div className={styles.preview}>
              <img src={url} alt="preview" onError={e => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
          <button className="btn" type="submit">Lưu vào album</button>
        </form>
      )}

      {/* Empty state */}
      {images.length === 0 && !showForm && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📸</div>
          <h2>Album đang chờ kỷ niệm đầu tiên</h2>
          <p>Thêm đường dẫn ảnh để bắt đầu lưu lại những khoảnh khắc đẹp nhất.</p>
          <button className="btn" onClick={() => setShowForm(true)} type="button">
            <Plus size={16} /> Thêm ảnh đầu tiên
          </button>
        </div>
      )}

      {/* Gallery Grid */}
      <div className={styles.grid}>
        {images.map((img, i) => (
          <button
            key={img.id}
            className={styles.card}
            type="button"
            onClick={() => setSelected(img)}
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <img src={img.url} alt={img.caption || 'Ảnh'} className={styles.image} loading="lazy" />
            <div className={styles.overlay}>
              <p className={styles.overlayCaption}>{img.caption || 'Một kỷ niệm của chúng mình'}</p>
              <span className={styles.overlayHint}>Xem ảnh lớn</span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" onClick={() => setSelected(null)}>
          <div className={styles.lightboxInner} onClick={e => e.stopPropagation()}>
            <img src={selected.url} alt={selected.caption || 'Ảnh kỷ niệm'} className={styles.lightboxImg} />
            {selected.caption && <p className={styles.lightboxCaption}>{selected.caption}</p>}
            <div className={styles.lightboxActions}>
              <button
                className={styles.deleteLightbox}
                type="button"
                onClick={() => deletePhoto(selected.id)}
                disabled={deleting === selected.id}
              >
                <Trash2 size={16} />
                {deleting === selected.id ? 'Đang xoá...' : 'Xoá ảnh'}
              </button>
              <button className={styles.closeLightbox} type="button" onClick={() => setSelected(null)}>
                <X size={16} /> Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
