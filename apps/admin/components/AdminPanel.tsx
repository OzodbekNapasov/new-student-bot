'use client';

import { useEffect, useState, useCallback } from 'react';
import { User, Group } from '@/lib/types';

interface Props {
  user: User;
}

type Tab = 'groups' | 'stats';

export default function AdminPanel({ user }: Props) {
  const [tab, setTab] = useState<Tab>('groups');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showGroupDetail, setShowGroupDetail] = useState<Group | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      setGroups(data.groups || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const deleteGroup = async (id: string) => {
    if (!confirm("Guruhni o'chirmoqchimisiz?")) return;
    await fetch(`/api/groups/${id}`, { method: 'DELETE' });
    fetchGroups();
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 24 }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          padding: '24px 20px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(59,130,246,0.1)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div
            className="avatar avatar-lg"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', fontSize: 24 }}
          >
            👑
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
              Super Admin
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>
              {user.first_name} {user.last_name}
            </h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              @{user.username || 'admin'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ padding: '0 16px', marginTop: -40, position: 'relative', zIndex: 1 }}>
        <div className="grid-3">
          <div className="stat-card">
            <span className="stat-value" style={{ color: 'var(--accent-blue-light)' }}>
              {groups.length}
            </span>
            <span className="stat-label">Guruhlar</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ color: '#34d399' }}>
              {groups.filter((g) => g.leader_id).length}
            </span>
            <span className="stat-label">Rahbarlar</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ color: '#a78bfa' }}>
              {groups.filter((g) => !g.leader_id).length}
            </span>
            <span className="stat-label">Kutilmoqda</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '16px 16px 0' }}>
        <div className="tabs">
          <button
            className={`tab ${tab === 'groups' ? 'active' : ''}`}
            onClick={() => setTab('groups')}
          >
            📚 Guruhlar
          </button>
          <button
            className={`tab ${tab === 'stats' ? 'active' : ''}`}
            onClick={() => setTab('stats')}
          >
            📊 Statistika
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 16px 80px' }}>
        {tab === 'groups' && (
          <div className="animate-in">
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: 16 }}
              onClick={() => setShowAddGroup(true)}
            >
              ＋ Yangi guruh qo'shish
            </button>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div className="spinner" />
              </div>
            ) : groups.length === 0 ? (
              <div
                style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>Guruhlar yo'q</p>
                <p style={{ fontSize: 13 }}>Birinchi guruhni qo'shing</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {groups.map((g) => (
                  <GroupCard
                    key={g.id}
                    group={g}
                    copiedCode={copiedCode}
                    onCopy={copyCode}
                    onViewDetail={() => setShowGroupDetail(g)}
                    onDelete={() => deleteGroup(g.id)}
                    onRefresh={fetchGroups}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'stats' && (
          <div className="animate-in">
            <StatsView groups={groups} />
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddGroup && (
        <AddGroupModal
          onClose={() => setShowAddGroup(false)}
          onSuccess={() => {
            setShowAddGroup(false);
            fetchGroups();
          }}
        />
      )}

      {showGroupDetail && (
        <GroupDetailModal
          group={showGroupDetail}
          copiedCode={copiedCode}
          onCopy={copyCode}
          onClose={() => setShowGroupDetail(null)}
          onRefresh={() => {
            setShowGroupDetail(null);
            fetchGroups();
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// Group Card
// ============================================================
function GroupCard({
  group,
  copiedCode,
  onCopy,
  onViewDetail,
  onDelete,
  onRefresh,
}: {
  group: any;
  copiedCode: string | null;
  onCopy: (c: string) => void;
  onViewDetail: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}) {
  const [regenerating, setRegenerating] = useState(false);

  const regenerateCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Login kodni yangilaysizmi? Eski kod endi ishlamaydi.')) return;
    setRegenerating(true);
    await fetch(`/api/groups/${group.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regenerate_code: true }),
    });
    onRefresh();
    setRegenerating(false);
  };

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            className="avatar"
            style={{
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            }}
          >
            {group.name.charAt(0)}
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>{group.name}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{group.code}</p>
          </div>
        </div>
        <span className={`badge ${group.leader_id ? 'badge-green' : 'badge-yellow'}`}>
          {group.leader_id ? '✓ Rahbar bor' : '⏳ Kutilmoqda'}
        </span>
      </div>

      {/* Leader Info */}
      {group.leader ? (
        <div
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 18 }}>👨‍🏫</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600 }}>
              {group.leader.first_name} {group.leader.last_name}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Guruh rahbari</p>
          </div>
        </div>
      ) : null}

      {/* Login Code Box */}
      <div
        style={{
          background: 'rgba(245,158,11,0.08)',
          border: '1px dashed rgba(245,158,11,0.4)',
          borderRadius: 10,
          padding: '10px 14px',
          marginBottom: 12,
        }}
      >
        <p
          style={{
            fontSize: 11,
            color: '#fbbf24',
            marginBottom: 6,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          🔑 Rahbar Login Kodi
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <code
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 4,
              color: '#fbbf24',
              flex: 1,
            }}
          >
            {group.login_code || '------'}
          </code>
          <button
            className="btn btn-sm"
            style={{
              background:
                copiedCode === group.login_code ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
              color: copiedCode === group.login_code ? '#34d399' : '#fbbf24',
              border: 'none',
              padding: '6px 12px',
            }}
            onClick={() => onCopy(group.login_code)}
          >
            {copiedCode === group.login_code ? '✓ Nusxalandi' : '📋 Nusxala'}
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
          Bu kodni rahbarga bering — bot-da /start bosib, kodni kiriting
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={onViewDetail}>
          📋 Batafsil
        </button>
        <button
          className="btn btn-sm"
          style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'none' }}
          onClick={regenerateCode}
          disabled={regenerating}
        >
          {regenerating ? '⏳' : '🔄 Yangi kod'}
        </button>
        <button className="btn btn-danger btn-sm" onClick={onDelete}>
          🗑️
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Group Detail Modal
// ============================================================
function GroupDetailModal({
  group,
  copiedCode,
  onCopy,
  onClose,
  onRefresh,
}: {
  group: any;
  copiedCode: string | null;
  onCopy: (c: string) => void;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const res = await fetch(`/api/students?group_id=${group.id}`);
    const data = await res.json();
    setStudents(data.students || []);
    setLoading(false);
  };

  const removeLeader = async () => {
    if (!confirm("Rahbarni guruhdan o'chirmoqchimisiz?")) return;
    setRemoving(true);
    await fetch(`/api/groups/${group.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remove_leader: true }),
    });
    onRefresh();
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ borderRadius: 'var(--radius)', maxHeight: '85vh' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{group.name}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{group.code}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Login Code */}
        <div
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px dashed rgba(245,158,11,0.4)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600, marginBottom: 8 }}>
            🔑 Rahbar uchun Login Kodi
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <code
              style={{ fontSize: 28, fontWeight: 900, letterSpacing: 6, color: '#fbbf24', flex: 1 }}
            >
              {group.login_code || '------'}
            </code>
            <button
              className="btn"
              style={{
                background:
                  copiedCode === group.login_code ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                color: copiedCode === group.login_code ? '#34d399' : '#fbbf24',
                border: 'none',
              }}
              onClick={() => onCopy(group.login_code)}
            >
              {copiedCode === group.login_code ? '✓ Nusxalandi!' : '📋 Nusxala'}
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Rahbarga shu kodni bering. U botga /start bosib, kodni kiritadi va avtomatik kirishadi.
          </p>
        </div>

        {/* Leader */}
        {group.leader ? (
          <div
            style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 12,
              padding: 14,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>👨‍🏫</span>
              <div>
                <p style={{ fontWeight: 700 }}>
                  {group.leader.first_name} {group.leader.last_name}
                </p>
                <p style={{ fontSize: 12, color: '#34d399' }}>Guruh rahbari ✓</p>
              </div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={removeLeader} disabled={removing}>
              {removing ? '⏳' : "O'chirish"}
            </button>
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 12,
              padding: 14,
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 32, marginBottom: 8 }}>⏳</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24' }}>Rahbar hali kirmagan</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Yuqoridagi kodni rahbarga bering
            </p>
          </div>
        )}

        {/* Students */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <p style={{ fontWeight: 700 }}>👥 Talabalar ({students.length})</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddStudent(true)}>
              ＋ Qo'shish
            </button>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : students.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                color: 'var(--text-muted)',
                fontSize: 13,
              }}
            >
              Talabalar yo'q
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {students.map((s, i) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 20 }}>
                    {i + 1}.
                  </span>
                  <div className="avatar avatar-sm">{s.user?.first_name?.charAt(0) || '?'}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>
                      {s.user?.first_name} {s.user?.last_name}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {s.user?.username ? `@${s.user.username}` : `ID: ${s.user?.telegram_id}`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ padding: '4px 8px', fontSize: 12 }}
                      title="Talabani o'chirish"
                      onClick={async () => {
                        if (!confirm(`${s.user?.first_name}ni guruhdan o'chirmoqchimisiz?`)) return;
                        await fetch(`/api/students/${s.id}`, { method: 'DELETE' });
                        fetchStudents();
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-ghost" style={{ width: '100%' }} onClick={onClose}>
          Yopish
        </button>

        {showAddStudent && (
          <AddStudentModal
            groupId={group.id}
            onClose={() => setShowAddStudent(false)}
            onSuccess={() => {
              setShowAddStudent(false);
              fetchStudents();
            }}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// Stats View
// ============================================================
function StatsView({ groups }: { groups: any[] }) {
  const totalWithLeader = groups.filter((g) => g.leader_id).length;
  const totalWithoutLeader = groups.filter((g) => !g.leader_id).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>
          📊 Umumiy Ko'rsatkichlar
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Jami guruhlar', value: groups.length, color: 'var(--accent-blue-light)' },
            { label: 'Rahbar kirgan', value: totalWithLeader, color: '#34d399' },
            { label: 'Rahbar kutilmoqda', value: totalWithoutLeader, color: '#fbbf24' },
          ].map((item) => (
            <div
              key={item.label}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.label}</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>🏫 Guruhlar Holati</h3>
        {groups.map((g) => (
          <div
            key={g.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{g.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{g.code}</p>
            </div>
            <span className={`badge ${g.leader_id ? 'badge-green' : 'badge-yellow'}`}>
              {g.leader_id ? '✓ Rahbar bor' : '⏳ Kutilmoqda'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Add Group Modal
// ============================================================
function AddGroupModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: '', code: '', faculty: '', academic_year: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code) {
      setErr('Nom va kod majburiy');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>📚 Yangi Guruh</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <div
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 13, color: '#fbbf24' }}>
            💡 Guruh yaratilgandan so'ng avtomatik <b>login kod</b> beriladi. Kodni rahbarga
            yuborasiz.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Guruh nomi *</label>
            <input
              className="input"
              placeholder="Masalan: IT-23-01"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Guruh kodi *</label>
            <input
              className="input"
              placeholder="Masalan: IT2301"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Fakultet</label>
            <input
              className="input"
              placeholder="Masalan: Axborot texnologiyalari"
              value={form.faculty}
              onChange={(e) => setForm({ ...form, faculty: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">O'quv yili</label>
            <input
              className="input"
              placeholder="Masalan: 2023-2024"
              value={form.academic_year}
              onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
            />
          </div>
          {err && <p style={{ color: 'var(--accent-red)', fontSize: 13 }}>⚠️ {err}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              Bekor
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
              {saving ? '⏳ Saqlanmoqda...' : '✓ Yaratish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Add Student Modal
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
  const [form, setForm] = useState({
    telegram_id: '',
    first_name: '',
    last_name: '',
    username: '',
    student_card_number: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.telegram_id || !form.first_name) {
      setErr('Telegram ID va ism majburiy');
      return;
    }
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
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>👤 Talaba Qo'shish</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Telegram ID *</label>
            <input
              className="input"
              type="number"
              placeholder="Masalan: 987654321"
              value={form.telegram_id}
              onChange={(e) => setForm({ ...form, telegram_id: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Ism *</label>
            <input
              className="input"
              placeholder="Masalan: Jasur"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Familiya</label>
            <input
              className="input"
              placeholder="Masalan: Toshmatov"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Talaba guvohnomasi</label>
            <input
              className="input"
              placeholder="Masalan: TG-2023-001"
              value={form.student_card_number}
              onChange={(e) => setForm({ ...form, student_card_number: e.target.value })}
            />
          </div>
          {err && <p style={{ color: 'var(--accent-red)', fontSize: 13 }}>⚠️ {err}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              Bekor
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
              {saving ? '⏳...' : "✓ Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
