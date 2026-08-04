import React, { useState } from 'react';
import { User, Group } from '../types';
import { ShieldCheck, Plus, UserPlus, Users, GraduationCap, Building2 } from 'lucide-react';

interface AdminViewProps {
  user: User;
}

export const AdminView: React.FC<AdminViewProps> = ({ user }) => {
  const [groups, setGroups] = useState([
    { id: 'g1', name: 'Komp\'yuter Insoniyligi (CS-101)', code: 'CS-101', faculty: 'IT', leader: 'Jasur Karimov', studentsCount: 28 },
    { id: 'g2', name: 'Dasturiy Ingeneriya (SE-202)', code: 'SE-202', faculty: 'SE', leader: 'Malika Usmonova', studentsCount: 32 },
  ]);

  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCode, setNewGroupCode] = useState('');
  const [newGroupFaculty, setNewGroupFaculty] = useState('');

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName || !newGroupCode) return;

    const newGroup = {
      id: `g-${Date.now()}`,
      name: newGroupName,
      code: newGroupCode,
      faculty: newGroupFaculty || 'AT',
      leader: 'Tayinlanmagan',
      studentsCount: 0,
    };

    setGroups([...groups, newGroup]);
    setShowAddGroup(false);
    setNewGroupName('');
    setNewGroupCode('');
    setNewGroupFaculty('');
    alert(' Yangi guruh muvaffaqiyatli yaratildi!');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Admin Header */}
      <div className="glass-card rounded-2xl p-5 border border-purple-500/30 bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-950">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Administrator Boshqaruvi
              <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                Super Admin
              </span>
            </h2>
            <p className="text-xs text-slate-400">Barcha guruhlar va guruh rahbarlarini boshqarish</p>
          </div>
        </div>
      </div>

      {/* Global Analytics Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Barcha Guruhlar</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{groups.length} ta</div>
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Barcha Talabalar</span>
            <GraduationCap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">60 ta</div>
        </div>
      </div>

      {/* Group Management Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Tizimdagi Guruhlar
          </h3>
          <button
            onClick={() => setShowAddGroup(!showAddGroup)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shadow-md shadow-purple-600/30"
          >
            <Plus className="w-4 h-4" /> Yangi Guruh
          </button>
        </div>

        {/* Add Group Form */}
        {showAddGroup && (
          <form onSubmit={handleCreateGroup} className="glass-card p-4 rounded-2xl mb-4 space-y-3 border border-purple-500/40">
            <h4 className="text-xs font-bold text-purple-300">Yangi Guruh Yaratish</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Guruh Nomi (masalan: CS-101)"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <input
                type="text"
                required
                placeholder="Kodi (masalan: CS-101)"
                value={newGroupCode}
                onChange={(e) => setNewGroupCode(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <input
              type="text"
              placeholder="Fakultet (masalan: Axborot Texnologiyalari)"
              value={newGroupFaculty}
              onChange={(e) => setNewGroupFaculty(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddGroup(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Bekor Qilish
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-xl"
              >
                Yaratish
              </button>
            </div>
          </form>
        )}

        {/* Groups List */}
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.id} className="glass-card p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{group.name}</h4>
                  <p className="text-xs text-slate-400">Kodi: {group.code} • Fakultet: {group.faculty}</p>
                </div>
                <span className="text-xs font-semibold bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/30">
                  {group.studentsCount} talaba
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-300">
                  👨‍🏫 Guruh Rahbari: <strong className="text-indigo-400">{group.leader}</strong>
                </span>
                <button
                  onClick={() => alert(`Guruh rahbari almashtirish oynasi!`)}
                  className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Biriktirish
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
