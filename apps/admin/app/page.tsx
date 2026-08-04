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
    expandTelegramApp();
    login();
  }, []);

  async function login() {
    try {
      // Get Telegram user from WebApp
      const tgUser = getTelegramUser();

      let telegramId: string;
      let firstName: string;
      let lastName: string;
      let username: string;
      let photoUrl: string;

      if (tgUser) {
        telegramId = String(tgUser.id);
        firstName = tgUser.first_name;
        lastName = tgUser.last_name || '';
        username = tgUser.username || '';
        photoUrl = tgUser.photo_url || '';
      } else {
        // Development fallback — admin mode for testing
        telegramId = '8135594558';
        firstName = 'Admin';
        lastName = 'Test';
        username = 'admin';
        photoUrl = '';
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: telegramId, first_name: firstName, last_name: lastName, username, photo_url: photoUrl }),
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
        <div className="spinner" style={{ width: 48, height: 48 }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, padding: 24 }}>
        <span style={{ fontSize: 48 }}>⚠️</span>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Xatolik yuz berdi</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: 14 }}>{error || 'Foydalanuvchi ma\'lumoti topilmadi'}</p>
        <button className="btn btn-primary" onClick={login}>Qayta urinish</button>
      </div>
    );
  }

  if (user.role === 'SUPER_ADMIN') return <AdminPanel user={user} />;
  if (user.role === 'GROUP_LEADER') return <GroupLeaderPanel user={user} />;
  return <StudentPanel user={user} />;
}
