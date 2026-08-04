'use client';

import { useEffect, useState } from 'react';
import { User } from '@/lib/types';
import AdminPanel from '@/components/AdminPanel';
import GroupLeaderPanel from '@/components/GroupLeaderPanel';
import StudentPanel from '@/components/StudentPanel';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminInputId, setAdminInputId] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');

  useEffect(() => {
    // Start login flow — always prioritize Telegram WebApp if available
    initAuth();
  }, []);

  async function initAuth() {
    // 1. Try Telegram WebApp first (retry up to 15 times for script load)
    let attempts = 0;
    const maxAttempts = 15;

    const tryTelegram = async () => {
      attempts++;
      const tg = (window as any).Telegram?.WebApp;

      if (tg?.initDataUnsafe?.user) {
        tg.expand();
        tg.ready();
        try {
          tg.setHeaderColor('#0f172a');
          tg.setBackgroundColor('#0f172a');
        } catch {}
        // Perform fresh login with Telegram user to get up-to-date role from DB
        await performLogin(tg.initDataUnsafe.user);
      } else if (attempts < maxAttempts) {
        setTimeout(tryTelegram, 100);
      } else {
        // Not inside Telegram — check local saved session
        const savedUser = localStorage.getItem('smp_user');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            if (parsed?.telegram_id) {
              // Refresh session from server
              await performLogin({ id: parsed.telegram_id, first_name: parsed.first_name });
              return;
            }
          } catch {}
        }

        // Neither Telegram WebApp nor saved session
        setError('TELEGRAM_ONLY');
        setLoading(false);
      }
    };

    tryTelegram();
  }

  async function performLogin(tgUser: any) {
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
      localStorage.setItem('smp_user', JSON.stringify(data.user));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminManualLogin(e: React.FormEvent) {
    e.preventDefault();
    setAdminAuthError('');
    if (!adminInputId.trim()) return;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: adminInputId.trim(),
          first_name: 'Admin',
        }),
      });

      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();

      if (data.user?.role !== 'SUPER_ADMIN') {
        setAdminAuthError("Ruxsat berilmadi: Siz Super Admin emassiz");
        return;
      }

      setUser(data.user);
      localStorage.setItem('smp_user', JSON.stringify(data.user));
      setShowAdminModal(false);
      setError(null);
    } catch (err: any) {
      setAdminAuthError(err.message || 'Xatolik yuz berdi');
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

  // Not opened in Telegram & no stored session
  if (error === 'TELEGRAM_ONLY' && !user) {
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
          position: 'relative',
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

        {/* Secret Admin Login trigger */}
        <button
          onClick={() => setShowAdminModal(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: 12,
            cursor: 'pointer',
            marginTop: 32,
            textDecoration: 'underline',
          }}
        >
          🔑 Admin sifatida kirish
        </button>

        {showAdminModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: '#1e293b',
                borderRadius: 20,
                padding: 24,
                width: '100%',
                maxWidth: 360,
                textAlign: 'left',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#fff' }}>
                🔑 Admin Kirish
              </h3>
              <form onSubmit={handleAdminManualLogin}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>
                    Admin Telegram ID
                  </label>
                  <input
                    type="text"
                    value={adminInputId}
                    onChange={(e) => setAdminInputId(e.target.value)}
                    placeholder="Telegram ID kiriting"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none',
                    }}
                    autoFocus
                  />
                </div>

                {adminAuthError && (
                  <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>
                    ⚠️ {adminAuthError}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 10,
                      background: 'transparent',
                      color: '#94a3b8',
                      border: '1px solid #334155',
                      cursor: 'pointer',
                    }}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 20px',
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #0088cc, #00b4ff)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Kirish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
        <button
          className="btn btn-primary"
          onClick={() => {
            localStorage.removeItem('smp_user');
            window.location.reload();
          }}
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  if (user.role === 'SUPER_ADMIN') return <AdminPanel user={user} />;
  if (user.role === 'GROUP_LEADER') return <GroupLeaderPanel user={user} />;
  return <StudentPanel user={user} />;
}
