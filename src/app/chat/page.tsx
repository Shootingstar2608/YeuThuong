'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import styles from './chat.module.css';
import { Send, Heart } from 'lucide-react';

interface Message {
  id: number;
  content: string;
  createdAt: string;
  user: { id: number; name: string };
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Hôm qua ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
}

export default function ChatPage() {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [message, setMessage]     = useState('');
  const [loading, setLoading]     = useState(true);
  const [myId, setMyId]           = useState<number | null>(null);
  const [sending, setSending]     = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  async function loadMessages() {
    const res = await fetch('/api/chat');
    if (res.ok) setMessages(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    fetch('/api/auth/me').then(async r => {
      if (r.ok) setMyId((await r.json()).user.id);
    });
    fetch('/api/chat').then(async r => {
      if (r.ok) setMessages(await r.json());
      setLoading(false);
    });
    const timer = window.setInterval(loadMessages, 4000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });
    setSending(false);
    if (res.ok) { setMessage(''); loadMessages(); }
    inputRef.current?.focus();
  }

  // Group consecutive messages by same user
  const grouped = messages.reduce<{ userId: number; name: string; msgs: Message[] }[]>((acc, msg) => {
    const last = acc[acc.length - 1];
    if (last && last.userId === msg.user.id) {
      last.msgs.push(msg);
    } else {
      acc.push({ userId: msg.user.id, name: msg.user.name, msgs: [msg] });
    }
    return acc;
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        {/* Header */}
        <div className={styles.chatHeader}>
          <div className={styles.chatAvatar}>
            <Heart size={18} fill="currentColor" />
          </div>
          <div>
            <h1 className={styles.chatTitle}>Our Space Chat</h1>
            <p className={styles.chatSub}>Tin nhắn được lưu trong shared space của hai bạn</p>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {loading && (
            <div className={styles.loadingWrap}>
              <div className={styles.typingDots}>
                <span /><span /><span />
              </div>
            </div>
          )}
          {!loading && messages.length === 0 && (
            <div className={styles.emptyChat}>
              <span className={styles.emptyIcon}>💬</span>
              <p>Bắt đầu bằng một lời yêu thương đi nào!</p>
            </div>
          )}
          {grouped.map((group, gi) => {
            const isMe = group.userId === myId;
            return (
              <div key={gi} className={`${styles.messageGroup} ${isMe ? styles.mine : styles.theirs}`}>
                {!isMe && (
                  <div className={styles.groupAvatar} title={group.name}>
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={styles.bubbles}>
                  {!isMe && <span className={styles.senderName}>{group.name}</span>}
                  {group.msgs.map((m, mi) => (
                    <div key={m.id} className={styles.bubble}>
                      {m.content}
                      {mi === group.msgs.length - 1 && (
                        <span className={styles.time}>{formatTime(m.createdAt)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form className={styles.form} onSubmit={sendMessage}>
          <input
            ref={inputRef}
            className={styles.input}
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={500}
            placeholder="Nhắn gì cho người yêu thương..."
            autoComplete="off"
          />
          <button
            className={styles.sendBtn}
            type="submit"
            disabled={sending || !message.trim()}
            title="Gửi tin nhắn"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
