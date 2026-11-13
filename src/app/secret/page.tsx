'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Lock,
  Unlock,
  Flame,
  ShieldAlert,
  Sparkles,
  Dice5,
  BookOpen,
  Scroll,
  Shirt,
  Check,
  Plus,
  Trash2,
  RotateCcw,
  Heart,
  Crown,
  Edit3,
  X
} from 'lucide-react';
import styles from './secret.module.css';
import { BUILTIN_CARDS, COSPLAY_OUTFITS, BDSM_PROPS, BuiltinCard } from '@/lib/secretData';

interface CustomCard {
  id: number;
  type: string;
  content: string;
  level: number;
}

interface CustomItem {
  id: number;
  category: 'COSPLAY' | 'PROP';
  name: string;
  desc?: string | null;
  icon?: string | null;
}

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  rating: number;
  date: string;
  author: string;
  tags: string;
}

interface ContractData {
  id: number;
  bossName: string;
  slaveName: string;
  rules: string;
  hardLimits: string;
  safewords: string;
  aftercare: string;
  bossSigned: boolean;
  slaveSigned: boolean;
  bossSignature: string | null;
  slaveSignature: string | null;
  signedAt: string | null;
}

const DEFAULT_CONTRACT_RULES = [
  "Tuyệt đối vâng lời mệnh lệnh của Boss trong suốt buổi train",
  "Luôn sử dụng xưng hô Boss - Em/Nô lệ",
  "Thông báo ngay lập tức nếu cảm thấy không an toàn",
  "Tuân thủ nghiêm ngặt từ an toàn",
];

const DEFAULT_CONTRACT_LIMITS = [
  "Không gây tổn thương vĩnh viễn",
  "Không ghi hình phát tán bên ngoài",
  "Dừng lại ngay khi hô từ an toàn ĐỎ",
];

const DEFAULT_SAFEWORDS = "🔴 ĐỎ: Dừng lại ngay lập tức | 🟡 VÀNG: Chậm lại hoặc giảm cường độ | 🟢 XANH: Cảm giác rất tốt, tiếp tục";
const DEFAULT_AFTERCARE = "Ôm ấp vỗ về, uống nước ấm, khen ngợi và cùng nhau trò chuyện ngọt ngào sau khi kết thúc buổi train.";

function parseJsonArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      if (parsed) return [String(parsed)];
    } catch {
      return val.split('\n').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
}

// -------------------------------------------------------------
// SIGNATURE PAD CANVAS COMPONENT
// -------------------------------------------------------------
function SignaturePadModal({
  title,
  onSave,
  onCancel,
}: {
  title: string;
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#8b0029'; // Mực đỏ rượu vang BDSM sang trọng
  }, []);

  function startDrawing(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function draw(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }

  function stopDrawing(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    setIsDrawing(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }

  function saveSignature() {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  }

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.padCard}>
        <div className={styles.padHeader}>
          <h3 className={styles.padTitle}>✍️ Ký Tên Trực Tiếp: {title}</h3>
          <button type="button" onClick={onCancel} className={styles.closePadBtn}>
            <X size={18} />
          </button>
        </div>

        <p className={styles.padDesc}>
          Dùng <strong>ngón tay / bút cảm ứng</strong> (trên điện thoại, iPad) hoặc <strong>chuột</strong> (trên máy tính) để vẽ chữ ký của bạn vào khung bên dưới:
        </p>

        <div className={styles.canvasContainer}>
          <canvas
            ref={canvasRef}
            width={380}
            height={160}
            className={styles.signatureCanvas}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
          />
          <div className={styles.signatureGuideLine}>
            <span>✕ Ký tại đây</span>
          </div>
        </div>

        <div className={styles.padBtnRow}>
          <button type="button" onClick={clearCanvas} className={styles.padBtnClear}>
            <RotateCcw size={15} /> Xóa vẽ lại
          </button>
          <div className={styles.padRightBtns}>
            <button type="button" onClick={onCancel} className={styles.padBtnCancel}>
              Hủy
            </button>
            <button
              type="button"
              onClick={saveSignature}
              disabled={!hasDrawn}
              className={styles.padBtnSave}
            >
              <Check size={16} /> Đóng dấu chữ ký
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MAIN SECRET PAGE
// -------------------------------------------------------------
export default function SecretPage() {
  // Lock state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'GAME' | 'RANDOMIZER' | 'JOURNAL' | 'CONTRACT'>('GAME');

  // Game 18+ Truth or Dare states
  const [gameFilter, setGameFilter] = useState<'ALL' | 'FOREPLAY' | 'TRUTH' | 'DARE' | 'TRAIN'>('ALL');
  const [levelFilter, setLevelFilter] = useState<number>(0);
  const [currentCard, setCurrentCard] = useState<BuiltinCard | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [customCards, setCustomCards] = useState<CustomCard[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardType, setNewCardType] = useState<'FOREPLAY' | 'TRUTH' | 'DARE' | 'TRAIN'>('DARE');
  const [newCardContent, setNewCardContent] = useState('');
  const [newCardLevel, setNewCardLevel] = useState<number>(2);

  // Randomizer states
  const [selectedCosplay, setSelectedCosplay] = useState<typeof COSPLAY_OUTFITS[0] | null>(null);
  const [selectedProp, setSelectedProp] = useState<typeof BDSM_PROPS[0] | null>(null);
  const [selectedTask, setSelectedTask] = useState<BuiltinCard | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemCategory, setNewItemCategory] = useState<'COSPLAY' | 'PROP'>('COSPLAY');
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemIcon, setNewItemIcon] = useState('👗');

  // Journal states
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [showAddJournal, setShowAddJournal] = useState(false);
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalRating, setJournalRating] = useState(5);
  const [journalAuthor, setJournalAuthor] = useState<'Boss' | 'Slave'>('Boss');

  // Contract states
  const [contract, setContract] = useState<ContractData | null>(null);
  const [signSuccess, setSignSuccess] = useState(false);
  const [signingModalRole, setSigningModalRole] = useState<'BOSS' | 'SLAVE' | null>(null);

  // Contract Editing states (Mục I, II, III, IV)
  const [isEditingContract, setIsEditingContract] = useState(false);
  const [editRules, setEditRules] = useState<string[]>([]);
  const [editLimits, setEditLimits] = useState<string[]>([]);
  const [editSafewords, setEditSafewords] = useState('');
  const [editAftercare, setEditAftercare] = useState('');
  const [newRuleInput, setNewRuleInput] = useState('');
  const [newLimitInput, setNewLimitInput] = useState('');

  // Check session unlock on mount
  useEffect(() => {
    const unlocked = sessionStorage.getItem('secret_bdsm_unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  // Fetch initial data when unlocked
  useEffect(() => {
    if (!isUnlocked) return;

    fetch('/api/secret/cards')
      .then(res => res.ok ? res.json() : [])
      .then(data => setCustomCards(data))
      .catch(() => {});

    fetch('/api/secret/items')
      .then(res => res.ok ? res.json() : [])
      .then(data => setCustomItems(data))
      .catch(() => {});

    fetch('/api/secret/journal')
      .then(res => res.ok ? res.json() : [])
      .then(data => setJournals(data))
      .catch(() => {});

    fetch('/api/secret/contract')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setContract(data);
          const parsedRules = parseJsonArray(data.rules);
          const parsedLimits = parseJsonArray(data.hardLimits);
          setEditRules(parsedRules.length > 0 ? parsedRules : DEFAULT_CONTRACT_RULES);
          setEditLimits(parsedLimits.length > 0 ? parsedLimits : DEFAULT_CONTRACT_LIMITS);
          setEditSafewords(data.safewords || DEFAULT_SAFEWORDS);
          setEditAftercare(data.aftercare || DEFAULT_AFTERCARE);
        }
      })
      .catch(() => {});
  }, [isUnlocked]);

  // Handle PIN Unlock
  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (pinInput === '2608' || pinInput === '1711' || pinInput === 'boss' || pinInput.length >= 4) {
      sessionStorage.setItem('secret_bdsm_unlocked', 'true');
      setIsUnlocked(true);
      setPinError(false);
      void confetti({ particleCount: 70, spread: 70, colors: ['#8b0029', '#ff477e', '#ffd166'] });
    } else {
      setPinError(true);
    }
  }

  // Panic Button: immediate exit to safe home page
  function handlePanic() {
    sessionStorage.removeItem('secret_bdsm_unlocked');
    window.location.href = '/';
  }

  // -------------------------------------------------------------
  // GAME 18+ LOGIC
  // -------------------------------------------------------------
  const allAvailableCards: BuiltinCard[] = [
    ...BUILTIN_CARDS,
    ...customCards.map(c => ({
      id: `custom-${c.id}`,
      type: c.type as BuiltinCard['type'],
      level: c.level as BuiltinCard['level'],
      content: c.content,
    }))
  ];

  function drawRandomCard() {
    setIsCardFlipped(false);
    setTimeout(() => {
      let pool = allAvailableCards;
      if (gameFilter !== 'ALL') {
        pool = pool.filter(c => c.type === gameFilter);
      }
      if (levelFilter > 0) {
        pool = pool.filter(c => c.level === levelFilter);
      }
      if (pool.length === 0) pool = allAvailableCards;

      const randomIdx = Math.floor(Math.random() * pool.length);
      setCurrentCard(pool[randomIdx]);
      setIsCardFlipped(true);
    }, 200);
  }

  async function handleAddCustomCard(e: React.FormEvent) {
    e.preventDefault();
    if (!newCardContent.trim()) return;

    const res = await fetch('/api/secret/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: newCardType, content: newCardContent, level: newCardLevel }),
    });

    if (res.ok) {
      const created = await res.json();
      setCustomCards(prev => [created, ...prev]);
      setNewCardContent('');
      setShowAddCard(false);
    }
  }

  async function handleDeleteCustomCard(id: number) {
    const res = await fetch(`/api/secret/cards?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCustomCards(prev => prev.filter(c => c.id !== id));
    }
  }

  // -------------------------------------------------------------
  // RANDOMIZER LOGIC (COSPLAY & BDSM PROPS & TASKS)
  // -------------------------------------------------------------
  const allAvailableCosplays = [
    ...COSPLAY_OUTFITS,
    ...customItems
      .filter(item => item.category === 'COSPLAY')
      .map(item => ({
        id: `custom-cosplay-${item.id}`,
        name: item.name,
        icon: item.icon || '👗',
        desc: item.desc || 'Trang phục tùy chọn của hai bạn',
      })),
  ];

  const allAvailableProps = [
    ...BDSM_PROPS,
    ...customItems
      .filter(item => item.category === 'PROP')
      .map(item => ({
        id: `custom-prop-${item.id}`,
        name: item.name,
        icon: item.icon || '⛓️',
        desc: item.desc || 'Đạo cụ riêng của hai bạn',
      })),
  ];

  function spinRandomizer() {
    setIsSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      setSelectedCosplay(allAvailableCosplays[Math.floor(Math.random() * allAvailableCosplays.length)]);
      setSelectedProp(allAvailableProps[Math.floor(Math.random() * allAvailableProps.length)]);
      const trainTasks = allAvailableCards.filter(c => c.type === 'TRAIN');
      const taskPool = trainTasks.length > 0 ? trainTasks : BUILTIN_CARDS.filter(c => c.type === 'TRAIN');
      setSelectedTask(taskPool[Math.floor(Math.random() * taskPool.length)]);
      count++;
      if (count >= 12) {
        clearInterval(interval);
        setIsSpinning(false);
        void confetti({ particleCount: 60, spread: 60, colors: ['#ff477e', '#ffd166', '#d4af37'] });
      }
    }, 100);
  }

  async function handleAddCustomItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const res = await fetch('/api/secret/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: newItemCategory,
        name: newItemName.trim(),
        desc: newItemDesc.trim(),
        icon: newItemIcon.trim() || (newItemCategory === 'COSPLAY' ? '👗' : '⛓️'),
      }),
    });

    if (res.ok) {
      const created = await res.json();
      setCustomItems(prev => [created, ...prev]);
      setNewItemName('');
      setNewItemDesc('');
      setShowAddItem(false);
    }
  }

  async function handleDeleteCustomItem(id: number) {
    const res = await fetch(`/api/secret/items?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCustomItems(prev => prev.filter(item => item.id !== id));
    }
  }

  // -------------------------------------------------------------
  // JOURNAL LOGIC
  // -------------------------------------------------------------
  async function handleAddJournal(e: React.FormEvent) {
    e.preventDefault();
    if (!journalTitle.trim() || !journalContent.trim()) return;

    const res = await fetch('/api/secret/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: journalTitle,
        content: journalContent,
        rating: journalRating,
        author: journalAuthor,
        date: new Date().toISOString().split('T')[0],
      }),
    });

    if (res.ok) {
      const created = await res.json();
      setJournals(prev => [created, ...prev]);
      setJournalTitle('');
      setJournalContent('');
      setShowAddJournal(false);
    }
  }

  async function handleDeleteJournal(id: number) {
    const res = await fetch(`/api/secret/journal?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setJournals(prev => prev.filter(j => j.id !== id));
    }
  }

  // -------------------------------------------------------------
  // CONTRACT CLAUSES EDITING (Mục I, II, III, IV)
  // -------------------------------------------------------------
  function addRule() {
    if (!newRuleInput.trim()) return;
    setEditRules(prev => [...prev, newRuleInput.trim()]);
    setNewRuleInput('');
  }

  function removeRule(index: number) {
    setEditRules(prev => prev.filter((_, i) => i !== index));
  }

  function addLimit() {
    if (!newLimitInput.trim()) return;
    setEditLimits(prev => [...prev, newLimitInput.trim()]);
    setNewLimitInput('');
  }

  function removeLimit(index: number) {
    setEditLimits(prev => prev.filter((_, i) => i !== index));
  }

  async function saveContractClauses() {
    const finalRules = [...editRules];
    if (newRuleInput.trim()) {
      finalRules.push(newRuleInput.trim());
      setNewRuleInput('');
    }
    const finalLimits = [...editLimits];
    if (newLimitInput.trim()) {
      finalLimits.push(newLimitInput.trim());
      setNewLimitInput('');
    }

    setEditRules(finalRules);
    setEditLimits(finalLimits);

    const res = await fetch('/api/secret/contract', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rules: finalRules,
        hardLimits: finalLimits,
        safewords: editSafewords.trim() || DEFAULT_SAFEWORDS,
        aftercare: editAftercare.trim() || DEFAULT_AFTERCARE,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setContract(updated);
      setIsEditingContract(false);
      setSignSuccess(true);
      setTimeout(() => setSignSuccess(false), 3000);
      void confetti({ particleCount: 90, spread: 70, colors: ['#ffd166', '#ff477e', '#8b0029'] });
    }
  }

  // -------------------------------------------------------------
  // ONLINE DRAWN SIGNATURES LOGIC
  // -------------------------------------------------------------
  async function handleSaveOnlineSignature(dataUrl: string) {
    if (!signingModalRole) return;
    const isBoss = signingModalRole === 'BOSS';

    const payload = isBoss
      ? { bossSigned: true, bossSignature: dataUrl }
      : { slaveSigned: true, slaveSignature: dataUrl };

    const res = await fetch('/api/secret/contract', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const updated = await res.json();
      setContract(updated);
      setSigningModalRole(null);
      setSignSuccess(true);
      setTimeout(() => setSignSuccess(false), 3000);
      void confetti({ particleCount: 140, spread: 90, colors: ['#ffd166', '#8b0029', '#ffffff'] });
    }
  }

  async function handleClearSignature(role: 'BOSS' | 'SLAVE') {
    const isBoss = role === 'BOSS';
    const payload = isBoss
      ? { bossSigned: false, bossSignature: null }
      : { slaveSigned: false, slaveSignature: null };

    const res = await fetch('/api/secret/contract', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const updated = await res.json();
      setContract(updated);
    }
  }

  // -------------------------------------------------------------
  // RENDER: LOCK SCREEN
  // -------------------------------------------------------------
  if (!isUnlocked) {
    return (
      <main className={styles.lockPage}>
        <div className={styles.lockCard}>
          <div className={styles.lockIconGlow}>
            <Lock size={36} />
          </div>
          <span className={styles.lockBadge}>Private • BDSM Corner</span>
          <h1 className={styles.lockTitle}>Khu Vực Riêng Tư 18+</h1>
          <p className={styles.lockDesc}>
            Lãnh địa bí mật chỉ dành riêng cho <strong>Boss (chồng yêu của Vân)</strong> & <strong>Slave (vợ yêu của Phúc)</strong>.
          </p>

          <form onSubmit={handleUnlock} className={styles.pinForm}>
            <input
              type="password"
              placeholder="Nhập mã bí mật (VD: 2608)..."
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              className={`${styles.pinInput} ${pinError ? styles.pinError : ''}`}
              autoFocus
            />
            {pinError && <p className={styles.errorText}>Mã PIN chưa chính xác (Gợi ý: 2608 hoặc 1711)</p>}

            <button type="submit" className={styles.unlockBtn}>
              <Unlock size={18} /> Khám phá lãnh địa
            </button>

            <button
              type="button"
              className={styles.quickUnlockBtn}
              onClick={() => {
                sessionStorage.setItem('secret_bdsm_unlocked', 'true');
                setIsUnlocked(true);
              }}
            >
              Mở khóa nhanh (Không cần mật khẩu)
            </button>
          </form>

          <Link href="/" className={styles.backLink}>
            ← Quay lại trang chủ bình thường
          </Link>
        </div>
      </main>
    );
  }

  // Current contract display lists
  const parsedContractRules = parseJsonArray(contract?.rules);
  const currentRules: string[] = parsedContractRules.length > 0 ? parsedContractRules : DEFAULT_CONTRACT_RULES;
  const parsedContractLimits = parseJsonArray(contract?.hardLimits);
  const currentLimits: string[] = parsedContractLimits.length > 0 ? parsedContractLimits : DEFAULT_CONTRACT_LIMITS;

  return (
    <div className={styles.secretContainer}>
      {/* Signature Modal when active */}
      {signingModalRole && (
        <SignaturePadModal
          title={signingModalRole === 'BOSS' ? 'Boss (chồng yêu của Vân)' : 'Slave (vợ yêu của Phúc)'}
          onSave={handleSaveOnlineSignature}
          onCancel={() => setSigningModalRole(null)}
        />
      )}

      {/* Top Header Bar */}
      <header className={styles.secretHeader}>
        <div className={styles.roleIdentity}>
          <div className={styles.bossBadge}>
            <Crown size={15} />
            <span>Boss: <strong>chồng yêu của Vân</strong></span>
          </div>
          <span className={styles.linkChain}>⛓️</span>
          <div className={styles.slaveBadge}>
            <Heart size={14} fill="currentColor" />
            <span>Slave: <strong>vợ yêu của Phúc</strong></span>
          </div>
        </div>

        {/* Panic Button */}
        <button
          type="button"
          onClick={handlePanic}
          className={styles.panicButton}
          title="Thoát chế độ ẩn ngay lập tức khi có người ngoài"
        >
          <ShieldAlert size={16} />
          <span>Thoát ẩn (Panic)</span>
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className={styles.navTabs}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'GAME' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('GAME')}
        >
          <Dice5 size={18} />
          <span>Game 18+ Truth / Dare</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'RANDOMIZER' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('RANDOMIZER')}
        >
          <Shirt size={18} />
          <span>Cosplay & Đạo cụ</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'JOURNAL' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('JOURNAL')}
        >
          <BookOpen size={18} />
          <span>Nhật ký Train ({journals.length})</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'CONTRACT' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('CONTRACT')}
        >
          <Scroll size={18} />
          <span>Hợp đồng Nô lệ {contract?.bossSigned && contract?.slaveSigned ? '✓' : ''}</span>
        </button>
      </nav>

      {/* ========================================================= */}
      {/* TAB 1: GAME 18+ (TRUTH OR DARE)                          */}
      {/* ========================================================= */}
      {activeTab === 'GAME' && (
        <section className={styles.sectionCard}>
          <div className={styles.cardHeaderRow}>
            <div>
              <span className={styles.badgeSm}>Couple Intimacy Cards</span>
              <h2 className={styles.sectionTitle}>Game 18+ Khơi Gợi & Thử Thách</h2>
              <p className={styles.sectionSubtitle}>
                Hơn 50+ thẻ nhiệm vụ dạo đầu, sự thật kín đáo và thử thách SM dành riêng cho Boss & Slave.
              </p>
            </div>
            <button
              type="button"
              className={styles.actionBtnOutline}
              onClick={() => setShowAddCard(v => !v)}
            >
              <Plus size={16} /> {showAddCard ? 'Đóng' : 'Tự thêm thẻ mới'}
            </button>
          </div>

          {/* Form thêm thẻ tự chế */}
          {showAddCard && (
            <form onSubmit={handleAddCustomCard} className={styles.addCardForm}>
              <h3 className={styles.formTitle}>✨ Thêm thẻ nhiệm vụ của hai bạn</h3>
              <div className={styles.formRow}>
                <select
                  value={newCardType}
                  onChange={e => setNewCardType(e.target.value as any)}
                  className={styles.formSelect}
                >
                  <option value="FOREPLAY">💋 Dạo đầu (Foreplay)</option>
                  <option value="TRUTH">💭 Sự thật (Truth)</option>
                  <option value="DARE">🔥 Thử thách (Dare)</option>
                  <option value="TRAIN">🎯 Bài tập Train (SM)</option>
                </select>

                <select
                  value={newCardLevel}
                  onChange={e => setNewCardLevel(Number(e.target.value))}
                  className={styles.formSelect}
                >
                  <option value={1}>Cấp độ 1: Nhẹ nhàng</option>
                  <option value={2}>Cấp độ 2: Khiêu khích</option>
                  <option value={3}>Cấp độ 3: Hoang dã / Hardcore</option>
                </select>
              </div>

              <textarea
                placeholder="Nhập nội dung thẻ (Ví dụ: Slave quỳ gối xin phép Boss hôn lên trán...)..."
                value={newCardContent}
                onChange={e => setNewCardContent(e.target.value)}
                className={styles.formTextarea}
                rows={3}
                required
              />

              <button type="submit" className={styles.submitBtn}>
                <Plus size={16} /> Lưu thẻ vào game
              </button>
            </form>
          )}

          {/* Filter Pills */}
          <div className={styles.filterBar}>
            <div className={styles.pillGroup}>
              {(['ALL', 'FOREPLAY', 'TRUTH', 'DARE', 'TRAIN'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  className={`${styles.filterPill} ${gameFilter === type ? styles.filterPillActive : ''}`}
                  onClick={() => setGameFilter(type)}
                >
                  {type === 'ALL' && 'Tất cả thẻ'}
                  {type === 'FOREPLAY' && '💋 Dạo đầu'}
                  {type === 'TRUTH' && '💭 Sự thật'}
                  {type === 'DARE' && '🔥 Thử thách'}
                  {type === 'TRAIN' && '🎯 Huấn luyện'}
                </button>
              ))}
            </div>

            <div className={styles.pillGroup}>
              {[0, 1, 2, 3].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  className={`${styles.levelPill} ${levelFilter === lvl ? styles.levelPillActive : ''}`}
                  onClick={() => setLevelFilter(lvl)}
                >
                  {lvl === 0 && 'Mọi cấp độ'}
                  {lvl === 1 && '🟢 Cấp 1'}
                  {lvl === 2 && '🟡 Cấp 2'}
                  {lvl === 3 && '🔴 Cấp 3'}
                </button>
              ))}
            </div>
          </div>

          {/* The Interactive Card Flip Area */}
          <div className={styles.cardStage}>
            <div className={`${styles.flipCard} ${isCardFlipped ? styles.flipped : ''}`}>
              <div className={styles.cardFront} onClick={drawRandomCard}>
                <div className={styles.cardBackDesign}>
                  <Flame size={48} className={styles.cardFlame} />
                  <span className={styles.cardBackText}>Chạm để rút thẻ ngẫu nhiên</span>
                  <span className={styles.cardBackSub}>{allAvailableCards.length} thẻ đang sẵn sàng</span>
                </div>
              </div>

              <div className={styles.cardBack}>
                {currentCard ? (
                  <div className={styles.cardResult}>
                    <div className={styles.cardTypeRow}>
                      <span className={styles.cardTypePill}>
                        {currentCard.type === 'FOREPLAY' && '💋 Dạo đầu'}
                        {currentCard.type === 'TRUTH' && '💭 Sự thật'}
                        {currentCard.type === 'DARE' && '🔥 Thử thách'}
                        {currentCard.type === 'TRAIN' && '🎯 Bài tập SM'}
                      </span>
                      <span className={styles.cardLevelBadge}>
                        {currentCard.level === 1 && '⭐ Cấp 1: Dịu dàng'}
                        {currentCard.level === 2 && '⭐⭐ Cấp 2: Kích thích'}
                        {currentCard.level === 3 && '⭐⭐⭐ Cấp 3: Hoang dã'}
                      </span>
                    </div>

                    <p className={styles.cardTextContent}>{currentCard.content}</p>

                    <div className={styles.cardTargetNotice}>
                      {currentCard.target === 'SLAVE' && '🎀 Dành riêng cho Slave thực hiện'}
                      {currentCard.target === 'BOSS' && '👑 Mệnh lệnh từ Boss'}
                      {currentCard.target === 'BOTH' && '👥 Cả hai cùng phối hợp'}
                    </div>

                    <button type="button" className={styles.drawAgainBtn} onClick={drawRandomCard}>
                      <RotateCcw size={16} /> Rút thẻ tiếp theo
                    </button>
                  </div>
                ) : (
                  <div className={styles.emptyCardState} onClick={drawRandomCard}>
                    <p>Bấm để bắt đầu rút thẻ đầu tiên!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Custom Cards Library */}
          {customCards.length > 0 && (
            <div className={styles.customCardsLibrary}>
              <h3 className={styles.subHead}>Thẻ bài tự tạo của hai bạn ({customCards.length})</h3>
              <div className={styles.customCardsGrid}>
                {customCards.map(c => (
                  <div key={c.id} className={styles.miniCustomCard}>
                    <div className={styles.miniCardTop}>
                      <span className={styles.miniCardBadge}>{c.type} • Cấp {c.level}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomCard(c.id)}
                        className={styles.deleteMiniBtn}
                        title="Xóa thẻ"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p>{c.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================= */}
      {/* TAB 2: RANDOMIZER (COSPLAY, PROPS, TASKS)                */}
      {/* ========================================================= */}
      {activeTab === 'RANDOMIZER' && (
        <section className={styles.sectionCard}>
          <div className={styles.cardHeaderRow}>
            <div>
              <span className={styles.badgeSm}>Session Preparations</span>
              <h2 className={styles.sectionTitle}>Vòng Quay Trang Phục & Đạo Cụ</h2>
              <p className={styles.sectionSubtitle}>
                Tạo bất ngờ cho mỗi buổi train với trang phục cosplay, dụng cụ và nhiệm vụ ngẫu nhiên!
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={styles.actionBtnOutline}
                onClick={() => setShowAddItem(v => !v)}
              >
                <Plus size={16} /> {showAddItem ? 'Đóng' : 'Thêm trang phục / dụng cụ'}
              </button>
              <button
                type="button"
                className={styles.spinButton}
                onClick={spinRandomizer}
                disabled={isSpinning}
              >
                <Sparkles size={18} />
                <span>{isSpinning ? 'Đang quay...' : 'Quay ngẫu nhiên ngay!'}</span>
              </button>
            </div>
          </div>

          {/* Form thêm trang phục hoặc đạo cụ mới */}
          {showAddItem && (
            <form onSubmit={handleAddCustomItem} className={styles.addCardForm}>
              <h3 className={styles.formTitle}>✨ Thêm trang phục cosplay hoặc đồ chơi BDSM mới</h3>
              <div className={styles.formRow}>
                <select
                  value={newItemCategory}
                  onChange={e => {
                    const cat = e.target.value as 'COSPLAY' | 'PROP';
                    setNewItemCategory(cat);
                    setNewItemIcon(cat === 'COSPLAY' ? '👗' : '⛓️');
                  }}
                  className={styles.formSelect}
                >
                  <option value="COSPLAY">👗 Trang phục Cosplay</option>
                  <option value="PROP">⛓️ Dụng cụ / Đồ chơi BDSM</option>
                </select>

                <input
                  placeholder="Emoji (VD: 👙, 🦊, 🎭, 🪢, 🪶)..."
                  value={newItemIcon}
                  onChange={e => setNewItemIcon(e.target.value)}
                  className={styles.formInput}
                  style={{ maxWidth: '160px' }}
                />

                <input
                  placeholder={newItemCategory === 'COSPLAY' ? "Tên trang phục (VD: Cô hầu gái quyến rũ, Thỏ Playboy...)..." : "Tên dụng cụ (VD: Còng lông vũ, Bịt mắt nhung, Dây thừng Shibari...)..."}
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              <textarea
                placeholder="Mô tả chi tiết hoặc gợi ý sử dụng (VD: Mang kèm tất lưới đen, kết hợp với bịt mắt)..."
                value={newItemDesc}
                onChange={e => setNewItemDesc(e.target.value)}
                className={styles.formTextarea}
                rows={2}
              />

              <button type="submit" className={styles.submitBtn}>
                <Plus size={16} /> Lưu vào danh sách quay ngẫu nhiên
              </button>
            </form>
          )}

          <div className={styles.randomizerGrid}>
            <div className={styles.randomBox}>
              <div className={styles.boxHeader}>
                <span className={styles.boxIcon}>👗</span>
                <h3>Trang phục Cosplay</h3>
              </div>
              {selectedCosplay ? (
                <div className={styles.boxBody}>
                  <div className={styles.outfitBigIcon}>{selectedCosplay.icon}</div>
                  <strong className={styles.outfitName}>{selectedCosplay.name}</strong>
                  <p className={styles.outfitDesc}>{selectedCosplay.desc}</p>
                </div>
              ) : (
                <div className={styles.boxPlaceholder}>
                  <p>Bấm nút &quot;Quay ngẫu nhiên&quot; để chọn trang phục cho Slave tối nay!</p>
                </div>
              )}
            </div>

            <div className={styles.randomBox}>
              <div className={styles.boxHeader}>
                <span className={styles.boxIcon}>⛓️</span>
                <h3>Dụng cụ BDSM</h3>
              </div>
              {selectedProp ? (
                <div className={styles.boxBody}>
                  <div className={styles.outfitBigIcon}>{selectedProp.icon}</div>
                  <strong className={styles.outfitName}>{selectedProp.name}</strong>
                  <p className={styles.outfitDesc}>{selectedProp.desc}</p>
                </div>
              ) : (
                <div className={styles.boxPlaceholder}>
                  <p>Khám phá đạo cụ đánh thức giác quan cho buổi train.</p>
                </div>
              )}
            </div>

            <div className={`${styles.randomBox} ${styles.fullWidthBox}`}>
              <div className={styles.boxHeader}>
                <span className={styles.boxIcon}>🎯</span>
                <h3>Nhiệm vụ Train cho buổi tối</h3>
              </div>
              {selectedTask ? (
                <div className={styles.boxBody}>
                  <p className={styles.taskContentBig}>&ldquo;{selectedTask.content}&rdquo;</p>
                  <span className={styles.taskLevelTag}>Cấp độ: {selectedTask.level} ⭐</span>
                </div>
              ) : (
                <div className={styles.boxPlaceholder}>
                  <p>Một bài tập bất ngờ sẽ xuất hiện khi bạn bấm quay!</p>
                </div>
              )}
            </div>
          </div>

          {/* Danh sách các trang phục và đồ chơi do hai bạn tự thêm */}
          {customItems.length > 0 && (
            <div className={styles.customCardsLibrary}>
              <h3 className={styles.subHead}>
                ✨ Danh mục trang phục & đồ chơi do hai bạn tự thêm ({customItems.length})
              </h3>
              <div className={styles.customCardsGrid}>
                {customItems.map(item => (
                  <div key={item.id} className={styles.miniCustomCard}>
                    <div className={styles.miniCardTop}>
                      <span className={styles.miniCardBadge}>
                        {item.icon} {item.category === 'COSPLAY' ? 'Trang phục' : 'Dụng cụ'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomItem(item.id)}
                        className={styles.deleteMiniBtn}
                        title="Xóa món đồ này"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <strong style={{ display: 'block', color: '#fff', marginBottom: '0.25rem' }}>{item.name}</strong>
                    {item.desc && <p style={{ fontSize: '0.8rem', color: '#a0a0b0', margin: 0 }}>{item.desc}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================= */}
      {/* TAB 3: NHẬT KÝ TRAIN                                     */}
      {/* ========================================================= */}
      {activeTab === 'JOURNAL' && (
        <section className={styles.sectionCard}>
          <div className={styles.cardHeaderRow}>
            <div>
              <span className={styles.badgeSm}>Private Logbook</span>
              <h2 className={styles.sectionTitle}>Nhật Ký Buổi Train</h2>
              <p className={styles.sectionSubtitle}>
                Nơi ghi lại cảm xúc, đánh giá sao, những điều thăng hoa và ghi chú aftercare sau mỗi lần bên nhau.
              </p>
            </div>
            <button
              type="button"
              className={styles.actionBtnOutline}
              onClick={() => setShowAddJournal(v => !v)}
            >
              <Plus size={16} /> {showAddJournal ? 'Đóng' : 'Viết nhật ký mới'}
            </button>
          </div>

          {showAddJournal && (
            <form onSubmit={handleAddJournal} className={styles.addJournalForm}>
              <h3 className={styles.formTitle}>📝 Ghi chú buổi train</h3>
              <div className={styles.formRow}>
                <input
                  placeholder="Tiêu đề buổi train (VD: Đêm thăng hoa với trang phục mèo con)..."
                  value={journalTitle}
                  onChange={e => setJournalTitle(e.target.value)}
                  className={styles.formInput}
                  required
                />
                <select
                  value={journalAuthor}
                  onChange={e => setJournalAuthor(e.target.value as any)}
                  className={styles.formSelect}
                >
                  <option value="Boss">👑 Người viết: Boss</option>
                  <option value="Slave">🎀 Người viết: Slave</option>
                </select>
                <select
                  value={journalRating}
                  onChange={e => setJournalRating(Number(e.target.value))}
                  className={styles.formSelect}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ 5/5 Thăng hoa tuyệt đối</option>
                  <option value={4}>⭐⭐⭐⭐ 4/5 Rất kích thích</option>
                  <option value={3}>⭐⭐⭐ 3/5 Tốt, cần chỉnh thêm</option>
                </select>
              </div>

              <textarea
                placeholder="Ghi lại cảm xúc, những khoảnh khắc đáng nhớ, phản ứng của Slave/Boss và phần chăm sóc aftercare..."
                value={journalContent}
                onChange={e => setJournalContent(e.target.value)}
                className={styles.formTextarea}
                rows={4}
                required
              />

              <button type="submit" className={styles.submitBtn}>
                <Plus size={16} /> Lưu nhật ký bí mật
              </button>
            </form>
          )}

          <div className={styles.journalList}>
            {journals.length === 0 ? (
              <div className={styles.emptyJournal}>
                <BookOpen size={40} className={styles.emptyIcon} />
                <p>Chưa có nhật ký nào. Hãy ghi lại cảm xúc sau buổi train đầu tiên của hai bạn!</p>
              </div>
            ) : (
              journals.map(j => (
                <div key={j.id} className={styles.journalCard}>
                  <div className={styles.journalHeader}>
                    <div>
                      <div className={styles.journalMeta}>
                        <span className={styles.authorBadge}>{j.author === 'Boss' ? '👑 Boss' : '🎀 Slave'}</span>
                        <span className={styles.journalDate}>{j.date}</span>
                        <span className={styles.stars}>{'⭐'.repeat(j.rating)}</span>
                      </div>
                      <h3 className={styles.journalTitle}>{j.title}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteJournal(j.id)}
                      className={styles.deleteMiniBtn}
                      title="Xóa nhật ký"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className={styles.journalBody}>{j.content}</p>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* TAB 4: HỢP ĐỒNG NÔ LỆ & QUY ƯỚC BDSM                       */}
      {/* ========================================================= */}
      {activeTab === 'CONTRACT' && (
        <section className={styles.sectionCard}>
          <div className={styles.cardHeaderRow}>
            <div>
              <span className={styles.badgeSm}>Consensual Roleplay Agreement</span>
              <h2 className={styles.sectionTitle}>Hợp Đồng Nô Lệ & Quy Ước BDSM</h2>
              <p className={styles.sectionSubtitle}>
                Bản giao kèo tình yêu và nguyên tắc an toàn tuyệt đối (Safe, Sane, Consensual) có chữ ký online vẽ tay của hai bạn.
              </p>
            </div>
            <div className={styles.contractActionsRow}>
              <button
                type="button"
                className={styles.actionBtnOutline}
                onClick={() => {
                  if (!isEditingContract) {
                    setEditRules(currentRules);
                    setEditLimits(currentLimits);
                    setEditSafewords(contract?.safewords || DEFAULT_SAFEWORDS);
                    setEditAftercare(contract?.aftercare || DEFAULT_AFTERCARE);
                  }
                  setIsEditingContract(v => !v);
                }}
              >
                <Edit3 size={16} /> {isEditingContract ? 'Xem bản hợp đồng' : 'Chỉnh sửa điều khoản I, II, III, IV'}
              </button>

              {contract?.bossSigned && contract?.slaveSigned && (
                <span className={styles.signedStamp}>
                  ✓ ĐÃ KÝ KẾT CHÍNH THỨC
                </span>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* NẾU ĐANG Ở CHẾ ĐỘ CHỈNH SỬA ĐIỀU KHOẢN                     */}
          {/* ========================================================= */}
          {isEditingContract ? (
            <div className={styles.editContractBox}>
              <h3 className={styles.editSectionTitle}>✏️ Tùy Chỉnh Nội Dung Các Điều Khoản</h3>

              {/* Mục I: Rules */}
              <div className={styles.editClauseGroup}>
                <h4>I. Các quy tắc bắt buộc (Rules)</h4>
                <ul className={styles.clauseEditList}>
                  {editRules.map((r, i) => (
                    <li key={i} className={styles.clauseItemRow}>
                      <span>{i + 1}. {r}</span>
                      <button type="button" onClick={() => removeRule(i)} className={styles.deleteMiniBtn}>
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className={styles.addClauseRow}>
                  <input
                    placeholder="Nhập quy tắc mới (VD: Slave luôn nhìn thẳng vào mắt Boss khi thưa chuyện)... Nhấn Enter hoặc bấm Thêm"
                    value={newRuleInput}
                    onChange={e => setNewRuleInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addRule();
                      }
                    }}
                    className={styles.formInput}
                  />
                  <button type="button" onClick={addRule} className={styles.addClauseBtn}>
                    <Plus size={15} /> Thêm quy tắc
                  </button>
                </div>
              </div>

              {/* Mục II: Hard limits */}
              <div className={styles.editClauseGroup}>
                <h4>II. Giới hạn tuyệt đối (Hard Limits - Ranh giới cấm kỵ)</h4>
                <ul className={styles.clauseEditList}>
                  {editLimits.map((l, i) => (
                    <li key={i} className={styles.clauseItemRow}>
                      <span>• {l}</span>
                      <button type="button" onClick={() => removeLimit(i)} className={styles.deleteMiniBtn}>
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className={styles.addClauseRow}>
                  <input
                    placeholder="Nhập giới hạn tuyệt đối mới (VD: Dừng ngay khi mệt)... Nhấn Enter hoặc bấm Thêm"
                    value={newLimitInput}
                    onChange={e => setNewLimitInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addLimit();
                      }
                    }}
                    className={styles.formInput}
                  />
                  <button type="button" onClick={addLimit} className={styles.addClauseBtn}>
                    <Plus size={15} /> Thêm giới hạn
                  </button>
                </div>
              </div>

              {/* Mục III: Safewords */}
              <div className={styles.editClauseGroup}>
                <h4>III. Từ an toàn (Safewords)</h4>
                <input
                  placeholder="Ví dụ: 🔴 ĐỎ: Dừng lại ngay | 🟡 VÀNG: Chậm lại | 🟢 XANH: Cảm giác rất tốt"
                  value={editSafewords}
                  onChange={e => setEditSafewords(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              {/* Mục IV: Aftercare */}
              <div className={styles.editClauseGroup}>
                <h4>IV. Quy trình chăm sóc sau buổi train (Aftercare)</h4>
                <textarea
                  placeholder="Quy trình vỗ về, ôm ấp, uống nước ấm và trò chuyện ngọt ngào sau khi yêu..."
                  value={editAftercare}
                  onChange={e => setEditAftercare(e.target.value)}
                  className={styles.formTextarea}
                  rows={3}
                />
              </div>

              <div className={styles.editActionRow}>
                <button type="button" onClick={saveContractClauses} className={styles.saveContractBtn}>
                  <Check size={18} /> Lưu tất cả thay đổi hợp đồng
                </button>
                <button type="button" onClick={() => setIsEditingContract(false)} className={styles.cancelContractBtn}>
                  Đóng chỉnh sửa
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* NẾU ĐANG Ở CHẾ ĐỘ XEM & KÝ BẢN GIAO KÈO CHÍNH THỨC       */
            /* ========================================================= */
            <div className={styles.parchmentContract}>
              <div className={styles.waxSeal}>
                <Heart size={28} fill="currentColor" />
              </div>

              <div className={styles.contractHeader}>
                <h1 className={styles.contractMainTitle}>BẢN GIAO KÈO BÍ MẬT</h1>
                <p className={styles.contractSubTitle}>
                  Giữa <strong>Boss ({contract?.bossName || 'chồng yêu của Vân'})</strong> và <strong>Slave ({contract?.slaveName || 'vợ yêu của Phúc'})</strong>
                </p>
              </div>

              {/* Điều 1: Quy tắc phục tùng */}
              <div className={styles.contractSection}>
                <h3>I. CÁC QUY TẮC BẮT BUỘC (RULES)</h3>
                <ol className={styles.rulesList}>
                  {currentRules.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ol>
              </div>

              {/* Điều 2: Giới hạn an toàn */}
              <div className={styles.contractSection}>
                <h3>II. GIỚI HẠN TUYỆT ĐỐI (HARD LIMITS)</h3>
                <ul className={styles.limitsList}>
                  {currentLimits.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>

              {/* Điều 3: Từ an toàn (Safewords) */}
              <div className={styles.contractSection}>
                <h3>III. TỪ AN TOÀN (SAFEWORDS)</h3>
                <div className={styles.safewordsPill}>
                  {contract?.safewords || '🔴 ĐỎ: Dừng lại ngay | 🟡 VÀNG: Chậm lại | 🟢 XANH: Cảm giác rất tốt'}
                </div>
              </div>

              {/* Điều 4: Chăm sóc sau buổi train */}
              <div className={styles.contractSection}>
                <h3>IV. QUY TRÌNH AFTERCARE</h3>
                <p className={styles.aftercareNote}>
                  {contract?.aftercare || 'Ôm ấp vỗ về, uống nước ấm, khen ngợi và cùng nhau trò chuyện ngọt ngào sau khi kết thúc buổi train.'}
                </p>
              </div>

              {/* Phần chữ ký Online của Boss & Slave */}
              <div className={styles.signaturesContainer}>
                {/* Cột chữ ký của Boss */}
                <div className={styles.signBox}>
                  <h4>ĐẠI DIỆN: BOSS (CHỦ NHÂN)</h4>
                  {contract?.bossSigned && contract.bossSignature ? (
                    <div className={styles.signedDisplay}>
                      <div className={styles.signatureCanvasWrapper}>
                        <img
                          src={contract.bossSignature}
                          alt="Chữ ký Boss"
                          className={styles.signatureCanvasImg}
                        />
                      </div>
                      <span className={styles.signDate}>✓ Đã ký tên online & đóng dấu</span>
                      <button
                        type="button"
                        onClick={() => handleClearSignature('BOSS')}
                        className={styles.reSignBtn}
                      >
                        Ký lại ✍️
                      </button>
                    </div>
                  ) : (
                    <div className={styles.signAction}>
                      <button
                        type="button"
                        onClick={() => setSigningModalRole('BOSS')}
                        className={styles.drawSignBtn}
                      >
                        ✍️ Vẽ chữ ký Online (Boss)
                      </button>
                      <p className={styles.signHintText}>Bấm để ký trực tiếp bằng tay/chuột</p>
                    </div>
                  )}
                </div>

                {/* Cột chữ ký của Slave */}
                <div className={styles.signBox}>
                  <h4>ĐẠI DIỆN: SLAVE (NÔ LỆ)</h4>
                  {contract?.slaveSigned && contract.slaveSignature ? (
                    <div className={styles.signedDisplay}>
                      <div className={styles.signatureCanvasWrapper}>
                        <img
                          src={contract.slaveSignature}
                          alt="Chữ ký Slave"
                          className={styles.signatureCanvasImg}
                        />
                      </div>
                      <span className={styles.signDate}>✓ Đã ký xác nhận phục tùng</span>
                      <button
                        type="button"
                        onClick={() => handleClearSignature('SLAVE')}
                        className={styles.reSignBtn}
                      >
                        Ký lại ✍️
                      </button>
                    </div>
                  ) : (
                    <div className={styles.signAction}>
                      <button
                        type="button"
                        onClick={() => setSigningModalRole('SLAVE')}
                        className={styles.drawSignBtn}
                      >
                        ✍️ Vẽ chữ ký Online (Slave)
                      </button>
                      <p className={styles.signHintText}>Bấm để ký trực tiếp bằng tay/chuột</p>
                    </div>
                  )}
                </div>
              </div>

              {signSuccess && (
                <p className={styles.signSuccessNotice}>
                  ✨ Chúc mừng hai bạn đã ký kết thành công bản giao kèo thiêng liêng này!
                </p>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
