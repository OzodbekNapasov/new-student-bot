import React, { useState } from 'react';
import { User, StudentProfile, Task, Attendance } from '../types';
import { Calendar, CheckCircle2, XCircle, AlertCircle, Send, FileText, UserCheck, Award } from 'lucide-react';

interface StudentViewProps {
  user: User;
  onRefresh?: () => void;
}

export const StudentView: React.FC<StudentViewProps> = ({ user }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTasks, setSubmittedTasks] = useState<Record<string, boolean>>({});

  const group = user.studentProfile?.group;
  const leader = group?.leader;

  // Mock attendance data for visual showcase if backend data empty
  const attendanceStats = {
    totalDays: 24,
    presentDays: 21,
    absentDays: 2,
    excusedDays: 1,
    percentage: 88,
  };

  const sampleTasks: Task[] = [
    {
      id: 'task-1',
      groupId: group?.id || 'g1',
      title: 'Dasturlash Asoslari - 3-amaliy topshiriq',
      description: 'C++ yoki Python tilida massivlar bilan ishlash boʻyicha algoritm tuzing va GitHub havolasini yuboring.',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    },
    {
      id: 'task-2',
      groupId: group?.id || 'g1',
      title: 'Maʼlumotlar Bazasi - ER Sxema loyihasi',
      description: 'Talabalar boshqaruv tizimi uchun PostgreSQL ER-diagrammasini chizing va tavsif bering.',
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !submissionContent.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setSubmittedTasks((prev) => ({ ...prev, [selectedTask.id]: true }));
      setIsSubmitting(false);
      setSelectedTask(null);
      setSubmissionContent('');
      alert(' Topshiriq muvaffaqiyatli guruh rahbariga yuborildi!');
    }, 600);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Student Profile Header */}
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
            {user.firstName[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {user.firstName} {user.lastName || ''}
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
                Talaba
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              🏫 Guruh: <span className="text-white font-medium">{group?.name || 'CS-101 (Komp. Insoniyligi)'}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              🆔 Bilet: {user.studentProfile?.studentCardNumber || 'STD-784102'}
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Davomat Ko'rsatkichlari
          </h3>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            {attendanceStats.percentage}% Ishtirok
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-3.5 rounded-xl text-center border-l-4 border-l-emerald-500">
            <div className="flex justify-center mb-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-xl font-extrabold text-white">{attendanceStats.presentDays} kun</div>
            <div className="text-[11px] font-medium text-slate-400">Sababsiz kelgan</div>
          </div>

          <div className="glass-card p-3.5 rounded-xl text-center border-l-4 border-l-rose-500">
            <div className="flex justify-center mb-1">
              <XCircle className="w-5 h-5 text-rose-400" />
            </div>
            <div className="text-xl font-extrabold text-white">{attendanceStats.absentDays} kun</div>
            <div className="text-[11px] font-medium text-slate-400">Qoldirgan</div>
          </div>

          <div className="glass-card p-3.5 rounded-xl text-center border-l-4 border-l-amber-500">
            <div className="flex justify-center mb-1">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-xl font-extrabold text-white">{attendanceStats.excusedDays} kun</div>
            <div className="text-[11px] font-medium text-slate-400">Sababli</div>
          </div>
        </div>
      </div>

      {/* Group Leader Contact Card */}
      <div className="glass-card rounded-2xl p-4 border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 to-slate-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 flex items-center justify-center text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-indigo-300">Guruh Rahbari</div>
              <div className="text-sm font-bold text-white">
                {leader ? `${leader.firstName} ${leader.lastName || ''}` : 'Jasur Karimov'}
              </div>
            </div>
          </div>
          <a
            href={`tel:${leader?.phone || '+998901234567'}`}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-indigo-600/30"
          >
            Bog'lanish
          </a>
        </div>
      </div>

      {/* Group Active Tasks */}
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-purple-400" />
          Guruh Topshiriqlari
        </h3>

        <div className="space-y-3">
          {sampleTasks.map((task) => {
            const isDone = submittedTasks[task.id];
            return (
              <div key={task.id} className="glass-card rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{task.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{task.description}</p>
                  </div>
                  {isDone ? (
                    <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <Award className="w-3 h-3" /> Topshirildi
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-500/20 text-amber-400 rounded-full">
                      Aktiv
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-500">
                    Muxlat: {new Date(task.dueDate).toLocaleDateString('uz-UZ')}
                  </span>
                  {!isDone && (
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-blue-600/30"
                    >
                      <Send className="w-3.5 h-3.5" /> Javob Yuborish
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-6 w-full max-w-lg border border-slate-700 space-y-4 animate-in slide-in-from-bottom duration-200">
            <h3 className="text-lg font-bold text-white">Topshiriq Javobi Yuborish</h3>
            <p className="text-xs text-slate-300 font-medium">{selectedTask.title}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Javob matni yoki havola (GitHub/Drive):
                </label>
                <textarea
                  rows={4}
                  required
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Amaliy ish kodi yoki natijalar havolasini kiriting..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2"
                >
                  {isSubmitting ? 'Yuborilmoqda...' : 'Yuborish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
