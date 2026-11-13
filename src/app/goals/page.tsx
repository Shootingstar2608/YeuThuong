'use client';
import { useState, useEffect } from 'react';
import styles from './goals.module.css';
import { CheckCircle2, Circle, Trash2, Plus, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Goal { id: number; title: string; isCompleted: boolean; }

export default function GoalsPage() {
  const [goals, setGoals]     = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');

  const fetchGoals = async () => {
    const res  = await fetch('/api/goals');
    if (res.ok) {
      const data = await res.json();
      setGoals(data);
    }
  };

  useEffect(() => {
    fetch('/api/goals').then(async (r) => {
      if (r.ok) setGoals(await r.json());
    });
  }, []);

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    const res = await fetch('/api/goals', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newGoal }),
    });
    if (res.ok) { setNewGoal(''); fetchGoals(); }
  };

  const toggleGoal = async (id: number, current: boolean) => {
    const res = await fetch('/api/goals', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isCompleted: !current }),
    });
    if (res.ok) {
      if (!current) {
        void confetti({ particleCount: 80, spread: 60, origin: { y: 0.65 }, colors: ['#ff4d78', '#ffd166', '#2dbd7e'] });
      }
      fetchGoals();
    }
  };

  const deleteGoal = async (id: number) => {
    const res = await fetch(`/api/goals?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchGoals();
  };

  const pending   = goals.filter(g => !g.isCompleted);
  const completed = goals.filter(g =>  g.isCompleted);
  const progress  = goals.length ? Math.round((completed.length / goals.length) * 100) : 0;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className="eyebrow"><Star size={13} /> Shared Dreams</p>
          <h1 className={styles.title}>Mục Tiêu Của Chúng Mình</h1>
          <p className={styles.sub}>Những điều hai bạn muốn cùng nhau thực hiện</p>
        </div>
      </div>

      {/* Progress bar */}
      {goals.length > 0 && (
        <div className={styles.progressWrap}>
          <div className={styles.progressInfo}>
            <span>{completed.length}/{goals.length} hoàn thành</span>
            <span className={styles.progressPct}>{progress}%</span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Add form */}
      <form onSubmit={addGoal} className={styles.addForm}>
        <input
          type="text"
          value={newGoal}
          onChange={e => setNewGoal(e.target.value)}
          placeholder="Thêm mục tiêu mới, ví dụ: Đi du lịch Đà Lạt cùng nhau..."
        />
        <button type="submit" className="btn"><Plus size={17} /> Thêm</button>
      </form>

      {/* Empty */}
      {goals.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🌟</div>
          <h2>Chưa có mục tiêu nào</h2>
          <p>Hãy cùng nhau lập danh sách những điều muốn làm!</p>
        </div>
      )}

      {/* Pending goals */}
      {pending.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><Circle size={16} /> Đang thực hiện ({pending.length})</h2>
          <div className={styles.goalList}>
            {pending.map((goal, i) => (
              <div key={goal.id} className={styles.goalCard} style={{ animationDelay: `${i * 0.05}s` }}>
                <button type="button" className={styles.checkBtn} onClick={() => toggleGoal(goal.id, goal.isCompleted)} title="Đánh dấu hoàn thành">
                  <Circle size={22} />
                </button>
                <p className={styles.goalText}>{goal.title}</p>
                <button type="button" className={styles.deleteBtn} onClick={() => deleteGoal(goal.id)} title="Xoá">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completed goals */}
      {completed.length > 0 && (
        <section className={styles.section}>
          <h2 className={`${styles.sectionTitle} ${styles.doneTitle}`}><CheckCircle2 size={16} /> Đã hoàn thành ({completed.length})</h2>
          <div className={styles.goalList}>
            {completed.map((goal, i) => (
              <div key={goal.id} className={`${styles.goalCard} ${styles.goalDone}`} style={{ animationDelay: `${i * 0.05}s` }}>
                <button type="button" className={`${styles.checkBtn} ${styles.checkDone}`} onClick={() => toggleGoal(goal.id, goal.isCompleted)} title="Bỏ hoàn thành">
                  <CheckCircle2 size={22} fill="currentColor" />
                </button>
                <p className={styles.goalText}>{goal.title}</p>
                <button type="button" className={styles.deleteBtn} onClick={() => deleteGoal(goal.id)} title="Xoá">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
