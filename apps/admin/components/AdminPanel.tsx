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
  const [showAssignLeader, setShowAssignLeader] = useState<Group | null>(null);

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

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const deleteGroup = async (id: string) => {
    if (!confirm('Guruhni o\'chirmoqchimisiz?')) return;
    await fetch(`/api/groups/${id}`, { method: 'DELETE' });
    fetchGroups();
  };

  const initials = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 24 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '24px 20px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(59,130,246,0.1)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(139,92,246,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', fontSize: 24 }}>
            👑
          </div>
          <div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Super Admin</p>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>{user.first_name} {user.last_name}</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>@{user.username || 'admin'}</p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ padding: '0 16px', marginTop: -40, position: 'relative', zIndex: 1 }}>
        <div className="grid-3">
          <div className="stat-card">
            <span className="stat-value" style={{ color: 'var(--accent-blue-light)' }}>{groups.length}</span>
            <span className="stat-label">Guruhlar</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ color: '#34d399' }}>{groups.filter(g => g.leader_id).length}</span>
            <span className="stat-label">Rahbarlar</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ color: '#a78bfa' }}>{groups.filter(g => g.is_active).length}</span>
            <span className="stat-label">Faol</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '16px 16px 0' }}>
        <div className="tabs">
          <button className={`tab ${tab === 'groups' ? 'active' : ''}`} onClick={() => setTab('groups')}>📚 Guruhlar</button>
          <button className={`tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>📊 Statistika</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 16px 80px' }}>
        {tab === 'groups' && (
          <div className="animate-in">
            {/* Add Group Button */}
            <button className="btn btn-primary" style={{ width: '100%', marginBottom: 16 }} onClick={() => setShowAddGroup(true)}>
              ＋ Yangi guruh qo'shish
            </button>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div className="spinner" />
              </div>
            ) : groups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>Guruhlar yo'q</p>
                <p style={{ fontSize: 13 }}>Birinchi guruhni qo'shing</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {groups.map(g => (
                  <GroupCard
                    key={g.id}
                    group={g}
                    onAssignLeader={() => setShowAssignLeader(g)}
                    onDelete={() => deleteGroup(g.id)}
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
          onSuccess={() => { setShowAddGroup(false); fetchGroups(); }}
        />
      )}

      {showAssignLeader && (
        <AssignLeaderModal
          group={showAssignLeader}
          onClose={() => setShowAssignLeader(null)}
          onSuccess={() => { setShowAssignLeader(null); fetchGroups(); }}
        />
      )}
    </div>
  );
}

// Group Card
function GroupCard({ group, onAssignLeader, onDelete }: { group: Group; onAssignLeader: () => void; onDelete: () => void }) {
  return (
    <div className="card" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="avatar" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' }}>
            {group.name.charAt(0)}
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>{group.name}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{group.code}</p>
          </div>
        </div>
        <span className={`badge ${group.is_active ? 'badge-green' : 'badge-red'}`}>
          {group.is_active ? 'Faol' : 'Nofaol'}
        </span>
      </div>

      {group.faculty && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>🏫 {group.faculty}</p>
      )}
      {group.academic_year && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>📅 {group.academic_year}</p>
      )}

      {/* Leader Info */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '10px 14px',
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {group.leader ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>👨‍🏫</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600 }}>{(group.leader as any).first_name} {(group.leader as any).last_name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Guruh rahbari</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>👤</span>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Rahbar biriktirilmagan</p>
          </div>
        )}
        <button className="btn btn-ghost btn-sm" onClick={onAssignLeader}>
          {group.leader ? '✏️ O\'zgartir' : '＋ Biriktir'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={onAssignLeader}>
          👥 Talabalar
        </button>
        <button className="btn btn-danger btn-sm" onClick={onDelete}>
          🗑️
        </button>
      </div>
    </div>
  );
}

// Stats View
function StatsView({ groups }: { groups: Group[] }) {
  const totalWithLeader = groups.filter(g => g.leader_id).length;
  const totalWithoutLeader = groups.filter(g => !g.leader_id).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>📊 Umumiy Ko'rsatkichlar</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Jami guruhlar', value: groups.length, color: 'var(--accent-blue-light)' },
            { label: 'Rahbar bilan', value: totalWithLeader, color: '#34d399' },
            { label: 'Rahbarsiz', value: totalWithoutLeader, color: '#f87171' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.label}</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>🏫 Guruhlar Ro'yxati</h3>
        {groups.map(g => (
          <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{g.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{g.code}</p>
            </div>
            <span className={`badge ${g.leader_id ? 'badge-green' : 'badge-yellow'}`}>
              {g.leader_id ? 'Rahbar bor' : 'Rahbarsiz'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add Group Modal
function AddGroupModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: '', code: '', faculty: '', academic_year: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code) { setErr('Nom va kod majburiy'); return; }
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>📚 Yangi Guruh</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Guruh nomi *</label>
            <input className="input" placeholder="Masalan: IT-23-01" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Guruh kodi *</label>
            <input className="input" placeholder="Masalan: IT2301" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Fakultet</label>
            <input className="input" placeholder="Masalan: Axborot texnologiyalari" value={form.faculty} onChange={e => setForm({ ...form, faculty: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">O'quv yili</label>
            <input className="input" placeholder="Masalan: 2023-2024" value={form.academic_year} onChange={e => setForm({ ...form, academic_year: e.target.value })} />
          </div>
          {err && <p style={{ color: 'var(--accent-red)', fontSize: 13 }}>⚠️ {err}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Bekor</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
              {saving ? '⏳ Saqlanmoqda...' : '✓ Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Assign Leader Modal
function AssignLeaderModal({ group, onClose, onSuccess }: { group: Group; onClose: () => void; onSuccess: () => void }) {
  const [telegramId, setTelegramId] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramId) { setErr('Telegram ID majburiy'); return; }
    setSaving(true);
    setErr('');
    try {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leader_telegram_id: telegramId, leader_name: leaderName }),
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

  const removeLeader = async () => {
    if (!confirm('Rahbarni o\'chirmoqchimisiz?')) return;
    setSaving(true);
    await fetch(`/api/groups/${group.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leader_telegram_id: null }),
    });
    onSuccess();
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>👨‍🏫 Rahbar Biriktirish</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div className="card" style={{ marginBottom: 16, background: 'rgba(59,130,246,0.08)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Guruh</p>
          <p style={{ fontWeight: 700, fontSize: 16 }}>{group.name}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{group.code}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Rahbarning Telegram ID *</label>
            <input
              className="input"
              placeholder="Masalan: 123456789"
              type="number"
              value={telegramId}
              onChange={e => setTelegramId(e.target.value)}
            />
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              💡 Rahbar @userinfobot ga /start yuborsа, ID ni oladi
            </p>
          </div>
          <div className="form-group">
            <label className="form-label">Rahbar ismi (ixtiyoriy)</label>
            <input
              className="input"
              placeholder="Masalan: Alisher Toshmatov"
              value={leaderName}
              onChange={e => setLeaderName(e.target.value)}
            />
          </div>
          {err && <p style={{ color: 'var(--accent-red)', fontSize: 13 }}>⚠️ {err}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Bekor</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
              {saving ? '⏳...' : '✓ Biriktirish'}
            </button>
          </div>

          {group.leader_id && (
            <button type="button" className="btn btn-danger" onClick={removeLeader} disabled={saving}>
              🗑️ Rahbarni o'chirish
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
