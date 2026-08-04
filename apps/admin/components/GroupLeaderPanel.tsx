'use client';

import { useEffect, useState, useCallback } from 'react';
import { User, Group, Student } from '@/lib/types';

interface Props {
  user: User;
}

export default function GroupLeaderPanel({ user }: Props) {
  const [myGroup, setMyGroup] = useState<Group | null>(null);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [transferringStudent, setTransferringStudent] = useState<Student | null>(null);

  const fetchMyGroup = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      const groupsList: Group[] = data.groups || [];
      setAllGroups(groupsList);

      const mine = groupsList.find(
        (g) =>
          g.leader_id === user.id ||
          g.leader?.id === user.id ||
          g.leader?.telegram_id === user.telegram_id,
      );
      setMyGroup(mine || null);

      if (mine) {
        const studRes = await fetch(`/api/students?group_id=${mine.id}`);
        const studData = await studRes.json();
        setStudents(studData.students || []);
      }
    } finally {
      setLoading(false);
    }
  }, [user.id, user.telegram_id]);

  useEffect(() => {
    fetchMyGroup();
  }, [fetchMyGroup]);

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
        <p style={{ color: 'var(--text-secondary)' }}>Guruh ma'lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  if (!myGroup) {
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
        <span style={{ fontSize: 56 }}>📭</span>
        <h2 style={{ fontSize: 20, fontWeight: 700, textAlign: 'center' }}>
          Guruh biriktirilmagan
        </h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: 14 }}>
          Admin sizga guruh biriktirishi kerak. Admin bilan bog'laning.
        </p>
        <button className="btn btn-ghost" onClick={fetchMyGroup}>
          🔄 Yangilash
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 60, background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #1d3557 100%)',
          padding: '24px 20px 70px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="avatar avatar-lg"
              style={{ background: 'linear-gradient(135deg, #059669, #10b981)', fontSize: 24 }}
            >
              👨‍🏫
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
                Guruh Rahbari
              </p>
              <h1 style={{ fontSize: 20, fontWeight: 800 }}>
                {user.first_name} {user.last_name}
              </h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                📚 Guruh: <b>{myGroup.name}</b> ({myGroup.code})
              </p>
            </div>
          </div>
          <button
            className="btn btn-sm"
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              padding: '6px 12px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
            }}
            onClick={() => {
              if (confirm('Hisobdan chiqmoqchimisiz?')) {
                localStorage.removeItem('smp_user');
                window.location.reload();
              }
            }}
          >
            🚪 Chiqish
          </button>
        </div>
      </div>

      {/* Group Stats Card */}
      <div style={{ padding: '0 16px', marginTop: -35, position: 'relative', zIndex: 1 }}>
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
              GURUH TALABALARI
            </p>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#34d399', marginTop: 2 }}>
              {students.length} nafar
            </h2>
          </div>
          <button
            className="btn btn-primary"
            style={{ boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}
            onClick={() => setShowAddStudent(true)}
          >
            ＋ Talaba Qo'shish
          </button>
        </div>
      </div>

      {/* Main Students List Section */}
      <div style={{ padding: '20px 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>
            👥 Guruh Talabalari Ro'yxati{' '}
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>(Familiya Ism Sharif)</span>
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={fetchMyGroup}>
            🔄 Yangilash
          </button>
        </div>

        {students.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 16,
              border: '1px dashed var(--border)',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>Guruhda talabalar yo'q</p>
            <p style={{ fontSize: 13 }}>
              Yuqoridagi "＋ Talaba Qo'shish" tugmasi orqali talaba qo'shing.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                  <th
                    style={{
                      padding: '12px 16px',
                      width: 50,
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    T/R
                  </th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    Talabaning Familiyasi, Ismi va Sharifi (F.I.Sh)
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => {
                  const fullName =
                    `${s.user?.last_name || ''} ${s.user?.first_name || ''}`.trim() ||
                    `${s.user?.first_name || ''}`;

                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{fullName}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{
                            color: '#38bdf8',
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.2)',
                            fontWeight: 600,
                            padding: '6px 12px',
                            borderRadius: 8,
                          }}
                          onClick={() => setTransferringStudent(s)}
                        >
                          ⇄ Boshqa guruhga ko'chirish
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <AddStudentModal
          groupId={myGroup.id}
          onClose={() => setShowAddStudent(false)}
          onSuccess={() => {
            setShowAddStudent(false);
            fetchMyGroup();
          }}
        />
      )}

      {/* Transfer Student Modal */}
      {transferringStudent && (
        <TransferStudentModal
          student={transferringStudent}
          allGroups={allGroups}
          currentGroupId={myGroup.id}
          onClose={() => setTransferringStudent(null)}
          onSuccess={() => {
            setTransferringStudent(null);
            fetchMyGroup();
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// Add Student Modal (Single F.I.Sh + Bulk List Mode)
// ============================================================
function AddStudentModal({
  groupId,
  onClose,
  onSuccess,
}: {
  groupId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [fullName, setFullName] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      if (mode === 'single') {
        if (!fullName.trim()) {
          setErr('Talabaning F.I.Sh kiritilishi shart');
          setSaving(false);
          return;
        }
        const parts = fullName.trim().split(' ').filter(Boolean);
        const lastName = parts[0] || '';
        const firstName = parts.slice(1).join(' ') || lastName;

        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: firstName,
            last_name: parts.length > 1 ? lastName : '',
            group_id: groupId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else {
        const lines = bulkText
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length === 0) {
          setErr('Kamida bitta talaba F.I.Sh kiriting');
          setSaving(false);
          return;
        }
        const res = await fetch('/api/students/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ group_id: groupId, names: lines }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }
      onSuccess();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>👤 Talaba Qo'shish</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            background: 'rgba(255,255,255,0.05)',
            padding: 4,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <button
            type="button"
            className={`btn btn-sm ${mode === 'single' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, borderRadius: 8, fontSize: 13 }}
            onClick={() => setMode('single')}
          >
            👤 Bittalab
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'bulk' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, borderRadius: 8, fontSize: 13 }}
            onClick={() => setMode('bulk')}
          >
            📋 Ro'yxat bo'yicha (Ko'plab)
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'single' ? (
            <div className="form-group">
              <label className="form-label">
                Talabaning Familiyasi, Ismi va Sharifi (F.I.Sh) *
              </label>
              <input
                className="input"
                placeholder="Masalan: Toshmatov Jasur Alisherovich"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoFocus
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Talabalar Ro'yxati (Har bir satrga bittadan) *</label>
              <textarea
                className="input"
                rows={6}
                placeholder={`Toshmatov Jasur Alisherovich\nAliyev Aziz Botirovich\nKarimov Olim Valiyevich`}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.5 }}
                autoFocus
              />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                💡 Har bir qatorga yangi talabaning Familiya va Ismini yozing.
              </p>
            </div>
          )}

          {err && <p style={{ color: 'var(--accent-red)', fontSize: 13 }}>⚠️ {err}</p>}

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              Bekor
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
              {saving ? '⏳ Saqlanmoqda...' : "✓ Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Transfer Student Modal
// ============================================================
function TransferStudentModal({
  student,
  allGroups,
  currentGroupId,
  onClose,
  onSuccess,
}: {
  student: Student;
  allGroups: Group[];
  currentGroupId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const fullName =
    `${student.user?.last_name || ''} ${student.user?.first_name || ''}`.trim() ||
    `${student.user?.first_name || ''}`;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) {
      setErr('Iltimos, guruhni tanlang');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: selectedGroupId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const academicGroups = allGroups.filter(
    (g) => g.code !== 'AKADEMIK' && g.code !== 'CHIQARILGAN' && g.id !== currentGroupId,
  );
  const statusGroups = allGroups.filter(
    (g) => (g.code === 'AKADEMIK' || g.code === 'CHIQARILGAN') && g.id !== currentGroupId,
  );

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>⇄ Talabani Ko'chirish</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <div
          style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 13, color: '#38bdf8', fontWeight: 600 }}>
            👤 <b>{fullName}</b>
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Talaba tizimdan o'chib ketmaydi, faqatgina tanlangan yangi guruhga ko'chiriladi.
          </p>
        </div>

        <form
          onSubmit={handleTransfer}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <div className="form-group">
            <label className="form-label">Qaysi guruhga o'tkazilsin? *</label>
            <select
              className="input"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              style={{
                fontSize: 14,
                fontWeight: 600,
                backgroundColor: '#1e293b',
                color: '#ffffff',
              }}
              autoFocus
            >
              <option value="" style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>
                -- Guruhni tanlang --
              </option>
              {academicGroups.length > 0 && (
                <optgroup
                  label="📚 O'quv Guruhlari"
                  style={{ backgroundColor: '#0f172a', color: '#38bdf8', fontWeight: 'bold' }}
                >
                  {academicGroups.map((g) => (
                    <option key={g.id} value={g.id} style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                      {g.name} ({g.code})
                    </option>
                  ))}
                </optgroup>
              )}

              {statusGroups.length > 0 && (
                <optgroup
                  label="──────── Maxsus Holatlar ────────"
                  style={{ backgroundColor: '#0f172a', color: '#f43f5e', fontWeight: 'bold' }}
                >
                  {statusGroups.map((g) => (
                    <option key={g.id} value={g.id} style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                      {g.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {err && <p style={{ color: 'var(--accent-red)', fontSize: 13 }}>⚠️ {err}</p>}

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              Bekor
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={saving || !selectedGroupId}
            >
              {saving ? "⏳ O'tkazilmoqda..." : "✓ O'tkazish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
