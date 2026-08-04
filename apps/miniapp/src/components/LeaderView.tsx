import React, { useState } from 'react';
import { User, Group, StudentProfile, AttendanceStatus } from '../types';
import { Users, CheckCircle, XCircle, AlertCircle, PlusCircle, Check, Save, Layers, Award } from 'lucide-react';

interface LeaderViewProps {
  user: User;
}

interface AttendanceState {
  [studentId: string]: AttendanceStatus;
}

export const LeaderView: React.FC<LeaderViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'tasks' | 'submissions'>('attendance');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Mock students list in group for interactive demonstration
  const [students, setStudents] = useState([
    { id: 'std-1', name: 'Ali Valiyev', card: 'CS-4812', tg: '@alivaliyev', status: 'PRESENT' as AttendanceStatus },
    { id: 'std-2', name: 'Sardor Toshmatov', card: 'CS-4813', tg: '@sardor_t', status: 'PRESENT' as AttendanceStatus },
    { id: 'std-3', name: 'Nigora Alimova', card: 'CS-4814', tg: '@nigora_a', status: 'ABSENT' as AttendanceStatus },
    { id: 'std-4', name: 'Davron Bekov', card: 'CS-4815', tg: '@davron_b', status: 'EXCUSED' as AttendanceStatus },
  ]);

  const [attendanceMap, setAttendanceMap] = useState<AttendanceState>({
    'std-1': 'PRESENT',
    'std-2': 'PRESENT',
    'std-3': 'ABSENT',
    'std-4': 'EXCUSED',
  });

  const [isSaved, setIsSaved] = useState(false);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
    setIsSaved(false);
  };

  const markAllPresent = () => {
    const updated: AttendanceState = {};
    students.forEach((s) => (updated[s.id] = 'PRESENT'));
    setAttendanceMap(updated);
    setIsSaved(false);
  };

  const handleSaveAttendance = () => {
    setIsSaved(true);
    setTimeout(() => {
      alert(`✅ ${selectedDate} kunlik guruh davomati muvaffaqiyatli saqlandi!`);
    }, 400);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`✅ Topshiriq ("${taskTitle}") guruh talabalariga yuborildi!`);
    setTaskTitle('');
    setTaskDesc('');
    setTaskDueDate('');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Group Leader Header */}
      <div className="glass-card rounded-2xl p-5 border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
              <Layers className="w-4 h-4" /> Guruh Rahbari Paneli
            </div>
            <h2 className="text-xl font-bold text-white">Guruh: Komp'yuter Insoniyligi (CS-101)</h2>
            <p className="text-xs text-slate-400 mt-1">👨‍🏫 Rahbar: {user.firstName} {user.lastName || ''}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-indigo-400">{students.length}</span>
            <span className="block text-[11px] text-slate-400 font-medium">Talabalar</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> Davomat
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'tasks' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <PlusCircle className="w-4 h-4" /> Topshiriq Berish
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'submissions' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" /> Baholash
        </button>
      </div>

      {/* TAB 1: ATTENDANCE REGISTER */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Sana tanlang:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={markAllPresent}
              className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 rounded-xl flex items-center gap-1 transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Barchasini "Kelgan" qilish
            </button>
          </div>

          <div className="space-y-3">
            {students.map((student) => {
              const currentStatus = attendanceMap[student.id] || 'PRESENT';
              return (
                <div key={student.id} className="glass-card p-3.5 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{student.name}</h4>
                    <p className="text-xs text-slate-400">{student.card} • {student.tg}</p>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setStatus(student.id, 'PRESENT')}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                        currentStatus === 'PRESENT'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Bor
                    </button>

                    <button
                      onClick={() => setStatus(student.id, 'ABSENT')}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                        currentStatus === 'ABSENT'
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Yo'q
                    </button>

                    <button
                      onClick={() => setStatus(student.id, 'EXCUSED')}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                        currentStatus === 'EXCUSED'
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" /> Sababli
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSaveAttendance}
            className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              isSaved
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            <Save className="w-4 h-4" /> {isSaved ? 'Davomat Saqlandi ✓' : 'Davomatni Saqlash va Yuborish'}
          </button>
        </div>
      )}

      {/* TAB 2: TASK PUBLISHER */}
      {activeTab === 'tasks' && (
        <form onSubmit={handleCreateTask} className="glass-card rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Yangi Topshiriq Yaratish</h3>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Mavzu / Sarlovha:</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Masalan: C++ Massivlar amaliyoti"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Batafsil Tavsif:</label>
            <textarea
              rows={3}
              required
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              placeholder="Topshiriq shartlari va havolalar..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Topshirish Muxlati (Deadline):</label>
            <input
              type="date"
              required
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Topshiriqni E'lon Qilish
          </button>
        </form>
      )}

      {/* TAB 3: EVALUATE SUBMISSIONS */}
      {activeTab === 'submissions' && (
        <div className="space-y-3">
          <div className="glass-card p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Ali Valiyev</h4>
                <p className="text-xs text-slate-400">Topshiriq: Dasturlash Asoslari - 3-amaliy</p>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-500/20 text-amber-400 rounded-full">
                Kutilmoqda
              </span>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl font-mono">
              github.com/alivaliyev/cpp-array-task
            </p>

            <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
              <input
                type="number"
                placeholder="Baho (1-100)"
                className="w-28 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => alert(' Topshiriq baholandi!')}
                className="flex-1 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20"
              >
                Tasdiqlash va Baholash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
