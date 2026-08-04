'use client';

import { useEffect, useState, useCallback } from 'react';
import { User, Attendance, Group, Student } from '@/lib/types';

interface Props {
  user: User;
}

export default function StudentPanel({ user }: Props) {
  const [myStudentRecord, setMyStudentRecord] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'today' | 'history'>('today');

  const fetch30Days = useCallback(async () => {
    setLoading(true);
    try {
      // Find my student record
      const res = await fetch('/api/students');
      const data = await res.json();
      const allStudents: Student[] = data.students || [];
      const mine = allStudents.find((s) => s.user?.telegram_id === user.telegram_id);
      setMyStudentRecord(mine || null);

      if (mine) {
        // Last 30 days attendance
        const attRes = await fetch(`/api/attendance?group_id=${mine.group_id}`);
        const attData = await attRes.json();
        setAttendance(attData.attendance || []);
      }
    } finally {
      setLoading(false);
    }
  }, [user.telegram_id]);

  useEffect(() => {
    fetch30Days();
  }, [fetch30Days]);

  const today = new Date().toISOString().split('T')[0];
  const todayAtt = attendance.find((a) => a.date === today);

  const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
  const absentCount = attendance.filter((a) => a.status === 'ABSENT').length;
  const totalDays = attendance.length || 1;
  const percentage = Math.round((presentCount / totalDays) * 100);

  const statusEmoji: Record<string, string> = {
    PRESENT: '✅',
    ABSENT: '❌',
    EXCUSED: '🔶',
    LATE: '🕐',
  };

  const statusLabel: Record<string, string> = {
    PRESENT: 'Keldim',
    ABSENT: 'Kelmadim',
    EXCUSED: 'Sababli kelmadim',
    LATE: 'Kech keldim',
  };

  const statusColor: Record<string, string> = {
    PRESENT: '#34d399',
    ABSENT: '#f87171',
    EXCUSED: '#fbbf24',
    LATE: '#a78bfa',
  };

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
        <p style={{ color: 'var(--text-secondary)' }}>Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 24 }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #11998e 100%)',
          padding: '24px 20px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div
            className="avatar avatar-lg"
            style={{ background: 'linear-gradient(135deg, #11998e, #38ef7d)', fontSize: 24 }}
          >
            🎓
          </div>
          <div>
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Talaba
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>
              {user.first_name} {user.last_name}
            </h1>
            {myStudentRecord?.group && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                📚 {(myStudentRecord.group as any)?.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 16px', marginTop: -40, position: 'relative', zIndex: 1 }}>
        <div className="grid-3">
          <div className="stat-card">
            <span className="stat-value" style={{ color: '#34d399' }}>
              {presentCount}
            </span>
            <span className="stat-label">Kelgan</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ color: '#f87171' }}>
              {absentCount}
            </span>
            <span className="stat-label">Kelmagan</span>
          </div>
          <div className="stat-card">
            <span
              className="stat-value"
              style={{
                color: percentage >= 80 ? '#34d399' : percentage >= 60 ? '#fbbf24' : '#f87171',
              }}
            >
              {percentage}%
            </span>
            <span className="stat-label">Davomat</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '16px 16px 0' }}>
        <div className="tabs">
          <button
            className={`tab ${tab === 'today' ? 'active' : ''}`}
            onClick={() => setTab('today')}
          >
            📋 Bugun
          </button>
          <button
            className={`tab ${tab === 'history' ? 'active' : ''}`}
            onClick={() => setTab('history')}
          >
            📅 Tarix
          </button>
        </div>
      </div>

      <div style={{ padding: '16px 16px 24px' }}>
        {tab === 'today' && (
          <div className="animate-in">
            {/* Today Status */}
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '32px 20px',
                background: todayAtt
                  ? `linear-gradient(135deg, ${statusColor[todayAtt.status]}15, transparent)`
                  : 'var(--bg-card)',
                borderColor: todayAtt ? `${statusColor[todayAtt.status]}30` : 'var(--border)',
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 56, marginBottom: 12 }}>
                {todayAtt ? statusEmoji[todayAtt.status] : '⏳'}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
                {todayAtt ? statusLabel[todayAtt.status] : 'Hali belgilanmagan'}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                {new Date().toLocaleDateString('uz-UZ', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              {todayAtt && (
                <span
                  className="badge"
                  style={{
                    marginTop: 12,
                    background: `${statusColor[todayAtt.status]}20`,
                    color: statusColor[todayAtt.status],
                  }}
                >
                  {statusLabel[todayAtt.status]}
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Umumiy davomat</span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: percentage >= 80 ? '#34d399' : '#f87171',
                  }}
                >
                  {percentage}%
                </span>
              </div>
              <div
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  height: 10,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${percentage}%`,
                    borderRadius: 8,
                    background:
                      percentage >= 80
                        ? 'linear-gradient(90deg, #059669, #34d399)'
                        : percentage >= 60
                          ? 'linear-gradient(90deg, #d97706, #fbbf24)'
                          : 'linear-gradient(90deg, #dc2626, #f87171)',
                    transition: 'width 1s ease',
                  }}
                />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                {presentCount} / {totalDays} kun
              </p>
            </div>

            {!myStudentRecord && (
              <div
                className="card"
                style={{ marginTop: 16, textAlign: 'center', padding: '32px 20px' }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>Guruhga biriktirilmadingiz</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Guruh rahbari yoki admin bilan bog'laning.
                </p>
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="animate-in">
            {attendance.length === 0 ? (
              <div
                style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
                <p style={{ fontWeight: 600 }}>Davomat yozuvlari yo'q</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...attendance]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((a) => (
                    <div
                      key={a.id}
                      className="card"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 16px',
                        borderLeft: `3px solid ${statusColor[a.status]}`,
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{statusEmoji[a.status]}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>
                          {new Date(a.date).toLocaleDateString('uz-UZ', {
                            weekday: 'short',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p style={{ fontSize: 12, color: statusColor[a.status] }}>
                          {statusLabel[a.status]}
                        </p>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(a.date).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
