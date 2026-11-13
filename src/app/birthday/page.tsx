'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Gift,
  Heart,
  LockKeyhole,
  CakeSlice,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star
} from 'lucide-react';
import styles from './birthday.module.css';

function getBirthdayDate(birthday: string) {
  const [year, month, day] = birthday.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

// Melody synth generator using Web Audio API (Happy Birthday chime sequence)
function playChime(freq = 523.25, duration = 0.6) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio error if browser blocks autoplay
  }
}

const MOT_DOI_YOUTUBE_ID = 'JgTZvDbaTtg';
const CHORUS_START_SECOND = 72; // 01:12 - "Ngày hôm nay cho anh được nói: Một đời thương em, một đời yêu em..."

// Thời gian hiển thị từng frame (Frame cuối dài 15.5 giây để thong thả đọc tâm thư)
function getSceneDurationMs(scene: number) {
  if (scene === 4) return 15500; // 15.5s cho frame cuối
  return 11500;                  // 11.5s cho các frame trước
}

const TOTAL_SCENES = 5;

export default function BirthdayPage() {
  const [birthdayValue, setBirthdayValue] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [opened, setOpened] = useState(false);

  // Cinematic Video Story States
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [candleBlown, setCandleBlown] = useState(false);
  const [audioPlayKey, setAudioPlayKey] = useState(0);

  // Load space birthday
  useEffect(() => {
    fetch('/api/space').then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        setBirthdayValue((data.space?.birthday as string | null) ?? '');
      }
    });
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const birthdayDate = birthdayValue ? getBirthdayDate(birthdayValue) : null;
  const isBirthday = birthdayDate ? now >= birthdayDate : false;

  // Sound chimes disabled as requested to keep only the pure background music
  const triggerSceneSound = useCallback((_scene: number) => {
    // Only background music plays
  }, []);

  // Launch fireworks bursts on scene changes
  const launchFireworks = useCallback((scene: number) => {
    if (scene === 0) {
      void confetti({ particleCount: 160, spread: 100, origin: { y: 0.55 }, colors: ['#ff477e', '#ffd166', '#fff7d6', '#7bdff2'] });
    } else if (scene === 2) {
      // Fireworks spectacular
      void confetti({ particleCount: 90, spread: 80, origin: { x: 0.2, y: 0.4 }, colors: ['#ffd166', '#ff70a6', '#70d6ff'] });
      window.setTimeout(() => {
        void confetti({ particleCount: 110, spread: 100, origin: { x: 0.8, y: 0.35 }, colors: ['#ff9770', '#e9ff70', '#ff70a6'] });
      }, 400);
    } else if (scene === 4) {
      // Final love burst
      void confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: ['#ff477e', '#ff99c8', '#fcf6bd'] });
    }
  }, []);

  // Story video loop timer
  useEffect(() => {
    if (!opened || !isPlaying) return;

    const intervalTime = 50; // update progress every 50ms
    const currentDuration = getSceneDurationMs(currentScene);
    const step = (intervalTime / currentDuration) * 100;

    const timer = window.setInterval(() => {
      setSceneProgress((prev) => {
        if (prev >= 100) {
          // Advance to next scene
          if (currentScene < TOTAL_SCENES - 1) {
            const next = currentScene + 1;
            setCurrentScene(next);
            triggerSceneSound(next);
            launchFireworks(next);
            return 0;
          } else {
            // Reached final scene, pause at 100%
            setIsPlaying(false);
            return 100;
          }
        }
        return prev + step;
      });
    }, intervalTime);

    return () => window.clearInterval(timer);
  }, [opened, isPlaying, currentScene, triggerSceneSound, launchFireworks]);

  // Open the gift box
  function openGift() {
    setOpened(true);
    setCurrentScene(0);
    setSceneProgress(0);
    setIsPlaying(true);
    setCandleBlown(false);
    setAudioPlayKey((k) => k + 1);
    triggerSceneSound(0);
    launchFireworks(0);
  }

  // Interactive blow candle in Scene 3
  function blowCandle() {
    if (candleBlown) return;
    setCandleBlown(true);
    void confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.65 },
      colors: ['#ffd166', '#ff70a6', '#ffffff', '#70d6ff']
    });
  }

  // Story controls
  function goToScene(index: number) {
    const target = Math.max(0, Math.min(TOTAL_SCENES - 1, index));
    setCurrentScene(target);
    setSceneProgress(0);
    triggerSceneSound(target);
    launchFireworks(target);
  }

  function replayStory() {
    setCurrentScene(0);
    setSceneProgress(0);
    setCandleBlown(false);
    setIsPlaying(true);
    setAudioPlayKey((k) => k + 1);
    triggerSceneSound(0);
    launchFireworks(0);
  }

  const remaining = birthdayDate ? Math.max(0, birthdayDate.getTime() - now.getTime()) : 0;
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining / 3600000) % 24);
  const minutes = Math.floor((remaining / 60000) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);
  const formattedDate = birthdayDate?.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });

  // -------------------------------------------------------------
  // OPENED: CINEMATIC STORY / VIDEO EXPERIENCE
  // -------------------------------------------------------------
  if (opened) {
    return (
      <main className={styles.videoContainer}>
        {/* Background Music: Một Đời - 14 Casper & Bon Nghiêm (Bắt đầu từ đoạn Điệp khúc 01:12) */}
        {soundEnabled && isPlaying && (
          <iframe
            key={audioPlayKey}
            src={`https://www.youtube-nocookie.com/embed/${MOT_DOI_YOUTUBE_ID}?autoplay=1&start=${CHORUS_START_SECOND}&enablejsapi=1`}
            title="Nhạc nền Một Đời - 14 Casper"
            allow="autoplay"
            className={styles.hiddenAudioFrame}
          />
        )}

        {/* Top Story Progress Bars */}
        <div className={styles.storyProgressWrapper}>
          {Array.from({ length: TOTAL_SCENES }).map((_, idx) => {
            let width = '0%';
            if (idx < currentScene) width = '100%';
            else if (idx === currentScene) width = `${sceneProgress}%`;

            return (
              <div
                key={idx}
                className={styles.progressBarTrack}
                onClick={() => goToScene(idx)}
                title={`Cảnh ${idx + 1}`}
              >
                <div className={styles.progressBarFill} style={{ width }} />
              </div>
            );
          })}
        </div>

        {/* Top Control Bar */}
        <div className={styles.videoTopBar}>
          <div className={styles.musicTrackBadge} title="Đang phát: Một Đời - 14 Casper & Bon Nghiêm">
            <span
              className={styles.musicTrackIcon}
              style={{ animationPlayState: isPlaying && soundEnabled ? 'running' : 'paused' }}
            >
              🎵
            </span>
            <div className={styles.musicTrackMeta}>
              <strong>Một Đời</strong>
              <span>14 Casper • Điệp khúc</span>
            </div>
          </div>
          <div className={styles.controlButtons}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => setSoundEnabled((v) => !v)}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => setIsPlaying((v) => !v)}
              title={isPlaying ? 'Tạm dừng' : 'Tiếp tục phát'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <Link href="/" className={styles.closeBtn} title="Về trang chủ">
              ✕
            </Link>
          </div>
        </div>

        {/* Touch / Click Stepper Overlays (tap left = prev, tap right = next) */}
        <div
          className={styles.touchLeft}
          onClick={() => goToScene(currentScene - 1)}
          aria-label="Cảnh trước"
        />
        <div
          className={styles.touchRight}
          onClick={() => goToScene(currentScene + 1)}
          aria-label="Cảnh sau"
        />

        {/* ========================================================= */}
        {/* FRAME 0: MỞ HỘP VỠ ÒA (GRAND UNBOXING & BURST)           */}
        {/* ========================================================= */}
        {currentScene === 0 && (
          <div className={`${styles.sceneFrame} ${styles.sceneUnboxing}`}>
            <div className={styles.burstBackdrop} />
            <div className={styles.boxAnimation}>
              <div className={styles.animatedGiftLid} />
              <div className={styles.animatedGiftBody}>
                <div className={styles.ribbonV} />
                <div className={styles.ribbonH} />
              </div>
              <div className={styles.beamOfLight} />
            </div>

            <div className={styles.sceneTextCard}>
              <p className={styles.sceneBadge}>✨ ĐIỀU BẤT NGỜ DÀNH CHO EM ✨</p>
              <h1 className={styles.sceneTitle}>Hộp Quà Đã Mở!</h1>
              <p className={styles.sceneDescription}>
                Ting ting... Hôm nay là ngày đẹp nhất trong năm, ngày mà một thiên thần nhỏ đáng yêu đã xuất hiện trên thế giới này!
              </p>
              <span className={styles.autoHint}>Thước phim đang tự động phát... 🎬</span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* FRAME 1: HOA NỞ RỰC RỠ (BLOOMING FLOWERS GARDEN)          */}
        {/* ========================================================= */}
        {currentScene === 1 && (
          <div className={`${styles.sceneFrame} ${styles.sceneBloom}`}>
            {/* Flying petals */}
            <div className={styles.petalsContainer} aria-hidden="true">
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className={styles.flyingPetal}
                  style={{
                    left: `${(i * 7.5) % 96}%`,
                    animationDelay: `${(i * 0.35) % 3}s`,
                    animationDuration: `${4 + (i % 3)}s`,
                  }}
                />
              ))}
            </div>

            {/* Glowing Center Bloom Flower */}
            <div className={styles.bigFlower}>
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className={styles.flowerPetal3D}
                  style={{ transform: `rotate(${i * 30}deg)` }}
                />
              ))}
              <div className={styles.flowerPollenCore}>
                <Heart size={20} fill="currentColor" />
              </div>
            </div>

            <div className={styles.sceneTextCard}>
              <p className={styles.sceneBadge}>🌸 BÔNG HOA XINH ĐẸP NHẤT 🌸</p>
              <h1 className={styles.sceneTitle}>Chúc Mừng Sinh Nhật Em!</h1>
              <p className={styles.sceneDescription}>
                Chúc cô gái của anh tuổi mới luôn tươi tắn, rạng rỡ và tràn ngập niềm vui như những đóa hoa đang khoe sắc này.
              </p>
              <div className={styles.quotePill}>
                &ldquo;Cảm ơn em vì đã đến và làm dịu dàng cả cuộc đời anh.&rdquo;
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* FRAME 2: BẦU TRỜI ĐÊM & PHÁO HOA (MIDNIGHT FIREWORKS)     */}
        {/* ========================================================= */}
        {currentScene === 2 && (
          <div className={`${styles.sceneFrame} ${styles.sceneFireworks}`}>
            {/* Animated Fireworks */}
            <div className={styles.skyFireworks} aria-hidden="true">
              <div className={`${styles.fireworkBurst} ${styles.fwPos1}`} />
              <div className={`${styles.fireworkBurst} ${styles.fwPos2}`} />
              <div className={`${styles.fireworkBurst} ${styles.fwPos3}`} />
              <div className={`${styles.fireworkBurst} ${styles.fwPos4}`} />
            </div>

            {/* Twinkling Stars */}
            <div className={styles.starryField}>
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  className={styles.twinkleStar}
                  style={{
                    top: `${(i * 17) % 85}%`,
                    left: `${(i * 23) % 92}%`,
                    animationDelay: `${(i * 0.25) % 2}s`,
                  }}
                >
                  <Star size={10} fill="currentColor" />
                </span>
              ))}
            </div>

            <div className={styles.sceneTextCard}>
              <p className={styles.sceneBadge}>✨ TỎA SÁNG NHƯ CÁC VÌ SAO ✨</p>
              <h1 className={styles.sceneTitle}>Rực Rỡ Tuổi Mới</h1>
              <p className={styles.sceneDescription}>
                Anh mong tuổi mới của em sẽ luôn lung linh và rực sáng như những chùm pháo hoa thắp sáng cả bầu trời đêm.
              </p>
              <div className={styles.quotePill}>
                &ldquo;Dù ngoài kia có phong ba bão táp, anh vẫn sẽ là ngọn lửa ấm áp che chở cho em.&rdquo;
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* FRAME 3: BÁNH KEM & THỔI NẾN (INTERACTIVE CAKE & WISH)   */}
        {/* ========================================================= */}
        {currentScene === 3 && (
          <div className={`${styles.sceneFrame} ${styles.sceneCake}`}>
            <div className={styles.cakeContainer} onClick={blowCandle}>
              {/* Candle flame */}
              <div className={styles.candleWrapper}>
                {!candleBlown ? (
                  <div className={styles.flame}>
                    <Flame size={28} fill="#ffbe0b" color="#fb5607" />
                  </div>
                ) : (
                  <div className={styles.smokePuff}>💨</div>
                )}
                <div className={styles.candleStick} />
              </div>

              {/* 3-Tier Birthday Cake */}
              <div className={styles.cakeTierTop}>
                <span className={styles.berry}>🍓</span>
                <span className={styles.berry}>🍓</span>
                <span className={styles.berry}>🍓</span>
              </div>
              <div className={styles.cakeTierMiddle}>
                <span className={styles.creamDrip} />
                <span className={styles.creamDrip} />
                <span className={styles.creamDrip} />
              </div>
              <div className={styles.cakeTierBottom}>
                <span className={styles.plateGlaze} />
              </div>
            </div>

            <div className={styles.sceneTextCard}>
              <p className={styles.sceneBadge}>🎂 ƯỚC NGUYỆN SINH NHẬT 🎂</p>
              <h1 className={styles.sceneTitle}>
                {candleBlown ? 'Điều Ước Đã Được Gửi Đi!' : 'Thổi Nến Ước Nguyện'}
              </h1>
              <p className={styles.sceneDescription}>
                {candleBlown
                  ? '✨ Các vì sao đã nghe thấy điều ước của em! Anh hứa sẽ luôn bên cạnh để cùng em biến điều ước ấy thành sự thật.'
                  : 'Hãy nhắm mắt lại, ước một điều thật đẹp trong lòng... Rồi chạm tay vào ngọn nến để thổi nhé!'}
              </p>

              {!candleBlown ? (
                <button type="button" className={styles.blowBtn} onClick={blowCandle}>
                  <Flame size={18} /> Chạm vào đây để thổi nến ✨
                </button>
              ) : (
                <div className={styles.successPill}>
                  ✓ Đã thổi nến thành công • May mắn trọn vẹn!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* FRAME 4: BỨC TÂM THƯ YÊU THƯƠNG & FINALE (LOVE LETTER)    */}
        {/* ========================================================= */}
        {currentScene === 4 && (
          <div className={`${styles.sceneFrame} ${styles.sceneFinale}`}>
            <div className={styles.letterCard}>
              <div className={styles.letterHeartSeal}>
                <Heart size={28} fill="currentColor" />
              </div>

              <p className={styles.letterEyebrow}>Gửi em, cô gái mà anh thương nhất</p>
              <h2 className={styles.letterHeadline}>Happy Birthday, Em Yêu! 💕</h2>

              <div className={styles.letterContent}>
                <p>
                  Tuổi mới lại đến với em rồi. Anh chỉ mong em luôn khỏe mạnh, bình an và giữ mãi nụ cười hồn nhiên, rạng rỡ trên môi.
                </p>
                <p className={styles.lyricHighlight}>
                  &ldquo;Hãy nở nụ cười mà em xứng đáng, phần đời còn lại để anh lo toan. Muôn lối dẫn ta về chung một đời thênh thang...&rdquo;
                </p>
                <p>
                  Mọi âu lo mệt mỏi hãy để lại năm cũ, niềm vui và hạnh phúc cứ để anh lo. Dù cuộc sống ngoài kia có bộn bề thế nào, hãy nhớ rằng anh luôn ở đây, là chỗ dựa và bến đỗ bình yên nhất của em.
                </p>
                <p className={styles.signatureText}>
                  Một đời thương em, một đời yêu em ♥
                  <small style={{ display: 'block', fontSize: '0.85rem', opacity: 0.85, marginTop: '0.4rem', fontWeight: 600 }}>
                    — Chồng yêu của Vân gửi Vợ yêu của Phúc —
                  </small>
                </p>
              </div>

              <div className={styles.finaleActions}>
                <button type="button" className={styles.replayBtn} onClick={replayStory}>
                  <RotateCcw size={17} /> Xem lại từ đầu
                </button>
                <Link href="/" className={styles.homeLink}>
                  Về góc nhỏ Our Space 🏠
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className={styles.videoBottomBar}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => goToScene(currentScene - 1)}
            disabled={currentScene === 0}
          >
            <ChevronLeft size={18} /> Cảnh trước
          </button>
          <span className={styles.sceneIndicator}>
            {currentScene + 1} / {TOTAL_SCENES}
          </span>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => goToScene(currentScene + 1)}
            disabled={currentScene === TOTAL_SCENES - 1}
          >
            Cảnh sau <ChevronRight size={18} />
          </button>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // INITIAL STAGE: GIFT BOX WAITING TO BE OPENED
  // -------------------------------------------------------------
  return (
    <main className={styles.page}>
      <div className={styles.pageGlow} aria-hidden="true" />
      <Link href="/" className={styles.backLink}>
        <ArrowLeft size={17} /> Về trang chủ
      </Link>
      <section className={styles.giftStage}>
        <p className={styles.kicker}>
          <CakeSlice size={17} /> một điều thật đặc biệt đang chờ em
        </p>
        <h1>Hộp quà sinh nhật</h1>
        <p className={styles.intro}>
          {birthdayValue === null
            ? 'Đang tìm món quà của hai bạn...'
            : !birthdayValue
            ? 'Chủ space chưa cài ngày sinh nhật trong mục Cài đặt.'
            : isBirthday
            ? 'Đến lúc mở món quà bí mật dành riêng cho em rồi!'
            : `Quà sẽ mở vào ${formattedDate}. Cùng đợi thêm một chút nhé!`}
        </p>

        {/* Interactive 3D Gift Box Button */}
        <button
          type="button"
          className={`${styles.giftButton} ${isBirthday ? styles.ready : ''}`}
          onClick={openGift}
          disabled={!isBirthday}
          aria-label={isBirthday ? 'Mở quà sinh nhật' : 'Quà sinh nhật đang bị khóa'}
        >
          <span className={styles.giftBox}>
            <span className={styles.giftLid} />
            <span className={styles.giftRibbonVertical} />
            <span className={styles.giftRibbonHorizontal} />
            <span className={styles.giftBow}>♡</span>
          </span>

          {!isBirthday && (
            <span className={styles.lock}>
              <LockKeyhole size={16} />{' '}
              {birthdayValue ? 'Chưa đến ngày mở quà' : 'Chưa cài ngày sinh nhật'}
            </span>
          )}

          {isBirthday && (
            <span className={styles.openLabel}>
              <Gift size={18} /> Nhận quà ngay
            </span>
          )}
        </button>

        {!isBirthday && birthdayValue && (
          <div className={styles.countdown} aria-label="Thời gian còn lại">
            <div>
              <strong>{days}</strong>
              <span>ngày</span>
            </div>
            <b>:</b>
            <div>
              <strong>{String(hours).padStart(2, '0')}</strong>
              <span>giờ</span>
            </div>
            <b>:</b>
            <div>
              <strong>{String(minutes).padStart(2, '0')}</strong>
              <span>phút</span>
            </div>
            <b>:</b>
            <div>
              <strong>{String(seconds).padStart(2, '0')}</strong>
              <span>giây</span>
            </div>
          </div>
        )}

        {isBirthday && (
          <p className={styles.hint}>
            Chạm vào hộp quà để bắt đầu thước phim bất ngờ ✨
          </p>
        )}
      </section>
    </main>
  );
}