'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { User, Group, Student } from '@/lib/types';
import {
  ShieldCheck,
  LogOut,
  BookOpen,
  Users,
  History,
  BarChart3,
  Plus,
  Folder,
  FolderOpen,
  FileSpreadsheet,
  Download,
  UserCheck,
  Bookmark,
  Copy,
  Check,
  Sliders,
  Trash2,
  Edit3,
  Key,
  RefreshCw,
  ArrowRightLeft,
  GraduationCap,
  Ban,
  TrendingUp,
  Loader2,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  UserPlus,
  ListPlus,
  User as UserIcon,
  Calendar,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
  PieChart,
  Hash,
} from 'lucide-react';

// ============================================================
// Helper: Format Date to exact Excel format DD.MM.YYYY HH:mm (e.g. 04.08.2026 13:14)
// ============================================================
function formatDateExcel(timeVal: string | Date | undefined | null) {
  if (!timeVal) return '—';
  const d = new Date(timeVal);
  if (isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// ============================================================
// Helper: Export to native Excel (.xlsx) format with Gridlines & Permanent Student ID
// ============================================================
function exportStudentsToExcel(students: any[], title: string = 'Talabalar_Ro_yxati') {
  const data = students.map((s, i) => {
    const timeVal = s.joined_at || s.created_at || s.user?.created_at;
    const studentId = s.student_card_number || `STU-${(s.id || '').slice(0, 8).toUpperCase()}`;
    return {
      'T/R': i + 1,
      'Talaba ID': studentId,
      Guruhi: s.group?.name || s.group_name || 'Guruhsiz',
      'Talabaning Familiyasi, Ismi va Sharifi':
        `${s.user?.last_name || ''} ${s.user?.first_name || ''}`.trim() ||
        `${s.user?.first_name || ''}`,
      "Qo'shilgan sana va vaqt": formatDateExcel(timeVal),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 18 },
    { wch: 22 },
    { wch: 45 },
    { wch: 22 },
  ];
  // Force Excel to render gridlines for all cells when opened
  worksheet['!views'] = [{ showGridLines: true }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Talabalar');
  XLSX.writeFile(workbook, `${title}.xlsx`);
}

function exportLogsToExcel(events: any[], title: string = 'Tarix_Log') {
  const data = events.map((e, i) => ({
    'T/R': i + 1,
    Vaqti: formatDateExcel(e.timestamp),
    'Amal Turi': e.typeLabel || 'O\'zgarish',
    'Talabaning Familiyasi, Ismi va Sharifi': e.student_name,
    Tafsilot: e.details,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 22 },
    { wch: 24 },
    { wch: 45 },
    { wch: 45 },
  ];
  // Force Excel to render gridlines for all cells when opened
  worksheet['!views'] = [{ showGridLines: true }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tarix_Log');
  XLSX.writeFile(workbook, `${title}.xlsx`);
}

export default function AdminPanel({ user }: { user: User }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showGroupDetail, setShowGroupDetail] = useState<Group | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [tab, setTab] = useState<'groups' | 'accordion' | 'history' | 'stats'>('groups');

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

  const handleGroupUpdatedSilently = (updatedGroup: Group) => {
    setGroups((prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)));
    if (showGroupDetail && showGroupDetail.id === updatedGroup.id) {
      setShowGroupDetail(updatedGroup);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const deleteGroup = async (groupId: string) => {
    if (!confirm("Ushbu guruhni o'chirmoqchimisiz?")) return;
    try {
      await fetch(`/api/groups/${groupId}`, { method: 'DELETE' });
      setShowGroupDetail(null);
      fetchGroups();
    } catch (e) {
      console.error(e);
    }
  };

  const academicGroups = groups.filter((g) => g.code !== 'AKADEMIK' && g.code !== 'CHIQARILGAN');
  const statusGroups = groups.filter((g) => g.code === 'AKADEMIK' || g.code === 'CHIQARILGAN');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="header" style={{ paddingBottom: 60 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="avatar"
              style={{
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                SUPER ADMIN
              </p>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>
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
              padding: '8px 14px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
            onClick={() => {
              if (confirm('Hisobdan chiqmoqchimisiz?')) {
                localStorage.removeItem('smp_user');
                window.location.reload();
              }
            }}
          >
            <LogOut size={16} /> Chiqish
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ padding: '0 16px', marginTop: -40, position: 'relative', zIndex: 1 }}>
        <div className="grid-3">
          <div className="stat-card">
            <span className="stat-value" style={{ color: 'var(--accent-blue-light)' }}>
              {academicGroups.length}
            </span>
            <span className="stat-label">O'quv Guruhlari</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ color: '#34d399' }}>
              {academicGroups.filter((g) => g.leader_id).length}
            </span>
            <span className="stat-label">Biriktirilgan Rahbarlar</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ color: '#fbbf24' }}>
              {statusGroups.length}
            </span>
            <span className="stat-label">Maxsus Statuslar</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ padding: '16px 16px 0' }}>
        <div className="tabs">
          <button
            className={`tab ${tab === 'groups' ? 'active' : ''}`}
            onClick={() => setTab('groups')}
          >
            <BookOpen size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} /> Guruhlar
          </button>
          <button
            className={`tab ${tab === 'accordion' ? 'active' : ''}`}
            onClick={() => setTab('accordion')}
          >
            <Users size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} /> Yig'ma Ro'yxat
          </button>
          <button
            className={`tab ${tab === 'history' ? 'active' : ''}`}
            onClick={() => setTab('history')}
          >
            <History size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} /> Tarix va Log
          </button>
          <button
            className={`tab ${tab === 'stats' ? 'active' : ''}`}
            onClick={() => setTab('stats')}
          >
            <BarChart3 size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} /> Statistika
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '16px 16px 80px' }}>
        {tab === 'groups' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Top Action Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                background: 'rgba(255,255,255,0.03)',
                padding: 16,
                borderRadius: 16,
                border: '1px solid var(--border)',
              }}
            >
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers size={22} style={{ color: '#38bdf8' }} /> Guruhlar Boshqaruvi
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  O'quv guruhlarini yaratish, rahbar tayinlash va statuslarni nazorat qilish
                </p>
              </div>

              <button
                className="btn btn-primary"
                style={{ padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                onClick={() => setShowAddGroup(true)}
              >
                <Plus size={18} /> Yangi guruh qo'shish
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <Loader2 className="spinner-icon" size={40} style={{ color: '#38bdf8' }} />
              </div>
            ) : (
              <>
                {/* 1. Academic Groups Section */}
                <div>
                  <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOpen size={18} style={{ color: '#38bdf8' }} />
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                      O'quv Guruhlari ({academicGroups.length} ta)
                    </h3>
                  </div>

                  {academicGroups.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: 'var(--text-muted)',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: 14,
                        border: '1px dashed var(--border)',
                      }}
                    >
                      <Folder size={40} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                      <p style={{ fontWeight: 600 }}>O'quv guruhlari yo'q</p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 14,
                      }}
                    >
                      {academicGroups.map((g) => (
                        <GroupCard
                          key={g.id}
                          group={g}
                          onViewDetail={() => setShowGroupDetail(g)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Special Status Groups Section */}
                {statusGroups.length > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                    <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Bookmark size={18} style={{ color: '#fbbf24' }} />
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                          Maxsus Status Guruhlari (Akademik & Safdan Chiqqanlar)
                        </h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          Boshqa guruhlardan o'tkazilgan talabalar jamlanmasi (Rahbar talab qilinmaydi)
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 14,
                      }}
                    >
                      {statusGroups.map((g) => (
                        <GroupCard
                          key={g.id}
                          group={g}
                          onViewDetail={() => setShowGroupDetail(g)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === 'accordion' && (
          <div className="animate-in">
            <AccordionStudentsView groups={groups} onGroupUpdated={fetchGroups} />
          </div>
        )}

        {tab === 'history' && (
          <div className="animate-in">
            <HistoryView groups={groups} />
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
          allGroups={groups}
          copiedCode={copiedCode}
          onCopy={copyCode}
          onClose={() => setShowGroupDetail(null)}
          onDeleteGroup={deleteGroup}
          onGroupUpdatedSilently={handleGroupUpdatedSilently}
        />
      )}
    </div>
  );
}

// ============================================================
// History & Activity Log View Component
// ============================================================
function HistoryView({ groups }: { groups: Group[] }) {
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAllStudents();
  }, []);

  async function fetchAllStudents() {
    setLoading(true);
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setAllStudents(data.students || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const dayEvents: any[] = [];
  allStudents.forEach((s) => {
    const fullName =
      `${s.user?.last_name || ''} ${s.user?.first_name || ''}`.trim() ||
      `${s.user?.first_name || ''}`;

    const studentCreatedAt = s.joined_at || s.created_at || s.user?.created_at;

    if (studentCreatedAt && studentCreatedAt.startsWith(selectedDate)) {
      dayEvents.push({
        id: `add_${s.id}`,
        type: 'ADD',
        typeLabel: "Yangi talaba qo'shildi",
        student_name: fullName,
        group_name: s.group?.name || 'Guruhsiz',
        details: `Guruhga qo'shildi: ${s.group?.name || 'Guruhsiz'}`,
        timestamp: studentCreatedAt,
        timeStr: formatDateExcel(studentCreatedAt),
      });
    }

    try {
      if (s.user?.photo_url) {
        if (s.user.photo_url.startsWith('[')) {
          const logs = JSON.parse(s.user.photo_url);
          logs.forEach((log: any) => {
            if (log.timestamp && log.timestamp.startsWith(selectedDate)) {
              dayEvents.push({
                id: log.id || `tr_${Math.random()}`,
                type: 'TRANSFER',
                typeLabel: "Guruhga ko'chirildi",
                student_name: fullName,
                from_group_name: log.from_group_name,
                to_group_name: log.to_group_name,
                to_group_code: log.to_group_code,
                details: `${log.from_group_name} ➔ ${log.to_group_name}`,
                timestamp: log.timestamp,
                timeStr: formatDateExcel(log.timestamp),
              });
            }
          });
        } else if (s.user.photo_url.startsWith('LOG:TRANSFER:')) {
          const parts = s.user.photo_url.replace('LOG:TRANSFER:', '').split('->');
          const userUpdatedAt = s.user.updated_at || studentCreatedAt;
          if (userUpdatedAt && userUpdatedAt.startsWith(selectedDate)) {
            dayEvents.push({
              id: `legacy_${s.id}`,
              type: 'TRANSFER',
              typeLabel: "Guruhga ko'chirildi",
              student_name: fullName,
              from_group_name: parts[0] || 'Eski guruh',
              to_group_name: parts[1] || 'Yangi guruh',
              details: `${parts[0] || ''} ➔ ${parts[1] || ''}`,
              timestamp: userUpdatedAt,
              timeStr: formatDateExcel(userUpdatedAt),
            });
          }
        }
      }
    } catch (e) {}
  });

  dayEvents.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const monthlyStats: Record<string, { count: number; students: any[] }> = {};
  allStudents.forEach((s) => {
    const studentCreatedAt = s.joined_at || s.created_at || s.user?.created_at;
    if (studentCreatedAt) {
      const d = new Date(studentCreatedAt);
      const monthKey = d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' });
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { count: 0, students: [] };
      }
      monthlyStats[monthKey].count += 1;
      monthlyStats[monthKey].students.push(s);
    }
  });

  const handleExportSelectedDate = () => {
    exportLogsToExcel(dayEvents, `Tarix_Log_${selectedDate}`);
  };

  const handleExportMonth = (monthName: string, monthData: any[]) => {
    exportStudentsToExcel(monthData, `Talabalar_${monthName.replace(/\s+/g, '_')}`);
  };

  const renderEventTypeBadge = (event: any) => {
    if (event.type === 'ADD') {
      return (
        <span
          className="badge badge-green"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <Plus size={12} /> Yangi qo'shildi
        </span>
      );
    }
    if (event.to_group_code === 'AKADEMIK' || event.to_group_name?.includes('Akademik')) {
      return (
        <span
          className="badge badge-yellow"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <GraduationCap size={12} /> Akademik ta'til
        </span>
      );
    }
    if (event.to_group_code === 'CHIQARILGAN' || event.to_group_name?.includes('chiqarilganlar')) {
      return (
        <span
          className="badge badge-red"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
          }}
        >
          <Ban size={12} /> Safdan chiqarildi
        </span>
      );
    }
    return (
      <span
        className="badge badge-blue"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
      >
        <ArrowRightLeft size={12} /> Guruhga ko'chirildi
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          background: 'rgba(255,255,255,0.03)',
          padding: 16,
          borderRadius: 16,
          border: '1px solid var(--border)',
        }}
      >
        <div>
          <h2
            style={{ fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <History size={20} style={{ color: '#38bdf8' }} /> O'zgarishlar Tarixi va Log
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Sana bo'yicha talabalar qo'shilishi, ko'chirilishi va oylik statistika
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Calendar size={16} /> Sanani tanlang:
          </label>
          <input
            type="date"
            className="input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '6px 12px', fontSize: 13, backgroundColor: '#1e293b', color: '#fff' }}
          />
        </div>
      </div>

      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Clock size={18} style={{ color: '#fbbf24' }} /> {selectedDate} sanasidagi o'zgarishlar ({dayEvents.length} ta)
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Ushbu kunda qo'shilgan va boshqa guruhlarga/statuslarga ko'chirilgan talabalar logi
            </p>
          </div>
          {dayEvents.length > 0 && (
            <button
              className="btn btn-success btn-sm"
              onClick={handleExportSelectedDate}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <FileSpreadsheet size={15} /> Excel (.xlsx) log yuklab olish
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Loader2
              className="spinner-icon"
              size={32}
              style={{ margin: '0 auto', color: '#38bdf8' }}
            />
          </div>
        ) : dayEvents.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '30px 16px',
              color: 'var(--text-muted)',
              fontSize: 13,
            }}
          >
            {selectedDate} sanasida hech qanday talaba qo'shilmagan va ko'chirilmagan.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.06)', textAlign: 'left' }}>
                  <th
                    style={{
                      padding: '10px 14px',
                      width: 50,
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    T/R
                  </th>
                  <th
                    style={{
                      padding: '10px 14px',
                      width: 140,
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    Vaqti
                  </th>
                  <th
                    style={{
                      padding: '10px 14px',
                      width: 170,
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    Amal Turi
                  </th>
                  <th
                    style={{
                      padding: '10px 14px',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    Talabaning Familiyasi, Ismi va Sharifi (F.I.Sh)
                  </th>
                  <th
                    style={{
                      padding: '10px 14px',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    O'zgarish / Harakat Tafsiloti
                  </th>
                </tr>
              </thead>
              <tbody>
                {dayEvents.map((ev, idx) => (
                  <tr key={ev.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#fbbf24', fontWeight: 700, fontFamily: 'monospace' }}>
                      {ev.timeStr}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {renderEventTypeBadge(ev)}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>
                      {ev.student_name}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#38bdf8', fontWeight: 600 }}>
                      {ev.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <TrendingUp size={20} style={{ color: '#34d399' }} /> Oylar bo'yicha talabalar kelishi
        </h3>
        {Object.keys(monthlyStats).length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Ma'lumot yo'q</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(monthlyStats).map(([month, item]) => (
              <div
                key={month}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                }}
              >
                <div>
                  <h4
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Calendar size={16} /> {month}
                  </h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Jami qo'shilgan talabalar: <b style={{ color: '#34d399' }}>{item.count} nafar</b>
                  </p>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{
                    color: '#34d399',
                    fontWeight: 600,
                    fontSize: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  onClick={() => handleExportMonth(month, item.students)}
                >
                  <FileSpreadsheet size={14} /> Excel (.xlsx) yuklash
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Accordion Students View (Summary list with Student ID Column)
// ============================================================
function AccordionStudentsView({ groups, onGroupUpdated }: { groups: Group[]; onGroupUpdated: () => void }) {
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(groups[0]?.id || null);
  const [groupStudents, setGroupStudents] = useState<Record<string, Student[]>>({});
  const [loadingGroup, setLoadingGroup] = useState<Record<string, boolean>>({});
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

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
          <h2
            style={{ fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Users size={20} style={{ color: '#38bdf8' }} /> Yig'ma Ro'yxat (Talaba ID bilan)
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Guruhlar bo'yicha talabalar yig'ma jadvali va unikal ID kodlari
          </p>
        </div>
        <button
          className="btn btn-success btn-sm"
          style={{
            boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
          onClick={handleExportAll}
        >
          <Download size={15} /> Excel (.xlsx) yuklash (Barchasi)
        </button>
      </div>

      {groups.map((group) => {
        const isExpanded = expandedGroupId === group.id;
        const students = groupStudents[group.id] || [];
        const isLoading = loadingGroup[group.id];

        const isStatusGroup = group.code === 'AKADEMIK' || group.code === 'CHIQARILGAN';
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
                <span style={{ color: isExpanded ? '#38bdf8' : 'var(--text-muted)' }}>
                  {isExpanded ? <FolderOpen size={24} /> : <Folder size={24} />}
                </span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                    {group.name}{' '}
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>({group.code})</span>
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {isStatusGroup ? (
                      <span
                        style={{
                          color: '#38bdf8',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Bookmark size={14} /> Maxsus status guruhi
                      </span>
                    ) : (
                      <span>
                        Rahbar: <b>{leaderName}</b>
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--accent-blue)',
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: '6px 12px',
                    borderRadius: 20,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {isExpanded ? (
                    <>
                      Yopish <ChevronUp size={14} />
                    </>
                  ) : (
                    <>
                      Ochish <ChevronDown size={14} />
                    </>
                  )}
                </span>
              </div>
            </div>

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
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Users size={16} /> Talabalar ro'yxati ({students.length} nafar)
                  </p>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{
                      color: '#34d399',
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportGroup(group);
                    }}
                  >
                    <FileSpreadsheet size={14} /> Excel (.xlsx) yuklash (Shu guruh)
                  </button>
                </div>

                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <Loader2
                      className="spinner-icon"
                      size={28}
                      style={{ margin: '0 auto', color: '#38bdf8' }}
                    />
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
                              width: 50,
                              borderBottom: '1px solid var(--border)',
                            }}
                          >
                            T/R
                          </th>
                          <th
                            style={{
                              padding: '10px 14px',
                              width: 140,
                              borderBottom: '1px solid var(--border)',
                            }}
                          >
                            Talaba ID
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
                          <th
                            style={{
                              padding: '10px 14px',
                              textAlign: 'right',
                              borderBottom: '1px solid var(--border)',
                            }}
                          >
                            Amal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s, idx) => {
                          const studentId =
                            s.student_card_number || `STU-${(s.id || '').slice(0, 8).toUpperCase()}`;

                          return (
                            <tr
                              key={s.id}
                              style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                            >
                              <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                                {idx + 1}
                              </td>
                              <td style={{ padding: '10px 14px' }}>
                                <span
                                  style={{
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    color: '#38bdf8',
                                    background: 'rgba(56, 189, 248, 0.12)',
                                    padding: '3px 8px',
                                    borderRadius: 6,
                                    fontSize: 12,
                                  }}
                                >
                                  {studentId}
                                </span>
                              </td>
                              <td style={{ padding: '10px 14px', color: '#60a5fa', fontWeight: 600 }}>
                                {group.name}
                              </td>
                              <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                                {`${s.user?.last_name || ''} ${s.user?.first_name || ''}`.trim() ||
                                  `${s.user?.first_name || ''}`}
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  style={{
                                    color: '#fbbf24',
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid rgba(245, 158, 11, 0.2)',
                                    padding: '4px 8px',
                                    borderRadius: 6,
                                  }}
                                  onClick={() => setEditingStudent(s)}
                                  title="Tahrirlash"
                                >
                                  <Edit3 size={14} />
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
            )}
          </div>
        );
      })}

      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSuccess={() => {
            setEditingStudent(null);
            if (expandedGroupId) loadGroupStudents(expandedGroupId);
            onGroupUpdated();
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// Group Card Component
// ============================================================
function GroupCard({
  group,
  onViewDetail,
}: {
  group: Group;
  onViewDetail: () => void;
}) {
  const isStatusGroup = group.code === 'AKADEMIK' || group.code === 'CHIQARILGAN';
  const leaderName = group.leader
    ? `${group.leader.first_name} ${group.leader.last_name}`.trim()
    : null;

  const renderGroupIcon = () => {
    if (group.code === 'AKADEMIK') return <GraduationCap size={22} />;
    if (group.code === 'CHIQARILGAN') return <Ban size={22} />;
    return <BookOpen size={22} />;
  };

  return (
    <div
      className="card"
      onClick={onViewDetail}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-blue)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: isStatusGroup ? 14 : 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="avatar"
              style={{
                background: isStatusGroup
                  ? group.code === 'AKADEMIK'
                    ? 'linear-gradient(135deg, #0284c7, #38bdf8)'
                    : 'linear-gradient(135deg, #e11d48, #fb7185)'
                  : 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              {renderGroupIcon()}
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 16 }}>{group.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{group.code}</p>
            </div>
          </div>
          {isStatusGroup ? (
            <span
              className="badge badge-blue"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <Bookmark size={12} /> Maxsus status
            </span>
          ) : (
            <span className={`badge ${group.leader_id ? 'badge-green' : 'badge-yellow'}`}>
              {group.leader_id ? '✓ Rahbar bor' : '⏳ Kutilmoqda'}
            </span>
          )}
        </div>

        {!isStatusGroup && (
          <div
            style={{
              background: leaderName ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
              border: leaderName
                ? '1px solid rgba(16,185,129,0.2)'
                : '1px solid rgba(245,158,11,0.2)',
              borderRadius: 10,
              padding: '10px 14px',
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: leaderName ? '#34d399' : '#fbbf24',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <UserCheck size={13} /> GURUH RAHBARI:
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, marginTop: 2, color: '#fff' }}>
              {leaderName || 'Rahbar tayinlanmagan'}
            </p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#38bdf8', fontWeight: 600 }}>Boshqarish ➔</span>
      </div>
    </div>
  );
}

// ============================================================
// Group Detail Modal
// ============================================================
function GroupDetailModal({
  group: initialGroup,
  allGroups,
  copiedCode,
  onCopy,
  onClose,
  onDeleteGroup,
  onGroupUpdatedSilently,
}: {
  group: Group;
  allGroups: Group[];
  copiedCode: string | null;
  onCopy: (code: string) => void;
  onClose: () => void;
  onDeleteGroup: (groupId: string) => void;
  onGroupUpdatedSilently: (updatedGroup: Group) => void;
}) {
  const [currentGroup, setCurrentGroup] = useState<Group>(initialGroup);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [transferringStudent, setTransferringStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const [groupNameInput, setGroupNameInput] = useState(initialGroup.name);
  const [updatingGroupName, setUpdatingGroupName] = useState(false);
  const [leaderNameInput, setLeaderNameInput] = useState(
    initialGroup.leader ? `${initialGroup.leader.first_name} ${initialGroup.leader.last_name}`.trim() : '',
  );
  const [updatingLeader, setUpdatingLeader] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const isStatusGroup = currentGroup.code === 'AKADEMIK' || currentGroup.code === 'CHIQARILGAN';

  useEffect(() => {
    setCurrentGroup(initialGroup);
    setGroupNameInput(initialGroup.name);
    setLeaderNameInput(
      initialGroup.leader ? `${initialGroup.leader.first_name} ${initialGroup.leader.last_name}`.trim() : '',
    );
  }, [initialGroup]);

  useEffect(() => {
    fetchStudents();
  }, [currentGroup.id]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  async function fetchStudents() {
    setLoading(true);
    try {
      const res = await fetch(`/api/students?group_id=${currentGroup.id}`);
      const data = await res.json();
      setStudents(data.students || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveGroupName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupNameInput.trim()) return;
    setUpdatingGroupName(true);
    try {
      const res = await fetch(`/api/groups/${currentGroup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupNameInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Guruh nomini o'zgartirishda xatolik");

      if (data.group) {
        setCurrentGroup(data.group);
        onGroupUpdatedSilently(data.group);
        showToast("Guruh nomi jonli saqlandi!");
      }
    } catch (e: any) {
      alert(e.message || "Xatolik yuz berdi");
    } finally {
      setUpdatingGroupName(false);
    }
  };

  const handleSaveLeaderName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderNameInput.trim()) return;
    setUpdatingLeader(true);
    try {
      const res = await fetch(`/api/groups/${currentGroup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leader_name: leaderNameInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rahbar nomini o'zgartirishda xatolik");

      if (data.group) {
        setCurrentGroup(data.group);
        onGroupUpdatedSilently(data.group);
        showToast("Guruh rahbari jonli saqlandi!");
      }
    } catch (e: any) {
      alert(e.message || "Xatolik yuz berdi");
    } finally {
      setUpdatingLeader(false);
    }
  };

  const regenerateCode = async () => {
    if (!confirm("Login kodni yangilamoqchimisiz? Eski kod o'z kuchini yo'qotadi.")) return;
    setRegenerating(true);
    try {
      const res = await fetch(`/api/groups/${currentGroup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerate_code: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.group) {
        setCurrentGroup(data.group);
        onGroupUpdatedSilently(data.group);
        showToast("Login kod yangilandi!");
      }
    } catch (e: any) {
      alert(e.message || "Xatolik yuz berdi");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal"
        style={{ width: '92%', maxWidth: 860, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
      >
        {toastMsg && (
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              background: '#059669',
              color: '#ffffff',
              padding: '10px 16px',
              borderRadius: 10,
              marginBottom: 14,
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)',
            }}
          >
            <CheckCircle2 size={18} /> {toastMsg}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 12,
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <BookOpen size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>{currentGroup.name} Boshqaruvi</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Guruh kodi: {currentGroup.code}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!isStatusGroup && (
              <button
                className="btn btn-danger btn-sm"
                style={{ padding: '6px 12px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={() => onDeleteGroup(currentGroup.id)}
              >
                <Trash2 size={15} /> Guruhni O'chirish
              </button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 14,
            marginBottom: 20,
          }}
        >
          {/* Edit Group Name */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 16,
            }}
          >
            <label
              className="form-label"
              style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}
            >
              <Edit3 size={15} style={{ color: '#38bdf8' }} /> GURUH NOMI (TO'LIQ O'ZGARTIRISH)
            </label>
            <form onSubmit={handleSaveGroupName} style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                style={{ flex: 1, fontSize: 14, fontWeight: 600 }}
                value={groupNameInput}
                onChange={(e) => setGroupNameInput(e.target.value)}
                placeholder="Guruh nomi"
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={updatingGroupName}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10 }}
              >
                {updatingGroupName ? (
                  <Loader2 className="spinner-icon" size={14} />
                ) : (
                  <Check size={14} />
                )}{' '}
                Saqlash
              </button>
            </form>
          </div>

          {/* Edit Leader Name */}
          {!isStatusGroup && (
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: 16,
              }}
            >
              <label
                className="form-label"
                style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}
              >
                <UserCheck size={15} style={{ color: '#34d399' }} /> GURUH RAHBARI (F.I.SH)
              </label>
              <form onSubmit={handleSaveLeaderName} style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input"
                  style={{ flex: 1, fontSize: 14, fontWeight: 600 }}
                  placeholder="Masalan: Sardor Aliyev"
                  value={leaderNameInput}
                  onChange={(e) => setLeaderNameInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={updatingLeader}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10 }}
                >
                  {updatingLeader ? (
                    <Loader2 className="spinner-icon" size={14} />
                  ) : (
                    <Check size={14} />
                  )}{' '}
                  Saqlash
                </button>
              </form>
            </div>
          )}

          {/* Login Code Card */}
          {!isStatusGroup && (
            <div
              style={{
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 14,
                padding: 16,
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
                <p style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Key size={13} /> LOGIN KOD
                </p>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 11, color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  onClick={regenerateCode}
                  disabled={regenerating}
                >
                  <RefreshCw size={12} /> Yangilash
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <code
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    letterSpacing: 4,
                    color: '#fbbf24',
                    flex: 1,
                  }}
                >
                  {currentGroup.login_code || '------'}
                </code>
                <button
                  className="btn btn-sm"
                  style={{
                    background:
                      copiedCode === currentGroup.login_code
                        ? 'rgba(16,185,129,0.2)'
                        : 'rgba(245,158,11,0.2)',
                    color: copiedCode === currentGroup.login_code ? '#34d399' : '#fbbf24',
                    border: 'none',
                    fontSize: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 12px',
                    borderRadius: 8,
                  }}
                  onClick={() => onCopy(currentGroup.login_code)}
                >
                  {copiedCode === currentGroup.login_code ? (
                    <>
                      <Check size={14} /> Nusxalandi
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Nusxala
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Students Section */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} style={{ color: '#38bdf8' }} /> Guruh Talabalari ({students.length} nafar)
            </h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddStudent(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} /> Talaba Qo'shish
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 30 }}>
              <Loader2 className="spinner-icon" size={32} style={{ margin: '0 auto', color: '#38bdf8' }} />
            </div>
          ) : students.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '30px',
                color: 'var(--text-muted)',
                fontSize: 13,
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 12,
                border: '1px dashed var(--border)',
              }}
            >
              Ushbu guruhda hali talabalar yo'q. "Talaba Qo'shish" tugmasi orqali kiriting.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', width: 50, borderBottom: '1px solid var(--border)' }}>T/R</th>
                    <th style={{ padding: '12px 16px', width: 140, borderBottom: '1px solid var(--border)' }}>Talaba ID</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      Talabaning Familiyasi, Ismi va Sharifi (F.I.Sh)
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const studentId =
                      s.student_card_number || `STU-${(s.id || '').slice(0, 8).toUpperCase()}`;

                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: '#38bdf8',
                              background: 'rgba(56, 189, 248, 0.12)',
                              padding: '3px 8px',
                              borderRadius: 6,
                              fontSize: 12,
                            }}
                          >
                            {studentId}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                          {`${s.user?.last_name || ''} ${s.user?.first_name || ''}`.trim() || `${s.user?.first_name || ''}`}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{
                                color: '#fbbf24',
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                fontWeight: 600,
                                padding: '6px 10px',
                                borderRadius: 8,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                              onClick={() => setEditingStudent(s)}
                              title="Talabani tahrirlash"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{
                                color: '#38bdf8',
                                background: 'rgba(56, 189, 248, 0.1)',
                                border: '1px solid rgba(56, 189, 248, 0.2)',
                                fontWeight: 600,
                                padding: '6px 12px',
                                borderRadius: 8,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                              }}
                              onClick={() => setTransferringStudent(s)}
                            >
                              <ArrowRightLeft size={14} /> Ko'chirish
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modals */}
        {showAddStudent && (
          <AddStudentModal
            groupId={currentGroup.id}
            onClose={() => setShowAddStudent(false)}
            onSuccess={() => {
              setShowAddStudent(false);
              fetchStudents();
              showToast("Yangi talaba qo'shildi!");
            }}
          />
        )}

        {editingStudent && (
          <EditStudentModal
            student={editingStudent}
            onClose={() => setEditingStudent(null)}
            onSuccess={() => {
              setEditingStudent(null);
              fetchStudents();
              showToast("Talaba ma'lumotlari saqlandi!");
            }}
          />
        )}

        {transferringStudent && (
          <TransferStudentModal
            student={transferringStudent}
            allGroups={allGroups}
            currentGroupId={currentGroup.id}
            onClose={() => setTransferringStudent(null)}
            onSuccess={() => {
              setTransferringStudent(null);
              fetchStudents();
              showToast("Talaba yangi guruhga ko'chirildi!");
            }}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// Edit Student Modal Component
// ============================================================
function EditStudentModal({
  student,
  onClose,
  onSuccess,
}: {
  student: Student;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const currentFullName =
    `${student.user?.last_name || ''} ${student.user?.first_name || ''}`.trim() ||
    `${student.user?.first_name || ''}`;

  const [fullName, setFullName] = useState(currentFullName);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const studentId = student.student_card_number || `STU-${(student.id || '').slice(0, 8).toUpperCase()}`;

  const addedAt = student.joined_at || student.created_at || student.user?.created_at;
  const addedAtStr = formatDateExcel(addedAt);

  let transferLogs: any[] = [];
  try {
    if (student.user?.photo_url && student.user.photo_url.startsWith('[')) {
      transferLogs = JSON.parse(student.user.photo_url);
    }
  } catch (e) {}

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErr('F.I.Sh kiritilishi shart');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      const parts = fullName.trim().split(' ').filter(Boolean);
      const lastName = parts[0] || '';
      const firstName = parts.slice(1).join(' ') || lastName;

      const res = await fetch(`/api/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: parts.length > 1 ? lastName : '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Talaba ma\'lumotlarini saqlashda xatolik');
      onSuccess();
    } catch (e: any) {
      setErr(e.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <h2
            style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Edit3 size={20} style={{ color: '#38bdf8' }} /> Talaba Ma'lumotlarini Tahrirlash
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Info card with addition time & transfer history */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: 14,
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Hash size={16} style={{ color: '#38bdf8' }} />
            <span style={{ color: 'var(--text-muted)' }}>Talaba Doimiy ID:</span>
            <b style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: 14 }}>{studentId}</b>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Clock size={16} style={{ color: '#fbbf24' }} />
            <span style={{ color: 'var(--text-muted)' }}>Guruhga/Tizimga qo'shilgan vaqti:</span>
            <b style={{ color: '#fff', fontFamily: 'monospace' }}>{addedAtStr}</b>
          </div>

          <div style={{ fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <ArrowRightLeft size={16} style={{ color: '#38bdf8' }} />
              <span style={{ color: 'var(--text-muted)' }}>
                Ko'chirilish tarixi (Qaysi guruhlardan kelgan):
              </span>
            </div>
            {transferLogs.length === 0 ? (
              <p style={{ fontSize: 12, color: '#34d399', marginLeft: 24, fontWeight: 600 }}>
                ✓ Dastlabki qo'shilgan guruhidan beri ushbu guruhda
              </p>
            ) : (
              <div
                style={{
                  marginLeft: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  marginTop: 4,
                }}
              >
                {transferLogs.map((log: any, idx: number) => (
                  <div key={idx} style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600 }}>
                    • {log.from_group_name} ➔ {log.to_group_name} (
                    {formatDateExcel(log.timestamp)})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">
              Talabaning Familiyasi, Ismi va Sharifi (F.I.Sh) *
            </label>
            <input
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masalan: Axmadova Zarnigor Habibullo qizi"
              style={{ fontSize: 14, fontWeight: 600 }}
              autoFocus
            />
          </div>

          {err && (
            <p
              style={{
                color: 'var(--accent-red)',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <AlertTriangle size={16} /> {err}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              Bekor
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                flex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="spinner-icon" size={16} /> Saqlanmoqda...
                </>
              ) : (
                <>
                  <Check size={16} /> Saqlash
                </>
              )}
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
      if (!res.ok) throw new Error(data.error || "Talabani ko'chirishda xatolik");
      onSuccess();
    } catch (e: any) {
      setErr(e.message || "Xatolik yuz berdi");
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
          <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowRightLeft size={20} style={{ color: '#38bdf8' }} /> Talabani Ko'chirish
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
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
          <p style={{ fontSize: 13, color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <UserIcon size={16} /> <b>{fullName}</b>
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
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
                    <option
                      key={g.id}
                      value={g.id}
                      style={{ backgroundColor: '#1e293b', color: '#ffffff' }}
                    >
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
                    <option
                      key={g.id}
                      value={g.id}
                      style={{ backgroundColor: '#1e293b', color: '#ffffff' }}
                    >
                      {g.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {err && (
            <p style={{ color: 'var(--accent-red)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={16} /> {err}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              Bekor
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              disabled={saving || !selectedGroupId}
            >
              {saving ? (
                <>
                  <Loader2 className="spinner-icon" size={16} /> O'tkazilmoqda...
                </>
              ) : (
                <>
                  <Check size={16} /> O'tkazish
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Add Group Modal
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
          <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={20} style={{ color: '#38bdf8' }} /> Yangi Guruh
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
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
            <label className="form-label">Guruh Rahbarining Ism va Familiyasi</label>
            <input
              className="input"
              placeholder="Masalan: Sardor Aliyev"
              value={form.leader_name}
              onChange={(e) => setForm({ ...form, leader_name: e.target.value })}
            />
          </div>

          {err && (
            <p style={{ color: 'var(--accent-red)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={16} /> {err}
            </p>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              Bekor
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="spinner-icon" size={16} /> Saqlanmoqda...
                </>
              ) : (
                <>
                  <Check size={16} /> Yaratish
                </>
              )}
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
          <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={20} style={{ color: '#38bdf8' }} /> Talaba Qo'shish
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

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
            style={{ flex: 1, borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onClick={() => setMode('single')}
          >
            <UserIcon size={15} /> Bittalab
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'bulk' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onClick={() => setMode('bulk')}
          >
            <ListPlus size={15} /> Ro'yxat bo'yicha
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
                Har bir qatorga yangi talabaning Familiya va Ismini yozing.
              </p>
            </div>
          )}

          {err && (
            <p style={{ color: 'var(--accent-red)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={16} /> {err}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              Bekor
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="spinner-icon" size={16} /> Saqlanmoqda...
                </>
              ) : (
                <>
                  <Check size={16} /> Qo'shish
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Stats View (Redesigned with Collapsible Accordion Categories)
// ============================================================
function StatsView({ groups }: { groups: Group[] }) {
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAcademic, setOpenAcademic] = useState(true);
  const [openStatus, setOpenStatus] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setAllStudents(data.students || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const academicGroups = groups.filter((g) => g.code !== 'AKADEMIK' && g.code !== 'CHIQARILGAN');
  const statusGroups = groups.filter((g) => g.code === 'AKADEMIK' || g.code === 'CHIQARILGAN');

  const totalStudents = allStudents.length;

  const getGroupStudentCount = (groupId: string) => {
    return allStudents.filter((s) => s.group_id === groupId).length;
  };

  const academicStudentsCount = academicGroups.reduce(
    (sum, g) => sum + getGroupStudentCount(g.id),
    0,
  );
  const statusStudentsCount = statusGroups.reduce(
    (sum, g) => sum + getGroupStudentCount(g.id),
    0,
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          background: 'rgba(255,255,255,0.03)',
          padding: 16,
          borderRadius: 16,
          border: '1px solid var(--border)',
        }}
      >
        <div>
          <h2
            style={{ fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <BarChart3 size={22} style={{ color: '#38bdf8' }} /> To'liq Tizim Statistikasi
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Mavzular (o'quv va maxsus guruhlar) bo'yicha talabalar soni va yig'ma statistikasi
          </p>
        </div>

        <button
          className="btn btn-ghost btn-sm"
          onClick={fetchStudents}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#38bdf8' }}
        >
          <RefreshCw size={15} className={loading ? 'spinner-icon' : ''} /> Yangilash
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid-3">
        <div className="stat-card" style={{ borderLeft: '4px solid #38bdf8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-value" style={{ color: '#38bdf8' }}>
                {totalStudents}
              </span>
              <span className="stat-label">Jami Talabalar Soni</span>
            </div>
            <Users size={24} style={{ color: '#38bdf8', opacity: 0.6 }} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #34d399' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-value" style={{ color: '#34d399' }}>
                {academicStudentsCount}
              </span>
              <span className="stat-label">O'quv Guruhlarida</span>
            </div>
            <BookOpen size={24} style={{ color: '#34d399', opacity: 0.6 }} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #fbbf24' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-value" style={{ color: '#fbbf24' }}>
                {statusStudentsCount}
              </span>
              <span className="stat-label">Maxsus Statuslarda</span>
            </div>
            <GraduationCap size={24} style={{ color: '#fbbf24', opacity: 0.6 }} />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Loader2 className="spinner-icon" size={36} style={{ color: '#38bdf8', margin: '0 auto' }} />
        </div>
      ) : (
        <>
          {/* CATEGORY 1: O'quv Guruhlari (Accordion) */}
          <div
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              border: openAcademic ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
            }}
          >
            <div
              onClick={() => setOpenAcademic(!openAcademic)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                cursor: 'pointer',
                background: openAcademic ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(56, 189, 248, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                  }}
                >
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>
                    📚 O'quv Guruhlari Statistikasi ({academicGroups.length} ta guruh)
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Har bir o'quv guruhidagi talabalar soni va nisbiy ulushi
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.12)',
                    padding: '4px 12px',
                    borderRadius: 20,
                  }}
                >
                  {academicStudentsCount} nafar talaba
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {openAcademic ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
              </div>
            </div>

            {openAcademic && (
              <div style={{ padding: 20, borderTop: '1px solid var(--border)', background: '#0f172a' }}>
                {academicGroups.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                    O'quv guruhlari mavjud emas.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {academicGroups.map((g) => {
                      const count = getGroupStudentCount(g.id);
                      const percent =
                        totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
                      const leaderName = g.leader
                        ? `${g.leader.first_name} ${g.leader.last_name}`.trim()
                        : 'Rahbar tayinlanmagan';

                      return (
                        <div
                          key={g.id}
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '14px 16px',
                            borderRadius: 12,
                            border: '1px solid var(--border)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: 8,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>
                                {g.name}
                              </span>
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                ({g.code})
                              </span>
                              <span
                                style={{
                                  fontSize: 11,
                                  color: g.leader_id ? '#34d399' : '#fbbf24',
                                  background: g.leader_id
                                    ? 'rgba(16,185,129,0.1)'
                                    : 'rgba(245,158,11,0.1)',
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                  fontWeight: 600,
                                }}
                              >
                                {leaderName}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <b style={{ fontSize: 15, color: '#38bdf8' }}>{count} nafar talaba</b>
                              <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 45, textAlign: 'right' }}>
                                ({percent}%)
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div
                            style={{
                              width: '100%',
                              height: 8,
                              background: 'rgba(255,255,255,0.06)',
                              borderRadius: 4,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${percent}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                                borderRadius: 4,
                                transition: 'width 0.4s ease',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CATEGORY 2: Maxsus Status Guruhlari (Accordion) */}
          <div
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              border: openStatus ? '1px solid #fbbf24' : '1px solid var(--border)',
            }}
          >
            <div
              onClick={() => setOpenStatus(!openStatus)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                cursor: 'pointer',
                background: openStatus ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(245, 158, 11, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fbbf24',
                  }}
                >
                  <Bookmark size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>
                    🎓 Maxsus Status Guruhlari (Akademik & Safdan Chiqqanlar)
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    O'qishini to'xtatgan va vaqtincha akademik ta'til olgan talabalar soni
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#fbbf24',
                    background: 'rgba(245, 158, 11, 0.12)',
                    padding: '4px 12px',
                    borderRadius: 20,
                  }}
                >
                  {statusStudentsCount} nafar talaba
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {openStatus ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
              </div>
            </div>

            {openStatus && (
              <div style={{ padding: 20, borderTop: '1px solid var(--border)', background: '#0f172a' }}>
                {statusGroups.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                    Maxsus status guruhlari mavjud emas.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {statusGroups.map((g) => {
                      const count = getGroupStudentCount(g.id);
                      const percent =
                        totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
                      const isAkademik = g.code === 'AKADEMIK';

                      return (
                        <div
                          key={g.id}
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '14px 16px',
                            borderRadius: 12,
                            border: '1px solid var(--border)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: 8,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {isAkademik ? (
                                <GraduationCap size={18} style={{ color: '#fbbf24' }} />
                              ) : (
                                <Ban size={18} style={{ color: '#ef4444' }} />
                              )}
                              <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>
                                {g.name}
                              </span>
                              <span
                                style={{
                                  fontSize: 11,
                                  color: isAkademik ? '#fbbf24' : '#ef4444',
                                  background: isAkademik
                                    ? 'rgba(245,158,11,0.1)'
                                    : 'rgba(239,68,68,0.1)',
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                  fontWeight: 600,
                                }}
                              >
                                Maxsus Status
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <b style={{ fontSize: 15, color: isAkademik ? '#fbbf24' : '#ef4444' }}>
                                {count} nafar talaba
                              </b>
                              <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 45, textAlign: 'right' }}>
                                ({percent}%)
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div
                            style={{
                              width: '100%',
                              height: 8,
                              background: 'rgba(255,255,255,0.06)',
                              borderRadius: 4,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${percent}%`,
                                height: '100%',
                                background: isAkademik
                                  ? 'linear-gradient(90deg, #d97706, #fbbf24)'
                                  : 'linear-gradient(90deg, #b91c1c, #ef4444)',
                                borderRadius: 4,
                                transition: 'width 0.4s ease',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
