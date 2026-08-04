import React, { useState, useEffect } from 'react';
import { User, Role } from './types';
import { StudentView } from './components/StudentView';
import { LeaderView } from './components/LeaderView';
import { AdminView } from './components/AdminView';
import { ShieldCheck, UserCheck, GraduationCap, Wifi, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<Role>('STUDENT');
  const [tgUser, setTgUser] = useState<any>(null);

  useEffect(() => {
    // Check if running inside Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.user) {
        setTgUser(tg.initDataUnsafe.user);
      }
    }
  }, []);

  // Demo user instances for role testing
  const activeUser: User = {
    id: currentRole === 'SUPER_ADMIN' ? 'u-admin' : currentRole === 'GROUP_LEADER' ? 'u-leader' : 'u-student',
    firstName: tgUser?.first_name || (currentRole === 'SUPER_ADMIN' ? 'Super' : currentRole === 'GROUP_LEADER' ? 'Jasur' : 'Ali'),
    lastName: tgUser?.last_name || (currentRole === 'SUPER_ADMIN' ? 'Admin' : currentRole === 'GROUP_LEADER' ? 'Karimov' : 'Valiyev'),
    role: currentRole,
    studentProfile: {
      id: 'sp-1',
      userId: 'u-student',
      groupId: 'g-1',
      studentCardNumber: 'CS-4812',
      group: {
        id: 'g-1',
        name: 'Komp\'yuter Insoniyligi (CS-101)',
        code: 'CS-101',
        leader: {
          id: 'u-leader',
          firstName: 'Jasur',
          lastName: 'Karimov',
          phone: '+998909876543',
          role: 'GROUP_LEADER',
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      <div className="w-full max-w-md px-4 py-4 space-y-4">
        {/* Top Real-time Header */}
        <header className="flex items-center justify-between py-2 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
              Student Platform
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-400">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Real-time Sync</span>
          </div>
        </header>

        {/* Role Demo Switcher Bar */}
        <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 text-center mb-1">
            Rolni Sinab Ko'rish (Demo Controls)
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setCurrentRole('STUDENT')}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                currentRole === 'STUDENT'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" /> Talaba
            </button>

            <button
              onClick={() => setCurrentRole('GROUP_LEADER')}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                currentRole === 'GROUP_LEADER'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Guruh Rahbari
            </button>

            <button
              onClick={() => setCurrentRole('SUPER_ADMIN')}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                currentRole === 'SUPER_ADMIN'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </button>
          </div>
        </div>

        {/* Dynamic View rendering based on active role */}
        <main className="mt-2">
          {currentRole === 'STUDENT' && <StudentView user={activeUser} />}
          {currentRole === 'GROUP_LEADER' && <LeaderView user={activeUser} />}
          {currentRole === 'SUPER_ADMIN' && <AdminView user={activeUser} />}
        </main>
      </div>
    </div>
  );
};
export default App;
