'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './random.module.css';
import confetti from 'canvas-confetti';
import { Trash2, Gift, Utensils } from 'lucide-react';

interface Item {
  id: number;
  name: string;
  type: string;
}

export default function RandomPage() {
  const [activeTab, setActiveTab] = useState<'GIFT' | 'FOOD'>('GIFT');
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchItems(activeTab);
  }, [activeTab]);

  const fetchItems = async (type: string) => {
    const res = await fetch(`/api/items?type=${type}`);
    const data = await res.json();
    setItems(data);
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newItemName, type: activeTab }),
    });
    
    if (res.ok) {
      setNewItemName('');
      fetchItems(activeTab);
    }
  };

  const deleteItem = async (id: number) => {
    const res = await fetch(`/api/items?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchItems(activeTab);
  };

  const spin = () => {
    if (items.length === 0 || isSpinning) return;
    setIsSpinning(true);
    setResult(null);
    
    // Simulate spin effect
    let spins = 0;
    const maxSpins = 20 + Math.floor(Math.random() * 10);
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * items.length);
      setResult(items[randomIndex].name);
      spins++;
      
      if (spins >= maxSpins) {
        clearInterval(interval);
        setIsSpinning(false);
        fireConfetti();
      }
    }, 100);
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffb6c1', '#ff69b4', '#ff1493', '#fff0f5']
    });
  };

  return (
    <div className={styles.container}>
      <h1 className="title">Vòng Quay May Mắn</h1>
      
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'GIFT' ? styles.active : ''}`}
          onClick={() => setActiveTab('GIFT')}
        >
          <Gift size={20} /> Quà Tặng
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'FOOD' ? styles.active : ''}`}
          onClick={() => setActiveTab('FOOD')}
        >
          <Utensils size={20} /> Ăn Uống
        </button>
      </div>

      <div className={`${styles.mainCard} glass`}>
        <div className={styles.spinSection}>
          <div className={`${styles.resultBox} ${isSpinning ? styles.spinning : ''}`}>
            {result || '???'}
          </div>
          <button 
            className="btn btn-accent" 
            onClick={spin} 
            disabled={isSpinning || items.length === 0}
            style={{ fontSize: '1.2rem', padding: '15px 40px' }}
          >
            {isSpinning ? 'Đang quay...' : 'QUAY!'}
          </button>
        </div>

        <div className={styles.listSection}>
          <h3>Danh sách {activeTab === 'GIFT' ? 'Quà' : 'Món ăn'} ({items.length})</h3>
          
          <form onSubmit={addItem} className={styles.addForm}>
            <input 
              type="text" 
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Thêm lựa chọn mới..."
            />
            <button type="submit" className="btn">Thêm</button>
          </form>

          <ul className={styles.itemList}>
            {items.map(item => (
              <li key={item.id} className={styles.item}>
                <span>{item.name}</span>
                <button 
                  onClick={() => deleteItem(item.id)}
                  className={styles.deleteBtn}
                  title="Xóa"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
