import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  GraduationCap,
  Plus,
  UserPlus,
  Search,
  LogOut,
  TrendingUp,
  Award,
  Layers,
} from 'lucide-react';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('admin@student.uz');
  const [password, setPassword] = useState('admin123');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'groups' | 'students' | 'leaders'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample State
  const [groups, setGroups] = useState([
    { id: 'g1', name: 'Komp\'yuter Insoniyligi (CS-101)', code: 'CS-101', faculty: 'Axborot Texnologiyalari', leader: 'Jasur Karimov', studentCount: 28 },
    { id: 'g2', name: 'Dasturiy Ingeneriya (SE-202)', code: 'SE-202', faculty: 'Dasturiy Ingeneriya', leader: 'Malika Usmonova', studentCount: 32 },
  ]);

  const [students, setStudents] = useState([
    { id: 's1', name: 'Ali Valiyev', card: 'CS-4812', group: 'CS-101', tg: '@alivaliyev', status: 'ACTIVE' },
    { id: 's2', name: 'Sardor Toshmatov', card: 'CS-4813', group: 'CS-101', tg: '@sardor_t', status: 'ACTIVE' },
    { id: 's3', name: 'Bekzod Rahimov', card: 'SE-9901', group: 'SE-202', tg: '@bekzod_r', status: 'ACTIVE' },
    { id: 's4', name: 'Zilola Qodirova', card: 'SE-9902', group: 'SE-202', tg: '@zilola_q', status: 'ACTIVE' },
  ]);

  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCode, setNewGroupCode] = useState('');
  const [newGroupFaculty, setNewGroupFaculty] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsAuthenticated(true);
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName || !newGroupCode) return;
    setGroups([
      ...groups,
      {
        id: `g-${Date.now()}`,
        name: newGroupName,
        code: newGroupCode,
        faculty: newGroupFaculty || 'General',
        leader: 'Tayinlanmagan',
        studentCount: 0,
      },
    ]);
    setShowAddGroupModal(false);
    setNewGroupName('');
    setNewGroupCode('');
    setNewGroupFaculty('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto text-blue-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Student Management Platform</h1>
            <p className="text-xs text-slate-400">Super Administrator Portaliga Kirish</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email manzil:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Parol:</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30"
            >
              Tizimga Kirish
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/80 border-r border-slate-800/80 p-5 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white">Student Admin</div>
              <div className="text-[11px] text-emerald-400 font-semibold">Super Administrator</div>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${
                activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Boshqaruv Paneli
            </button>

            <button
              onClick={() => setActiveTab('groups')}
              className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${
                activeTab === 'groups' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" /> Guruhlar & Rahbarlar
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${
                activeTab === 'students' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Talabalar Ro'yxati
            </button>
          </nav>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="w-full px-4 py-3 bg-slate-800/80 hover:bg-rose-900/30 hover:text-rose-400 text-slate-400 text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" /> Chiqish
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-black text-white">Student Management Platform</h1>
            <p className="text-xs text-slate-400">Markazlashtirilgan Tizim Administratori Portali</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Real-time System Online
            </span>
          </div>
        </header>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Jami Guruhlar</span>
                  <Building2 className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-black text-white">{groups.length} ta</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Jami Talabalar</span>
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-white">{students.length} ta</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Guruh Rahbarlari</span>
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-3xl font-black text-white">2 kishi</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>O'rtacha Davomat</span>
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-emerald-400">92%</div>
              </div>
            </div>

            {/* Quick Overview Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Faol Guruhlar Ko'rinishi</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 border-b border-slate-800 uppercase">
                    <tr>
                      <th className="py-3 px-4">Guruh Nomi</th>
                      <th className="py-3 px-4">Kodi</th>
                      <th className="py-3 px-4">Fakultet</th>
                      <th className="py-3 px-4">Guruh Rahbari</th>
                      <th className="py-3 px-4">Talabalar Soni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {groups.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-800/50 transition-all">
                        <td className="py-3 px-4 font-bold text-white">{g.name}</td>
                        <td className="py-3 px-4">{g.code}</td>
                        <td className="py-3 px-4">{g.faculty}</td>
                        <td className="py-3 px-4 font-semibold text-indigo-400">{g.leader}</td>
                        <td className="py-3 px-4">{g.studentCount} kishi</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GROUPS MANAGEMENT */}
        {activeTab === 'groups' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Guruhlar va Rahbarlarni Boshqarish</h2>
              <button
                onClick={() => setShowAddGroupModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <Plus className="w-4 h-4" /> Yangi Guruh Qo'shish
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <div key={group.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{group.name}</h3>
                      <p className="text-xs text-slate-400">Kodi: {group.code} • Fakultet: {group.faculty}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">
                      {group.studentCount} talaba
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">
                      Guruh Rahbari: <strong className="text-indigo-400">{group.leader}</strong>
                    </span>
                    <button
                      onClick={() => alert(`Guruh rahbari biriktirish oynasi`)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Biriktirish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STUDENTS LIST */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Tizimdagi Barcha Talabalar</h2>
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Ism yoki guruh bo'yicha qidiruv..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 bg-slate-950/50 border-b border-slate-800 uppercase">
                  <tr>
                    <th className="py-3.5 px-4">Talaba Ism-Familiyasi</th>
                    <th className="py-3.5 px-4">Talabalik Bileti</th>
                    <th className="py-3.5 px-4">Biriktirilgan Guruh</th>
                    <th className="py-3.5 px-4">Telegram Username</th>
                    <th className="py-3.5 px-4">Holati</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-800/50 transition-all">
                      <td className="py-3.5 px-4 font-bold text-white">{student.name}</td>
                      <td className="py-3.5 px-4">{student.card}</td>
                      <td className="py-3.5 px-4 font-semibold text-blue-400">{student.group}</td>
                      <td className="py-3.5 px-4 text-slate-400">{student.tg}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">
                          FAOL
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Create Group Modal */}
      {showAddGroupModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-white">Yangi Akademik Guruh Yaratish</h3>

            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Guruh Nomi:</label>
                <input
                  type="text"
                  required
                  placeholder="Komp'yuter Insoniyligi (CS-101)"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Guruh Kodi (Unique Code):</label>
                <input
                  type="text"
                  required
                  placeholder="CS-101"
                  value={newGroupCode}
                  onChange={(e) => setNewGroupCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Fakultet:</label>
                <input
                  type="text"
                  placeholder="Axborot Texnologiyalari"
                  value={newGroupFaculty}
                  onChange={(e) => setNewGroupFaculty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGroupModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  Bekor Qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30"
                >
                  Guruhni Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
