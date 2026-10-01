'use client';
import { useState, useEffect } from 'react';
import styles from './goals.module.css';
import { Pin, Trash2, Check, X } from 'lucide-react';

interface Goal {
  id: number;
  title: string;
  isCompleted: boolean;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const res = await fetch('/api/goals');
    const data = await res.json();
    setGoals(data);
  };

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;

    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newGoal }),
    });

    if (res.ok) {
      setNewGoal('');
      fetchGoals();
    }
  };

  const toggleGoal = async (id: number, currentStatus: boolean) => {
    const res = await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isCompleted: !currentStatus }),
    });

    if (res.ok) fetchGoals();
  };

  const deleteGoal = async (id: number) => {
    const res = await fetch(`/api/goals?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchGoals();
  };

  return (
    <div className={styles.container}>
      <h1 className="title">Bảng Mục Tiêu Của Chúng Mình</h1>
      
      <form onSubmit={addGoal} className={styles.addForm}>
        <input 
          type="text" 
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Thêm mục tiêu mới (vd: Đi du lịch Sapa)..."
        />
        <button type="submit" className="btn btn-accent">Ghim!</button>
      </form>

      <div className={styles.board}>
        {goals.map((goal) => (
          <div key={goal.id} className={`${styles.note} ${goal.isCompleted ? styles.completed : ''}`}>
            <div className={styles.pin}><Pin size={24} color="#ff6b6b" fill="#ff6b6b" /></div>
            <p className={styles.noteText}>{goal.title}</p>
            <div className={styles.actions}>
              <button 
                onClick={() => toggleGoal(goal.id, goal.isCompleted)}
                className={`${styles.actionBtn} ${styles.checkBtn}`}
                title={goal.isCompleted ? "Đánh dấu chưa xong" : "Đánh dấu hoàn thành"}
              >
                {goal.isCompleted ? <X size={20} /> : <Check size={20} />}
              </button>
              <button 
                onClick={() => deleteGoal(goal.id)}
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                title="Xóa"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
