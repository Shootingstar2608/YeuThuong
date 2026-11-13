'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './music.module.css';
import { Music2, Trash2, Plus, Play, Pause, ChevronLeft, ChevronRight, Volume2, ExternalLink, Sparkles } from 'lucide-react';

function YoutubeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

interface Track { id: number; title: string; artist?: string; url: string }

export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function MusicPage() {
  const [tracks, setTracks]         = useState<Track[]>([]);
  const [title, setTitle]           = useState('');
  const [artist, setArtist]         = useState('');
  const [url, setUrl]               = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [playingId, setPlayingId]   = useState<number | null>(null);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [showVideo, setShowVideo]   = useState(true);
  const audioRef                    = useRef<HTMLAudioElement | null>(null);

  const fetchTracks = async () => {
    const res = await fetch('/api/music');
    if (res.ok) {
      const data = await res.json();
      setTracks(data);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const current = tracks.find(t => t.id === playingId);
  const currentYtId = current ? getYouTubeId(current.url) : null;

  const addTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    let finalTitle = title.trim();
    const ytId = getYouTubeId(url);
    if (!finalTitle && ytId) {
      finalTitle = `YouTube Music (${ytId})`;
    }

    if (!finalTitle) return;

    const res = await fetch('/api/music', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: finalTitle, artist: artist.trim(), url: url.trim() }),
    });

    if (res.ok) {
      setTitle('');
      setArtist('');
      setUrl('');
      setShowForm(false);
      fetchTracks();
    }
  };

  const deleteTrack = async (id: number) => {
    const res = await fetch(`/api/music?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (playingId === id) {
        setPlayingId(null);
        setIsPlaying(false);
      }
      fetchTracks();
    }
  };

  const togglePlay = (track: Track) => {
    const ytId = getYouTubeId(track.url);

    if (playingId !== track.id) {
      setPlayingId(track.id);
      setIsPlaying(true);

      if (ytId) {
        // Track is YouTube: pause native audio
        if (audioRef.current) {
          audioRef.current.pause();
        }
      } else {
        // Track is native MP3
        if (audioRef.current) {
          audioRef.current.src = track.url;
          audioRef.current.play().catch(() => {});
        }
      }
    } else {
      // Toggle play/pause on currently selected track
      if (isPlaying) {
        if (!ytId && audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (!ytId && audioRef.current) audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const playNext = () => {
    if (!playingId || tracks.length < 2) return;
    const idx = tracks.findIndex(t => t.id === playingId);
    const next = tracks[(idx + 1) % tracks.length];
    togglePlay(next);
  };

  const playPrev = () => {
    if (!playingId || tracks.length < 2) return;
    const idx = tracks.findIndex(t => t.id === playingId);
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length];
    togglePlay(prev);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className="eyebrow"><Music2 size={13} /> Our Playlist</p>
          <h1 className={styles.title}>Góc Âm Nhạc</h1>
          <p className={styles.sub}>{tracks.length} bài hát của chúng mình • Hỗ trợ cả YouTube & MP3</p>
        </div>
        <button className="btn" type="button" onClick={() => setShowForm(v => !v)}>
          <Plus size={17} /> {showForm ? 'Đóng lại' : 'Thêm nhạc'}
        </button>
      </div>

      {/* Hidden audio element for direct MP3s */}
      <audio ref={audioRef} onEnded={playNext} />

      {/* Now Playing Bar / Player */}
      {current && (
        <div className={styles.nowPlayingCard}>
          <div className={styles.nowPlayingTop}>
            {/* Vinyl disc / Thumbnail */}
            <div
              className={styles.npDisc}
              style={{
                animationPlayState: isPlaying ? 'running' : 'paused',
                backgroundImage: currentYtId ? `url(https://img.youtube.com/vi/${currentYtId}/hqdefault.jpg)` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {!currentYtId && <Music2 size={28} />}
              {currentYtId && <div className={styles.discHole} />}
            </div>

            <div className={styles.npInfo}>
              <div className={styles.sourceTag}>
                {currentYtId ? (
                  <span className={styles.ytBadge}><YoutubeIcon size={14} /> YouTube Track</span>
                ) : (
                  <span className={styles.mp3Badge}><Music2 size={14} /> MP3 Audio</span>
                )}
                <span className={styles.statusText}>{isPlaying ? 'Đang phát' : 'Tạm dừng'}</span>
              </div>
              <h2 className={styles.npTitle}>{current.title}</h2>
              {current.artist && <p className={styles.npArtist}>{current.artist}</p>}
            </div>

            <div className={styles.npControls}>
              <button type="button" className={styles.ctrlBtn} onClick={playPrev} title="Bài trước">
                <ChevronLeft size={20} />
              </button>
              <button type="button" className={styles.playLargeBtn} onClick={() => togglePlay(current)} title={isPlaying ? 'Tạm dừng' : 'Phát'}>
                {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
              </button>
              <button type="button" className={styles.ctrlBtn} onClick={playNext} title="Bài tiếp">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* If YouTube: Render Embedded Player with quick toggle */}
          {currentYtId && (
            <div className={styles.youtubeContainer}>
              <div className={styles.ytHeaderBar}>
                <span>Trình phát YouTube trực tiếp</span>
                <button
                  type="button"
                  className={styles.toggleVideoBtn}
                  onClick={() => setShowVideo(v => !v)}
                >
                  {showVideo ? 'Thu nhỏ video' : 'Mở rộng video'}
                </button>
              </div>
              {showVideo && (
                <div className={styles.iframeWrapper}>
                  <iframe
                    key={`${currentYtId}-${isPlaying}`}
                    src={`https://www.youtube-nocookie.com/embed/${currentYtId}?autoplay=${isPlaying ? 1 : 0}&enablejsapi=1`}
                    title={current.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className={styles.ytIframe}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <form onSubmit={addTrack} className={styles.addForm}>
          <div className={styles.formHelp}>
            <Sparkles size={16} />
            <span>
              <strong>Dán link YouTube hoặc MP3:</strong> Bạn có thể copy link từ YouTube (nhạc, MV, shorts) hoặc link MP3 từ Catbox.moe / Zing / Soundcloud!
            </span>
          </div>

          <div className={styles.formGrid}>
            <input
              placeholder="Tên bài hát (VD: Cơn mưa tình yêu) *"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
            <input
              placeholder="Ca sĩ / Lời nhắn (VD: Của đôi ta)"
              value={artist}
              onChange={e => setArtist(e.target.value)}
            />
            <input
              placeholder="Dán link YouTube hoặc URL file MP3 *"
              value={url}
              onChange={e => {
                setUrl(e.target.value);
                const ytId = getYouTubeId(e.target.value);
                if (ytId && !title) {
                  setTitle('Bài hát YouTube');
                }
              }}
              type="url"
              required
              className={styles.urlInput}
            />
          </div>

          <div className={styles.formFoot}>
            <button className="btn" type="submit">
              <Plus size={16} /> Thêm vào danh sách
            </button>
            <p className={styles.subtext}>
              💡 Mẹo: Vào YouTube copy link video bất kỳ dán vào ô trên là nghe được ngay!
            </p>
          </div>
        </form>
      )}

      {/* Empty State */}
      {tracks.length === 0 && !showForm && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🎵</div>
          <h2>Playlist của hai bạn chưa có bài hát nào</h2>
          <p>Thêm những bài hát kỷ niệm từ YouTube hoặc file MP3 để cùng nhau thưởng thức nhé!</p>
          <button className="btn" type="button" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Thêm bài hát đầu tiên
          </button>
        </div>
      )}

      {/* Track list */}
      <div className={styles.trackList}>
        {tracks.map((t, i) => {
          const active = t.id === playingId;
          const ytId = getYouTubeId(t.url);

          return (
            <div
              key={t.id}
              className={`${styles.track} ${active ? styles.active : ''}`}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <button
                type="button"
                className={styles.playBtn}
                onClick={() => togglePlay(t)}
                title={active && isPlaying ? 'Tạm dừng' : 'Phát'}
              >
                {active && isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              </button>

              <div className={styles.trackThumb}>
                {ytId ? (
                  <img
                    src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                    alt={t.title}
                    className={styles.thumbImg}
                  />
                ) : (
                  <div className={styles.thumbFallback}>
                    <Music2 size={16} />
                  </div>
                )}
              </div>

              <div className={styles.trackInfo}>
                <div className={styles.trackTitleRow}>
                  <strong className={styles.trackTitle}>{t.title}</strong>
                  {ytId && (
                    <span className={styles.miniYtBadge} title="Nguồn YouTube">
                      <YoutubeIcon size={12} />
                    </span>
                  )}
                </div>
                {t.artist && <span className={styles.trackArtist}>{t.artist}</span>}
              </div>

              {active && (
                <div className={styles.equalizer} aria-hidden="true">
                  <span style={{ animationPlayState: isPlaying ? 'running' : 'paused' }} />
                  <span style={{ animationPlayState: isPlaying ? 'running' : 'paused', animationDelay: '0.15s' }} />
                  <span style={{ animationPlayState: isPlaying ? 'running' : 'paused', animationDelay: '0.3s' }} />
                </div>
              )}

              <a
                href={t.url}
                target="_blank"
                rel="noreferrer"
                className={styles.extLinkBtn}
                title="Mở link gốc"
              >
                <ExternalLink size={15} />
              </a>

              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => deleteTrack(t.id)}
                title="Xoá bài hát"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
