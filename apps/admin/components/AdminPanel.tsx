'use client';

import { useState, useEffect } from 'react';
import { User, Group, Student } from '@/lib/types';

// ============================================================
// Helper: Export to Excel with gridlines
// ============================================================
function exportStudentsToExcel(students: any[], title: string = 'Talabalar_Ro_yxati') {
  let tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Talabalar</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #000000; padding: 6px 12px; font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
        th { background-color: #2563eb; color: #ffffff; font-weight: bold; text-align: center; }
        .text-center { text-align: center; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr>
            <th>T/R</th>
            <th>Guruhi</th>
            <th>Talabaning ismi va familiyasi</th>
          </tr>
        </thead>
        <tbody>
  `;

  students.forEach((s, i) => {
    const fullName =
      `${s.user?.last_name || ''} ${s.user?.first_name || ''}`.trim() ||
      `${s.user?.first_name || ''}`;
    const groupName = s.group?.name || s.group_name || 'Guruhsiz';
    tableHtml += `
      <tr>
        <td class="text-center">${i + 1}</td>
        <td class="text-center">${groupName}</td>
        <td>${fullName}</td>
      </tr>
    `;
  });

  tableHtml += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function AdminPanel({ user }: { user: User }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showGroupDetail, setShowGroupDetail] = useState<Group | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [tab, setTab] = useState<'groups' | 'accordion' | 'stats'>('groups');

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    setLoading(true);
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const deleteGroup = async (groupId: string) => {
    if (!confirm("Ushbu guruhni o'chirmoqchimisiz?")) return;
    try {
      await fetch(`/api/groups/${groupId}`, { method: 'DELETE' });
      fetchGroups();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="header" style={{ paddingBottom: 60 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="avatar"
              style={{ background: 'linear-gradient(135deg, #0088cc, #00b4ff)' }}
            >
              👑
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                SUPER ADMIN
              </p>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}>
                {user.first_name} {user.last_name}
              </h1>
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
            className={`tab ${tab === 'accordion' ? 'active' : ''}`}
            onClick={() => setTab('accordion')}
          >
            👥 Yig'ma Ro'yxat
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
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'accordion' && (
          <div className="animate-in">
            <AccordionStudentsView groups={groups} />
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
// Accordion Students View with Excel Export
// ============================================================
function AccordionStudentsView({ groups }: { groups: Group[] }) {
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(groups[0]?.id || null);
  const [groupStudents, setGroupStudents] = useState<Record<string, Student[]>>({});
  const [loadingGroup, setLoadingGroup] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (groups[0]?.id && !groupStudents[groups[0].id]) {
      loadGroupStudents(groups[0].id);
    }
  }, [groups]);

  async function loadGroupStudents(groupId: string) {
    setLoadingGroup((prev) => ({ ...prev, [groupId]: true }));
    try {
      const res = await fetch(`/api/students?group_id=${groupId}`);
      const data = await res.json();
      setGroupStudents((prev) => ({ ...prev, [groupId]: data.students || [] }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGroup((prev) => ({ ...prev, [groupId]: false }));
    }
  }

  const toggleGroup = (groupId: string) => {
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null);
      return;
    }
    setExpandedGroupId(groupId);
    if (!groupStudents[groupId]) {
      loadGroupStudents(groupId);
    }
  };

  const handleExportAll = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      exportStudentsToExcel(data.students || [], 'Barcha_Guruhlar_Talabalari');
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportGroup = async (group: Group) => {
    try {
      let students = groupStudents[group.id];
      if (!students) {
        const res = await fetch(`/api/students?group_id=${group.id}`);
        const data = await res.json();
        students = data.students || [];
      }
      const formatted = students.map((s) => ({ ...s, group_name: group.name }));
      exportStudentsToExcel(formatted, `Talabalar_${group.name}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.03)',
          padding: 16,
          borderRadius: 16,
          border: '1px solid var(--border)',
        }}
      >
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>👥 Yig'ma Ro'yxat</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Guruhlar bo'yicha talabalar yig'ma jadvali
          </p>
        </div>
        <button
          className="btn btn-success btn-sm"
          style={{ boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
          onClick={handleExportAll}
        >
          📥 Excelga yuklash (Barchasi)
        </button>
      </div>

      {groups.map((group) => {
        const isExpanded = expandedGroupId === group.id;
        const students = groupStudents[group.id] || [];
        const isLoading = loadingGroup[group.id];

        const leaderName = group.leader
          ? `${group.leader.first_name} ${group.leader.last_name}`.trim()
          : 'Tayinlanmagan';

        return (
          <div
            key={group.id}
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              border: isExpanded ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
              transition: 'all 0.2s',
            }}
          >
            {/* Header Accordion Bar */}
            <div
              onClick={() => toggleGroup(group.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                cursor: 'pointer',
                background: isExpanded ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 24 }}>{isExpanded ? '📂' : '📁'}</span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                    {group.name}{' '}
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>({group.code})</span>
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    👨‍🏫 Rahbar: <b>{leaderName}</b>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--accent-blue)',
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: '4px 10px',
                    borderRadius: 20,
                  }}
                >
                  {isExpanded ? '▲ Yopish' : '▼ Ochish'}
                </span>
              </div>
            </div>

            {/* Collapsible Content Body */}
            {isExpanded && (
              <div
                style={{ padding: 16, borderTop: '1px solid var(--border)', background: '#0f172a' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                    👥 Talabalar ro'yxati ({students.length} nafar)
                  </p>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: '#34d399', fontSize: 12, fontWeight: 600 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportGroup(group);
                    }}
                  >
                    📊 Excelga yuklash (Shu guruh)
                  </button>
                </div>

                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </div>
                ) : students.length === 0 ? (
                  <p
                    style={{
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: 13,
                      padding: 20,
                    }}
                  >
                    Ushbu guruhda hali talabalar yo'q.
                  </p>
                ) : (
                  <div
                    style={{
                      overflowX: 'auto',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                    }}
                  >
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.06)', textAlign: 'left' }}>
                          <th
                            style={{
                              padding: '10px 14px',
                              width: 60,
                              borderBottom: '1px solid var(--border)',
                            }}
                          >
                            T/R
                          </th>
                          <th
                            style={{
                              padding: '10px 14px',
                              borderBottom: '1px solid var(--border)',
                            }}
                          >
                            Guruhi
                          </th>
                          <th
                            style={{
                              padding: '10px 14px',
                              borderBottom: '1px solid var(--border)',
                            }}
                          >
                            Talabaning Familiyasi, Ismi va Sharifi (F.I.Sh)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s, idx) => (
                          <tr
                            key={s.id}
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                          >
                            <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                              {idx + 1}
                            </td>
                            <td style={{ padding: '10px 14px', color: '#60a5fa', fontWeight: 600 }}>
                              {group.name}
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                              {s.user?.first_name} {s.user?.last_name}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
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
}: {
  group: Group;
  copiedCode: string | null;
  onCopy: (code: string) => void;
  onViewDetail: () => void;
  onDelete: () => void;
}) {
  const leaderName = group.leader
    ? `${group.leader.first_name} ${group.leader.last_name}`.trim()
    : null;

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
      <div
        style={{
          background: leaderName ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
          border: leaderName ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(245,158,11,0.2)',
          borderRadius: 10,
          padding: '10px 14px',
          marginBottom: 12,
        }}
      >
        <p style={{ fontSize: 11, color: leaderName ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
          GURUH RAHBARI:
        </p>
        <p style={{ fontSize: 14, fontWeight: 700, marginTop: 2, color: '#fff' }}>
          {leaderName || 'Rahbar tayinlanmagan'}
        </p>
      </div>

      {/* Login Code Box */}
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>LOGIN KOD</p>
          <code style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24', letterSpacing: 2 }}>
            {group.login_code || '------'}
          </code>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          style={{
            color: copiedCode === group.login_code ? '#34d399' : 'var(--accent-blue-light)',
          }}
          onClick={() => onCopy(group.login_code)}
        >
          {copiedCode === group.login_code ? '✓ Nusxalandi' : '📋 Nusxala'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={onViewDetail}>
          👥 Boshqarish
        </button>
        <button
          className="btn btn-danger btn-sm"
          style={{ padding: '6px 12px' }}
          onClick={onDelete}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Group Detail Modal with Leader Name Editing
// ============================================================
function GroupDetailModal({
  group,
  copiedCode,
  onCopy,
  onClose,
  onRefresh,
}: {
  group: Group;
  copiedCode: string | null;
  onCopy: (code: string) => void;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [leaderNameInput, setLeaderNameInput] = useState(
    group.leader ? `${group.leader.first_name} ${group.leader.last_name}`.trim() : '',
  );
  const [updatingLeader, setUpdatingLeader] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [group.id]);

  async function fetchStudents() {
    setLoading(true);
    try {
      const res = await fetch(`/api/students?group_id=${group.id}`);
      const data = await res.json();
      setStudents(data.students || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const regenerateCode = async () => {
    if (!confirm("Login kodni yangilamoqchimisiz? Eski kod o'z kuchini yo'qotadi.")) return;
    setRegenerating(true);
    try {
      await fetch(`/api/groups/${group.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerate_code: true }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
    setRegenerating(false);
  };

  const handleSaveLeaderName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderNameInput.trim()) return;
    setUpdatingLeader(true);
    try {
      await fetch(`/api/groups/${group.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leader_name: leaderNameInput.trim() }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingLeader(false);
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>{group.name}</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{group.code}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Login Code Card */}
        <div
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6,
            }}
          >
            <p style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700 }}>
              🔑 Rahbar uchun Login Kodi
            </p>
            <button
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 11, color: 'var(--accent-red)' }}
              onClick={regenerateCode}
              disabled={regenerating}
            >
              🔄 Qayta yaratish
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <code
              style={{ fontSize: 26, fontWeight: 900, letterSpacing: 4, color: '#fbbf24', flex: 1 }}
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
              }}
              onClick={() => onCopy(group.login_code)}
            >
              {copiedCode === group.login_code ? '✓ Nusxalandi' : '📋 Nusxala'}
            </button>
          </div>
        </div>

        {/* Group Leader Name Input / Edit */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <label className="form-label" style={{ marginBottom: 6 }}>
            👨‍🏫 Guruh Rahbari (Ism va Familiyasi)
          </label>
          <form onSubmit={handleSaveLeaderName} style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder="Masalan: Sardor Aliyev"
              value={leaderNameInput}
              onChange={(e) => setLeaderNameInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={updatingLeader}>
              {updatingLeader ? '⏳' : '✓ Saqlash'}
            </button>
          </form>
        </div>

        {/* Students List */}
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
              ＋ Talaba Qo'shish
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
                  </div>
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
              ))}
            </div>
          )}
        </div>

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
// Add Group Modal with Leader Name Field
// ============================================================
function AddGroupModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: '',
    code: '',
    faculty: '',
    academic_year: '',
    leader_name: '',
  });
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Guruh nomi *</label>
            <input
              className="input"
              placeholder="Masalan: 26-20"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Guruh kodi *</label>
            <input
              className="input"
              placeholder="Masalan: 2620"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">👨‍🏫 Guruh Rahbarining Ism va Familiyasi</label>
            <input
              className="input"
              placeholder="Masalan: Sardor Aliyev"
              value={form.leader_name}
              onChange={(e) => setForm({ ...form, leader_name: e.target.value })}
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
// Stats View
// ============================================================
function StatsView({ groups }: { groups: Group[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>📊 Tizim Statistikasi</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Barcha guruhlar</span>
            <span style={{ fontWeight: 700 }}>{groups.length} ta</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Biriktirilgan rahbarlar</span>
            <span style={{ fontWeight: 700, color: '#34d399' }}>
              {groups.filter((g) => g.leader_id).length} nafar
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Kutilayotgan guruhlar</span>
            <span style={{ fontWeight: 700, color: '#a78bfa' }}>
              {groups.filter((g) => !g.leader_id).length} ta
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
