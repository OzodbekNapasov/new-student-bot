'use client';

import { useEffect, useState } from 'react';
import { User } from '@/lib/types';
import { getTelegramUser, expandTelegramApp } from '@/lib/telegramAuth';
import AdminPanel from '@/components/AdminPanel';
import GroupLeaderPanel from '@/components/GroupLeaderPanel';
import StudentPanel from '@/components/StudentPanel';
import { Key, LogIn, AlertTriangle, Send, Loader2 } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginInput, setLoginInput] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    expandTelegramApp();
    initAuth();
  }, []);

  async function initAuth() {
    // 1. Try to get Telegram user from WebApp frame / URL
    const tgUser = getTelegramUser();
    if (tgUser) {
      await performLogin({
        telegram_id: String(tgUser.id),
        first_name: tgUser.first_name || 'User',
        last_name: tgUser.last_name || '',
        username: tgUser.username || '',
      });
      return;
    }

    // 2. Try saved local session
    const savedUser = localStorage.getItem('smp_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.telegram_id) {
          await performLogin({
            telegram_id: parsed.telegram_id,
            first_name: parsed.first_name,
          });
          return;
        }
      } catch {}
    }

    // Neither auto Telegram user nor saved session — show clean manual login card
    setLoading(false);
  }

  async function performLogin(params: {
    telegram_id?: string;
    login_code?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
  }) {
    setAuthenticating(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kirishda xatolik');

      if (!data.user) throw new Error("Foydalanuvchi ma'lumoti topilmadi");

      setUser(data.user);
      localStorage.setItem('smp_user', JSON.stringify(data.user));
      setError(null);
    } catch (err: any) {
      setLoginError(err.message);
      setError(err.message);
    } finally {
      setAuthenticating(false);
      setLoading(false);
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim()) return;

    const input = loginInput.trim();
    if (/^\d+$/.test(input)) {
      await performLogin({ telegram_id: input, first_name: 'Foydalanuvchi' });
    } else {
      await performLogin({ login_code: input });
    }
  };

  if (loading || authenticating) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 16,
          background: 'var(--bg-primary)',
        }}
      >
        <Loader2 className="spinner-icon" size={44} style={{ color: '#38bdf8' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600 }}>Tizimga kirilmoqda...</p>
      </div>
    );
  }

  // Not automatically logged in — show clear, user-friendly login interface
  if (!user) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: 24,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 24,
            padding: 32,
            width: '100%',
            maxWidth: 400,
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#fff',
              boxShadow: '0 8px 20px rgba(56, 189, 248, 0.3)',
            }}
          >
            <Key size={32} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#fff' }}>
            Tizimga Kirish
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
            Guruh rahbari bo'lsangiz — admindan olgan <b>Login kodingizni</b> (masalan:{' '}
            <code>X7K9P2</code>) kiriting.
            <br />
            Admin bo'lsangiz — <b>Telegram IDingizni</b> kiriting.
          </p>

          <form
            onSubmit={handleManualSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <input
              type="text"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="Login kodi yoki Telegram ID"
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: 14,
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                outline: 'none',
                textAlign: 'center',
                letterSpacing: 1,
              }}
              autoFocus
            />

            {loginError && (
              <p style={{ color: '#ef4444', fontSize: 13, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <AlertTriangle size={16} /> {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={authenticating || !loginInput.trim()}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #0088cc, #00b4ff)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(0, 180, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {authenticating ? (
                <>
                  <Loader2 className="spinner-icon" size={18} /> Kirilmoqda...
                </>
              ) : (
                <>
                  Kirish <LogIn size={18} />
                </>
              )}
            </button>
          </form>

          <div
            style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <a
              href="https://t.me/new_students_shtt_bot"
              style={{ color: '#38bdf8', fontSize: 13, textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Send size={15} /> Botga O'tish (@new_students_shtt_bot)
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (user.role === 'SUPER_ADMIN') return <AdminPanel user={user} />;
  if (user.role === 'GROUP_LEADER') return <GroupLeaderPanel user={user} />;
  return <StudentPanel user={user} />;
}
