'use client';

import { useEffect, useState, useCallback } from 'react';
import { User, Group, Student, Attendance, AttendanceStatus } from '@/lib/types';

interface Props {
  user: User;
}

const ATTENDANCE_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: '#34d399',
  ABSENT: '#f87171',
  EXCUSED: '#fbbf24',
  LATE: '#a78bfa',
};

const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: 'Keldi',
  ABSENT: 'Kelmadi',
  EXCUSED: 'Sababli',
  LATE: 'Kech keldi',
};

export default function GroupLeaderPanel({ user }: Props) {
  const [myGroup, setMyGroup] = useState<Group | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [savedAttendance, setSavedAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'today' | 'students' | 'history'>('today');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const fetchMyGroup = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      const allGroups: Group[] = data.groups || [];
      const mine = allGroups.find(g => g.leader_id === user.id);
      setMyGroup(mine || null);

      if (mine) {
        const [studRes, attRes] = await Promise.all([
          fetch(`/api/students?group_id=${mine.id}`),
          fetch(`/api/attendance?group_id=${mine.id}&date=${today}`),
        ]);
        const studData = await studRes.json();
        const attData = await attRes.json();
        setStudents(studData.students || []);

        const attMap: Record<string, AttendanceStatus> = {};
        (attData.attendance || []).forEach((a: Attendance) => {
          attMap[a.student_id] = a.status;
        });
        setAttendance(attMap);
        setSavedAttendance(attData.attendance || []);
      }
    } finally {
      setLoading(false);
    }
  }, [user.id, today]);

  useEffect(() => { fetchMyGroup(); }, [fetchMyGroup]);

  const markAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const saveAttendance = async () => {
    if (!myGroup) return;
    setSaving(true);
    try {
      const records = students.map(s => ({
        student_id: s.id,
        status: attendance[s.id] || 'PRESENT',
        note: '',
      }));

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records, group_id: myGroup.id, date: today, marked_by_id: user.id }),
      });
      if (!res.ok) throw new Error('Saqlashda xato');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('uz-UZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
        <div className="spinner" style={{ width: 48, height: 48 }} />
        <p style={{ color: 'var(--text-secondary)' }}>Guruh ma'lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  if (!myGroup) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, padding: 24 }}>
        <span style={{ fontSize: 56 }}>📭</span>
        <h2 style={{ fontSize: 20, fontWeight: 700, textAlign: 'center' }}>Guruh biriktirilmagan</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: 14 }}>
          Admin sizga guruh biriktirishi kerak. Admin bilan bog'laning.
        </p>
        <button className="btn btn-ghost" onClick={fetchMyGroup}>🔄 Yangilash</button>
      </div>
    );
  }

  const presentCount = students.filter(s => attendance[s.id] === 'PRESENT' || (!attendance[s.id])).length;
  const absentCount = students.filter(s => attendance[s.id] === 'ABSENT').length;
  const excusedCount = students.filter(s => attendance[s.id] === 'EXCUSED').length;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 24 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #1d3557 100%)',
        padding: '24px 20px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(16,185,129,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', fontSize: 24 }}>👨‍🏫</div>
          <div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Guruh Rahbari</p>
            <h1 style={{ fontSize: 20, fontWeight: 800 }}>{user.first_name} {user.last_name}</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>📚 {myGroup.name} — {myGroup.code}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 16px', marginTop: -40, position: 'relative', zIndex: 1 }}>
        <div className="grid-3">
          <div className="stat-card">
            <span className="stat-value" style={{ color: '#34d399' }}>{presentCount}</span>
            <span className="stat-label">Keldi</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ color: '#f87171' }}>{absentCount}</span>
            <span className="stat-label">Kelmadi</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ color: 'var(--accent-blue-light)' }}>{students.length}</span>
            <span className="stat-label">Jami</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '16px 16px 0' }}>
        <div className="tabs">
          <button className={`tab ${tab === 'today' ? 'active' : ''}`} onClick={() => setTab('today')}>📋 Bugun</button>
          <button className={`tab ${tab === 'students' ? 'active' : ''}`} onClick={() => setTab('students')}>👥 Talabalar</button>
          <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>📅 Tarix</button>
        </div>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>
        {/* Today Tab */}
        {tab === 'today' && (
          <div className="animate-in">
            <div className="card" style={{ marginBottom: 16, background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>📅 Bugungi sana</p>
              <p style={{ fontSize: 15, fontWeight: 600 }}>{todayFormatted}</p>
            </div>

            {students.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>Talabalar yo'q</p>
                <button className="btn btn-primary btn-sm" onClick={() => setTab('students')}>Talaba qo'shish</button>
              </div>
            ) : (
              <>
                {students.map(student => {
                  const currentStatus = attendance[student.id] || 'PRESENT';
                  return (
                    <div key={student.id} className="card" style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' }}>
                          {student.user?.first_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>{student.user?.first_name} {student.user?.last_name}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{student.user?.username || '—'}</p>
                        </div>
                        <span className="badge" style={{
                          marginLeft: 'auto',
                          background: `${ATTENDANCE_COLORS[currentStatus]}20`,
                          color: ATTENDANCE_COLORS[currentStatus],
                        }}>
                          {ATTENDANCE_LABELS[currentStatus]}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {(Object.keys(ATTENDANCE_LABELS) as AttendanceStatus[]).map(status => (
                          <button
                            key={status}
                            className="btn btn-sm"
                            style={{
                              flex: 1,
                              padding: '6px 4px',
                              fontSize: 11,
                              background: currentStatus === status
                                ? `${ATTENDANCE_COLORS[status]}30`
                                : 'rgba(255,255,255,0.04)',
                              color: currentStatus === status ? ATTENDANCE_COLORS[status] : 'var(--text-muted)',
                              border: `1px solid ${currentStatus === status ? ATTENDANCE_COLORS[status] + '60' : 'var(--border)'}`,
                            }}
                            onClick={() => markAttendance(student.id, status)}
                          >
                            {ATTENDANCE_LABELS[status]}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div style={{ position: 'fixed', bottom: 24, left: 16, right: 16, zIndex: 10 }}>
                  <button
                    className="btn btn-success btn-lg"
                    style={{ width: '100%', boxShadow: '0 8px 32px rgba(16,185,129,0.4)' }}
                    onClick={saveAttendance}
                    disabled={saving}
                  >
                    {saving ? '⏳ Saqlanmoqda...' : saved ? '✅ Saqlandi!' : '💾 Davomatni Saqlash'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Students Tab */}
        {tab === 'students' && (
          <div className="animate-in">
            <button className="btn btn-primary" style={{ width: '100%', marginBottom: 16 }} onClick={() => setShowAddStudent(true)}>
              ＋ Talaba qo'shish
            </button>
            {students.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
                <p style={{ fontWeight: 600 }}>Talabalar yo'q</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {students.map((s, i) => (
                  <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', minWidth: 24 }}>{i + 1}.</span>
                    <div className="avatar avatar-sm">
                      {s.user?.first_name?.charAt(0) || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{s.user?.first_name} {s.user?.last_name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {s.user?.username ? `@${s.user.username}` : `ID: ${s.user?.telegram_id}`}
                      </p>
                    </div>
                    <span className={`badge ${s.is_active ? 'badge-green' : 'badge-red'}`}>
                      {s.is_active ? 'Faol' : 'Nofaol'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {tab === 'history' && (
          <div className="animate-in">
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>Bugungi Davomat</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 32, fontWeight: 800, color: '#34d399' }}>{presentCount}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Keldi</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 32, fontWeight: 800, color: '#f87171' }}>{absentCount}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Kelmadi</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 32, fontWeight: 800, color: '#fbbf24' }}>{excusedCount}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sababli</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <AddStudentModal
          groupId={myGroup.id}
          onClose={() => setShowAddStudent(false)}
          onSuccess={() => { setShowAddStudent(false); fetchMyGroup(); }}
        />
      )}
    </div>
  );
}

function AddStudentModal({ groupId, onClose, onSuccess }: { groupId: string; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ telegram_id: '', first_name: '', last_name: '', username: '', student_card_number: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.telegram_id || !form.first_name) { setErr('Telegram ID va ism majburiy'); return; }
    setSaving(true);
    setErr('');
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, group_id: groupId }),
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

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>👤 Talaba Qo'shish</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Telegram ID *</label>
            <input className="input" type="number" placeholder="Masalan: 987654321" value={form.telegram_id} onChange={e => setForm({ ...form, telegram_id: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Ism *</label>
            <input className="input" placeholder="Masalan: Jasur" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Familiya</label>
            <input className="input" placeholder="Masalan: Toshmatov" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Talaba guvohnomasi raqami</label>
            <input className="input" placeholder="Masalan: TG-2023-001" value={form.student_card_number} onChange={e => setForm({ ...form, student_card_number: e.target.value })} />
          </div>
          {err && <p style={{ color: 'var(--accent-red)', fontSize: 13 }}>⚠️ {err}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Bekor</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
              {saving ? '⏳...' : '✓ Qo\'shish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
