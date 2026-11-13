'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './random.module.css';
import confetti from 'canvas-confetti';
import { Trash2, Sparkles, Utensils, HeartHandshake, Gift, Flame, Plus, RotateCcw } from 'lucide-react';

interface Item {
  id: number;
  name: string;
  type: string;
}

type TabType = 'FOOD' | 'DATE' | 'GIFT' | 'DARE';

const TABS: { id: TabType; label: string; icon: typeof Utensils; desc: string; sample: string[] }[] = [
  {
    id: 'FOOD',
    label: 'Hôm nay ăn gì?',
    icon: Utensils,
    desc: 'Giải quyết câu hỏi khó nhất hành tinh của các cặp đôi!',
    sample: ['Lẩu Haidilao 🍲', 'Trà sữa full topping 🧋', 'Bún bò Huế 🍜', 'Pizza phô mai 🍕', 'Cơm tấm sườn bì 🍛', 'Tự nấu ở nhà 🍳', 'Đồ nướng Hàn Quốc 🥩', 'Sushi & Sashimi 🍣'],
  },
  {
    id: 'DATE',
    label: 'Hẹn hò ở đâu?',
    icon: HeartHandshake,
    desc: 'Những ý tưởng hẹn hò ngọt ngào cho cuối tuần.',
    sample: ['Đi xem phim rạp 🎬', 'Cafe acoustic yên tĩnh ☕', 'Dạo phố & hóng gió 🛵', 'Ở nhà cùng xem Netflix 🛋️', 'Đi dã ngoại công viên 🧺', 'Đi chụp photobooth 📸', 'Cùng đi siêu thị mua đồ 🛒'],
  },
  {
    id: 'GIFT',
    label: 'Quà bất ngờ',
    icon: Gift,
    desc: 'Những món quà nhỏ hoặc đặc quyền dành cho đối phương.',
    sample: ['Một cái ôm thật chặt 1 phút 🤗', 'Bao một bữa ăn tuỳ chọn 🍽️', 'Mát-xa vai 15 phút 💆', 'Một nụ hôn bất ngờ 💋', 'Một ly trà sữa theo ý thích 🥤', 'Miễn làm việc nhà hôm nay ✨'],
  },
  {
    id: 'DARE',
    label: 'Thử thách yêu',
    icon: Flame,
    desc: 'Thử thách nho nhỏ để hai đứa cùng cười thả ga!',
    sample: ['Nói 3 điều yêu nhất ở đối phương 💬', 'Chụp 1 tấm ảnh mặt xấu dìm hàng 😜', 'Hát 1 đoạn tình ca cho đối phương 🎤', 'Làm nũng 30 giây 🥰', 'Đăng story khen người yêu lên mạng 📱', 'Cho xem ảnh thời bé 👶'],
  },
];

const SLICE_COLORS = [
  '#FF6B8B', '#FFA07A', '#FFB6C1', '#9C88FF',
  '#48DBFB', '#FF9FF3', '#54A0FF', '#FECA57',
  '#1DD1A1', '#FF6B6B', '#F368E0', '#5f27cd',
];

// Play a short synth chime on spin or win using Web Audio API
function playChime(isWin = false) {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (isWin) {
      // Fanfare
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else {
      // Tick sound
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch {
    // AudioContext not allowed or not supported, ignore silently
  }
}

function computeSpinTarget(count: number, currentRotation: number) {
  const winnerIndex = Math.floor(Math.random() * count);
  const arcSize = (2 * Math.PI) / count;
  const sliceCenter = (winnerIndex + 0.5) * arcSize;
  const pointerAngle = (3 * Math.PI) / 2;
  const targetOffset = pointerAngle - sliceCenter;
  const baseRotation = currentRotation % (2 * Math.PI);
  const extraSpins = (5 + Math.floor(Math.random() * 3)) * (2 * Math.PI);
  const finalRotation = baseRotation + extraSpins + (targetOffset - baseRotation);
  return { winnerIndex, arcSize, finalRotation };
}

export default function RandomPage() {
  const [activeTab, setActiveTab] = useState<TabType>('FOOD');
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const fetchItems = useCallback(async (type: string) => {
    try {
      const res = await fetch(`/api/items?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetch(`/api/items?type=${activeTab}`).then(async (res) => {
      if (res.ok) setItems(await res.json());
    });
  }, [activeTab]);

  // Draw the lucky wheel on Canvas
  const drawWheel = useCallback((currentRotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 14;

    ctx.clearRect(0, 0, width, height);

    const count = items.length;
    if (count === 0) {
      // Draw empty placeholder wheel
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#fce4ec';
      ctx.fill();
      ctx.strokeStyle = '#f48fb1';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#880e4f';
      ctx.font = 'bold 15px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Thêm lựa chọn để quay!', centerX, centerY);
      return;
    }

    const arcSize = (2 * Math.PI) / count;

    // Draw slices
    for (let i = 0; i < count; i++) {
      const angle = currentRotation + i * arcSize;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
      ctx.closePath();

      ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length];
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.font = count > 10 ? 'bold 11px "Be Vietnam Pro", sans-serif' : 'bold 13px "Be Vietnam Pro", sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;

      const maxTextLength = count > 8 ? 12 : 18;
      let text = items[i].name;
      if (text.length > maxTextLength) {
        text = text.substring(0, maxTextLength - 1) + '…';
      }
      ctx.fillText(text, radius - 20, 0);
      ctx.restore();
    }

    // Outer ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#ff6b8b';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center heart icon
    ctx.fillStyle = '#ff477e';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♥', centerX, centerY + 1);
  }, [items]);

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [drawWheel, items]);

  const spinWheel = () => {
    if (items.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setResult(null);
    setShowWinnerModal(false);

    const { winnerIndex, arcSize, finalRotation } = computeSpinTarget(items.length, rotationRef.current);
    const startRotation = rotationRef.current;
    const delta = finalRotation - startRotation;
    const duration = 4500; // ms
    let startTime: number | null = null;
    let lastTickAngle = startRotation;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quartic curve
      const ease = 1 - Math.pow(1 - progress, 4);
      const currentAngle = startRotation + delta * ease;
      rotationRef.current = currentAngle;

      // Play tick sound when passing slice boundaries
      if (Math.abs(currentAngle - lastTickAngle) >= arcSize) {
        playChime(false);
        lastTickAngle = currentAngle;
      }

      drawWheel(currentAngle);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const winItem = items[winnerIndex].name;
        setResult(winItem);
        setShowWinnerModal(true);
        playChime(true);
        fireConfetti();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ff477e', '#ff70a6', '#ffd166', '#7bdff2', '#b388ff'],
    });
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newItemName.trim();
    if (!trimmed) return;

    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed, type: activeTab }),
    });

    if (res.ok) {
      setNewItemName('');
      fetchItems(activeTab);
    }
  };

  const deleteItem = async (id: number) => {
    const res = await fetch(`/api/items?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchItems(activeTab);
    }
  };

  const addSampleItems = async () => {
    const currentTabObj = TABS.find((t) => t.id === activeTab);
    if (!currentTabObj) return;

    for (const name of currentTabObj.sample) {
      await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type: activeTab }),
      });
    }
    fetchItems(activeTab);
  };

  const currentTabInfo = TABS.find((t) => t.id === activeTab);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.badge}><Sparkles size={14} /> Couple Roulette</span>
          <h1 className={styles.title}>Vòng Quay May Mắn</h1>
          <p className={styles.subtitle}>Không biết chọn gì? Hãy để định mệnh và tình yêu quyết định thay hai bạn! ♥</p>
        </div>
      </header>

      {/* Tabs */}
      <nav className={styles.tabs} aria-label="Chủ đề vòng quay">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tabBtn} ${isActive ? styles.tabActive : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setResult(null);
                setShowWinnerModal(false);
              }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={styles.contentGrid}>
        {/* Wheel Section */}
        <section className={styles.wheelCard}>
          <div className={styles.wheelHeader}>
            <p className={styles.tabDesc}>{currentTabInfo?.desc}</p>
          </div>

          <div className={styles.wheelContainer}>
            {/* Top Pointer Needle */}
            <div className={styles.pointerWrapper}>
              <div className={styles.pointerHeart}>♥</div>
              <div className={styles.pointerNeedle} />
            </div>

            <canvas
              ref={canvasRef}
              width={380}
              height={380}
              className={styles.wheelCanvas}
            />
          </div>

          <div className={styles.wheelActions}>
            <button
              type="button"
              className={`btn btn-accent ${styles.spinBtn}`}
              onClick={spinWheel}
              disabled={isSpinning || items.length === 0}
            >
              <Sparkles size={20} />
              {isSpinning ? 'Đang quay...' : 'QUAY NGAY!'}
            </button>
          </div>
        </section>

        {/* Item Management Section */}
        <section className={styles.listCard}>
          <div className={styles.listHeader}>
            <h2>
              Danh sách ({items.length})
            </h2>
            {items.length === 0 && (
              <button
                type="button"
                className={styles.sampleBtn}
                onClick={addSampleItems}
                title="Tự động nạp mẫu danh sách gợi ý"
              >
                <Plus size={14} /> Thêm gợi ý mẫu
              </button>
            )}
          </div>

          <form onSubmit={addItem} className={styles.addForm}>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Thêm lựa chọn mới... (vd: Ăn ốc, Đi dạo)"
              maxLength={40}
            />
            <button type="submit" className="btn btn-accent" disabled={!newItemName.trim()}>
              <Plus size={18} /> Thêm
            </button>
          </form>

          {items.length === 0 ? (
            <div className={styles.emptyList}>
              <span className={styles.emptyIcon}>🎡</span>
              <p>Chưa có lựa chọn nào trong chủ đề này.</p>
              <button type="button" className="btn" onClick={addSampleItems}>
                <Plus size={16} /> Nạp danh sách mẫu gợi ý
              </button>
            </div>
          ) : (
            <ul className={styles.itemList}>
              {items.map((item, idx) => (
                <li key={item.id} className={styles.itemRow}>
                  <span
                    className={styles.itemColorDot}
                    style={{ background: SLICE_COLORS[idx % SLICE_COLORS.length] }}
                  />
                  <span className={styles.itemName}>{item.name}</span>
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    className={styles.deleteBtn}
                    title="Xóa lựa chọn này"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Winner Modal */}
      {showWinnerModal && result && (
        <div className={styles.modalOverlay} onClick={() => setShowWinnerModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <span className={styles.modalHeart}>💖</span>
            <p className={styles.modalSub}>Vòng quay đã chọn:</p>
            <h2 className={styles.modalResult}>{result}</h2>
            <p className={styles.modalPrompt}>Hai bạn nhất trí thực hiện ngay bây giờ nhé! 🥰</p>
            <div className={styles.modalBtns}>
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => setShowWinnerModal(false)}
              >
                Tuyệt vời, đồng ý! ✨
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setShowWinnerModal(false);
                  spinWheel();
                }}
              >
                <RotateCcw size={15} /> Quay lại lần nữa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
