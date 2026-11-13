'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import styles from './minigame.module.css';
import confetti from 'canvas-confetti';
import { Gamepad2, Heart, Star, Sparkles, RotateCcw, Trophy, CheckCircle2, HelpCircle } from 'lucide-react';

type Mode = 'memory' | 'tic-tac-toe' | 'quiz';

interface SharedGame {
  board: string;
  currentTurnUserId: number | null;
  winnerUserId: number | null;
  status: 'PLAYING' | 'WON' | 'DRAW';
}

interface MemoryGame {
  cards: string[];
  openIndices: number[];
  matchedIndices: number[];
  moves: number;
}

const quizQuestions = [
  {
    question: 'Một buổi hẹn hò lý tưởng của chúng mình là...',
    options: ['Cùng đi ăn thật ngon rồi dạo phố 🍲🛵', 'Ở nhà trùm chăn xem phim & ăn snack 🛋️🎬', 'Đi du lịch xa cùng nhau khám phá ✈️🏖️', 'Ngồi cafe yên tĩnh tâm sự hàng giờ ☕💬'],
    answer: 0,
    sweetNote: 'Bất kể ở đâu, chỉ cần bên nhau là buổi hẹn nào cũng trọn vẹn nhất! ♥',
  },
  {
    question: 'Ai thường là người nói câu “mình ăn gì cũng được”?',
    options: ['Em / Anh (mình)', 'Người yêu của mình', 'Cả hai đứa lúc đói', 'Không ai cả, luôn quyết định nhanh'],
    answer: 2,
    sweetNote: 'Miễn là được cùng ăn với người mình yêu thì ăn gì cũng thấy ngon hết trơn! 😋',
  },
  {
    question: 'Điều nhỏ bé nhất từ người ấy khiến bạn thấy ấm lòng?',
    options: ['Một tin nhắn bất ngờ lúc giữa ngày 💬', 'Một cái ôm thật chặt không nói lời nào 🤗', 'Nhớ món mình thích và tự mua cho 🥤', 'Lắng nghe kiên nhẫn khi mình kể chuyện 👂'],
    answer: 1,
    sweetNote: 'Hạnh phúc đích thực luôn được xây từ những sự quan tâm nhỏ nhặt mỗi ngày. 💕',
  },
  {
    question: 'Nếu người kia giận dỗi, chiêu nào hiệu quả nhất?',
    options: ['Mua trà sữa / đồ ăn ngon dỗ dành 🧋', 'Ôm chặt vào lòng không buông 🤗', 'Nhận lỗi chân thành và làm trò hề 😜', 'Để người ấy một khoảng lặng rồi nói chuyện nhẹ nhàng 🌿'],
    answer: 0,
    sweetNote: 'Đường vào tim người yêu ngắn nhất vẫn là qua... đường ăn uống! 🍓',
  },
  {
    question: 'Khi cùng nhau xem phim rạp, ai thường ăn hết bắp rang trước?',
    options: ['Mình', 'Người yêu', 'Cả hai chia đều', 'Mải xem phim quên cả ăn'],
    answer: 1,
    sweetNote: 'Bắp rang bơ ngọt, nhưng tình yêu của hai bạn còn ngọt hơn! 🍿',
  },
  {
    question: 'Thói quen đáng yêu nhất của đối phương là gì?',
    options: ['Cười tít mắt khi được khen 🌸', 'Làm nũng mỗi khi buồn ngủ 😴', 'Cầm tay nhét vào túi áo khi trời lạnh 🧤', 'Tất cả những điều trên đều đáng yêu ♥'],
    answer: 3,
    sweetNote: 'Trong mắt người đang yêu, mọi cử chỉ của đối phương đều dễ thương vô cùng! 💖',
  },
];

export default function MinigamePage() {
  const [mode, setMode] = useState<Mode>('memory');
  const [userId, setUserId] = useState<number | null>(null);
  const [game, setGame] = useState<SharedGame | null>(null);
  const [memory, setMemory] = useState<MemoryGame | null>(null);
  const [error, setError] = useState('');

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const prevMemoryWon = useRef(false);
  const prevTicWon = useRef(false);

  useEffect(() => {
    fetch('/api/auth/me').then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        setUserId(data.user.id);
      }
    });
  }, []);

  const loadGameData = useCallback(() => {
    const endpoint = mode === 'memory' ? '/api/memory-game' : '/api/game';
    fetch(endpoint).then(async (response) => {
      if (!response.ok) return;
      const data = await response.json();
      if (mode === 'memory') {
        setMemory(data);
        if (data.matchedIndices?.length === 16 && !prevMemoryWon.current) {
          prevMemoryWon.current = true;
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }
      } else {
        setGame(data);
        if (data.status === 'WON' && !prevTicWon.current) {
          prevTicWon.current = true;
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }
      }
    });
  }, [mode]);

  useEffect(() => {
    loadGameData();
    const timer = window.setInterval(loadGameData, 3000);
    return () => window.clearInterval(timer);
  }, [loadGameData]);

  async function memoryMove(index: number) {
    setError('');
    const response = await fetch('/api/memory-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? 'Thẻ này không thể lật');
    } else {
      setMemory(data);
      if (data.matchedIndices?.length === 16) {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      }
    }
  }

  async function memoryReset() {
    setError('');
    prevMemoryWon.current = false;
    const response = await fetch('/api/memory-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    });
    if (response.ok) {
      setMemory(await response.json());
    }
  }

  async function ticMove(index: number) {
    setError('');
    const response = await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? 'Nước đi không hợp lệ');
    } else {
      setGame(data);
      if (data.status === 'WON') {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    }
  }

  async function ticReset() {
    setError('');
    prevTicWon.current = false;
    const response = await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    });
    if (response.ok) {
      setGame(await response.json());
    }
  }

  function answerQuiz(index: number) {
    if (quizSelected !== null) return;
    setQuizSelected(index);
    if (index === quizQuestions[quizIndex].answer) {
      setQuizScore((s) => s + 1);
    }
  }

  function nextQuiz() {
    if (quizIndex + 1 < quizQuestions.length) {
      setQuizIndex((i) => i + 1);
      setQuizSelected(null);
    } else {
      setQuizCompleted(true);
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    }
  }

  function restartQuiz() {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizSelected(null);
    setQuizCompleted(false);
  }

  const isMemoryWon = memory?.matchedIndices.length === 16;
  const isTicWon = game?.status === 'WON';
  const isTicDraw = game?.status === 'DRAW';
  const isMyTurn = game?.currentTurnUserId === userId;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.badge}><Gamepad2 size={14} /> Shared Arcade</span>
        <h1 className={styles.title}>Góc Game Đôi</h1>
        <p className={styles.subtitle}>Cùng chơi và tương tác thời gian thực với người yêu trên cả hai máy! ♥</p>
      </header>

      {/* Tabs */}
      <nav className={styles.tabs} aria-label="Các trò chơi">
        <button
          type="button"
          className={`${styles.tabBtn} ${mode === 'memory' ? styles.tabActive : ''}`}
          onClick={() => { setMode('memory'); setError(''); }}
        >
          <Sparkles size={17} />
          <span>Lật Bài Đôi</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${mode === 'tic-tac-toe' ? styles.tabActive : ''}`}
          onClick={() => { setMode('tic-tac-toe'); setError(''); }}
        >
          <Heart size={17} />
          <span>Cờ Tình Yêu</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${mode === 'quiz' ? styles.tabActive : ''}`}
          onClick={() => { setMode('quiz'); setError(''); }}
        >
          <HelpCircle size={17} />
          <span>Couple Quiz</span>
        </button>
      </nav>

      {/* ── Mode 1: Memory Game ── */}
      {mode === 'memory' && (
        <section className={styles.gameCard}>
          <div className={styles.gameHeader}>
            <div className={styles.gameInfo}>
              <h2 className={styles.gameTitle}>
                {isMemoryWon ? '🎉 Hai bạn đã thắng rồi!' : 'Ghép Cặp Kỷ Niệm'}
              </h2>
              <p className={styles.gameSub}>
                Cả hai bạn cùng lật trên một bàn thời gian thực · Số bước: <strong>{memory?.moves ?? 0}</strong>
              </p>
            </div>
            <button type="button" className={`btn ${styles.resetBtn}`} onClick={memoryReset}>
              <RotateCcw size={15} /> Ván mới
            </button>
          </div>

          {isMemoryWon && (
            <div className={styles.winBanner}>
              <span className={styles.winIcon}>🏆</span>
              <div>
                <strong>Tuyệt vời quá!</strong>
                <p>Hai bạn đã hoàn thành ghép đôi 8 cặp biểu tượng với {memory?.moves ?? 0} bước!</p>
              </div>
            </div>
          )}

          <div className={styles.memoryGrid}>
            {(memory?.cards ?? Array(16).fill('')).map((card, idx) => {
              const isOpen = memory?.openIndices.includes(idx);
              const isMatched = memory?.matchedIndices.includes(idx);
              const visible = isOpen || isMatched;
              const disabled = !memory || visible || (memory.openIndices.length >= 2);

              return (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.memoryCard} ${visible ? styles.cardFlipped : ''} ${isMatched ? styles.cardMatched : ''}`}
                  onClick={() => memoryMove(idx)}
                  disabled={disabled}
                  aria-label={`Thẻ số ${idx + 1}`}
                >
                  <div className={styles.cardInner}>
                    <div className={styles.cardBack}>
                      <span className={styles.cardPattern}>♥</span>
                    </div>
                    <div className={styles.cardFront}>
                      {card}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}
        </section>
      )}

      {/* ── Mode 2: Tic-tac-toe ── */}
      {mode === 'tic-tac-toe' && (
        <section className={styles.gameCard}>
          <div className={styles.gameHeader}>
            <div className={styles.gameInfo}>
              <h2 className={styles.gameTitle}>
                {isTicWon ? (
                  game?.winnerUserId === userId ? '💖 Bạn đã chiến thắng!' : '🥰 Người yêu đã thắng rồi!'
                ) : isTicDraw ? (
                  '🤝 Trận này hòa nhau rồi!'
                ) : (
                  isMyTurn ? '👉 Đến lượt bạn đi!' : '⏳ Đang đợi đối phương đi...'
                )}
              </h2>
              <p className={styles.gameSub}>
                Người tạo space: <span className={styles.markHeart}>❤️ Trái tim</span> · Người tham gia: <span className={styles.markStar}>⭐ Ngôi sao</span>
              </p>
            </div>
            <button type="button" className={`btn ${styles.resetBtn}`} onClick={ticReset}>
              <RotateCcw size={15} /> Ván mới
            </button>
          </div>

          <div className={styles.turnIndicator}>
            <span className={`${styles.turnBadge} ${isMyTurn && !isTicWon && !isTicDraw ? styles.turnActive : ''}`}>
              {isTicWon ? 'Trận đấu kết thúc' : isTicDraw ? 'Hòa nhau' : isMyTurn ? 'Lượt của bạn' : 'Lượt của đối phương'}
            </span>
          </div>

          <div className={styles.ticGrid}>
            {(game?.board ?? '.........').split('').map((cell, idx) => {
              const isCellFilled = cell !== '.';
              const disabled = !game || game.status !== 'PLAYING' || !isMyTurn || isCellFilled;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.ticCell} ${cell === 'X' ? styles.cellX : cell === 'O' ? styles.cellO : ''}`}
                  onClick={() => ticMove(idx)}
                  disabled={disabled}
                  aria-label={`Ô số ${idx + 1}`}
                >
                  {cell === 'X' ? (
                    <span className={styles.iconHeart}><Heart size={36} fill="currentColor" /></span>
                  ) : cell === 'O' ? (
                    <span className={styles.iconStar}><Star size={36} fill="currentColor" /></span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}
        </section>
      )}

      {/* ── Mode 3: Couple Quiz ── */}
      {mode === 'quiz' && (
        <section className={styles.gameCard}>
          {!quizCompleted ? (
            <div className={styles.quizWrapper}>
              <div className={styles.quizHeader}>
                <div>
                  <span className={styles.quizCounter}>
                    Câu {quizIndex + 1} / {quizQuestions.length}
                  </span>
                  <h2 className={styles.quizQuestion}>
                    {quizQuestions[quizIndex].question}
                  </h2>
                </div>
                <div className={styles.quizScoreBadge}>
                  <Trophy size={16} />
                  <span>Điểm: {quizScore}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Options */}
              <div className={styles.quizOptions}>
                {quizQuestions[quizIndex].options.map((option, idx) => {
                  const isSelected = quizSelected === idx;
                  const isAnswer = idx === quizQuestions[quizIndex].answer;
                  let optionClass = styles.quizOptionBtn;

                  if (quizSelected !== null) {
                    if (isAnswer) {
                      optionClass += ` ${styles.optionCorrect}`;
                    } else if (isSelected) {
                      optionClass += ` ${styles.optionWrong}`;
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={optionClass}
                      onClick={() => answerQuiz(idx)}
                      disabled={quizSelected !== null}
                    >
                      <span className={styles.optionLetter}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className={styles.optionText}>{option}</span>
                      {quizSelected !== null && isAnswer && (
                        <CheckCircle2 size={18} className={styles.optionCheck} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sweet Note Feedback */}
              {quizSelected !== null && (
                <div className={styles.quizSweetBox}>
                  <span className={styles.sweetEmoji}>💌</span>
                  <p>{quizQuestions[quizIndex].sweetNote}</p>
                </div>
              )}

              {/* Next Button */}
              {quizSelected !== null && (
                <div className={styles.quizAction}>
                  <button type="button" className="btn btn-accent" onClick={nextQuiz}>
                    {quizIndex + 1 === quizQuestions.length ? 'Xem kết quả ✨' : 'Câu tiếp theo →'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.quizFinish}>
              <span className={styles.finishHeart}>🥰</span>
              <h2 className={styles.finishTitle}>Hoàn thành Quiz Tình Yêu!</h2>
              <p className={styles.finishScore}>
                Bạn đạt <strong>{quizScore} / {quizQuestions.length}</strong> điểm thấu hiểu!
              </p>
              <p className={styles.finishDesc}>
                {quizScore >= 4
                  ? 'Hai bạn sinh ra là để dành cho nhau! Độ thấu hiểu và hòa hợp thật đáng ngưỡng mộ! ♥'
                  : 'Mỗi câu trả lời là một cơ hội để hai bạn hiểu và trân trọng nhau nhiều hơn nữa! 💕'}
              </p>
              <button type="button" className="btn btn-accent" onClick={restartQuiz}>
                <RotateCcw size={16} /> Chơi lại lần nữa
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
