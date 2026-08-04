'use client';

import { useEffect, useState } from 'react';
import { User } from '@/lib/types';
import { getTelegramUser, expandTelegramApp } from '@/lib/telegramAuth';
import AdminPanel from '@/components/AdminPanel';
import GroupLeaderPanel from '@/components/GroupLeaderPanel';
import StudentPanel from '@/components/StudentPanel';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for Telegram WebApp script to load then login
    waitForTelegramAndLogin();
  }, []);

  async function waitForTelegramAndLogin() {
    // Telegram WebApp script may not have loaded yet — retry up to 15 times (1.5s)
    let attempts = 0;
    const maxAttempts = 15;

    const tryLogin = async () => {
      attempts++;
      const tg = (window as any).Telegram?.WebApp;

      if (tg?.initDataUnsafe?.user) {
        // Telegram WebApp is ready
        tg.expand();
        tg.ready();
        try {
          tg.setHeaderColor('#0f172a');
          tg.setBackgroundColor('#0f172a');
        } catch {}
        await login(tg.initDataUnsafe.user);
      } else if (attempts < maxAttempts) {
        // Not ready yet — wait 100ms and try again
        setTimeout(tryLogin, 100);
      } else {
        // Gave up — not inside Telegram
        setError('TELEGRAM_ONLY');
        setLoading(false);
      }
    };

    tryLogin();
  }

  async function login(tgUser: any) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: String(tgUser.id),
          first_name: tgUser.first_name || 'User',
          last_name: tgUser.last_name || '',
          username: tgUser.username || '',
          photo_url: tgUser.photo_url || '',
        }),
      });

      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }


  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 16,
        }}
      >
        <div className="spinner" style={{ width: 48, height: 48 }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Yuklanmoqda...</p>
      </div>
    );
  }

  // Not opened in Telegram — block access
  if (error === 'TELEGRAM_ONLY') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 20,
          padding: 32,
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: 72 }}>🔒</span>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Faqat Telegram orqali</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
          Bu platforma faqat Telegram ilovasi ichida ishlaydi.
          <br />
          Botga /start yuboring va panelni oching.
        </p>
        <a
          href="https://t.me/new_students_shtt_bot"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #0088cc, #00b4ff)',
            color: '#fff',
            padding: '14px 28px',
            borderRadius: 14,
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
            marginTop: 8,
          }}
        >
          📱 Botga O'tish
        </a>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 16,
          padding: 24,
        }}
      >
        <span style={{ fontSize: 48 }}>⚠️</span>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Xatolik yuz berdi</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: 14 }}>
          {error || "Foydalanuvchi ma'lumoti topilmadi"}
        </p>
        <button className="btn btn-primary" onClick={login}>
          Qayta urinish
        </button>
      </div>
    );
  }

  // Unknown user — not registered yet (new user who hasn't used the bot)
  if (!user.role || user.role === 'STUDENT') {
    // Check if STUDENT role is legitimate (they exist in students table)
    // For now, show student panel — GroupLeaderPanel handles leader-specific UI
    if (user.role === 'STUDENT') return <StudentPanel user={user} />;

    // No role assigned yet
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 16,
          padding: 32,
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: 64 }}>⏳</span>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Hali ro'yxatdan o'tmadingiz</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
          Botga login kodingizni yuboring.
          <br />
          Rahbar bo'lsangiz — admin tomonidan kod beriladi.
        </p>
      </div>
    );
  }

  if (user.role === 'SUPER_ADMIN') return <AdminPanel user={user} />;
  if (user.role === 'GROUP_LEADER') return <GroupLeaderPanel user={user} />;
  return <StudentPanel user={user} />;
}
