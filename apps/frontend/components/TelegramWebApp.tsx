'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Users,
  Calendar,
  Award,
} from 'lucide-react';

interface StudentItem {
  id: string;
  name: string;
  card: string;
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED';
}

export default function TelegramWebApp() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'stats'>('attendance');
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<StudentItem[]>([
    { id: '1', name: 'Jasur Bekmurodov', card: 'ST-2024-01', status: 'PRESENT' },
    { id: '2', name: 'Malika Raximova', card: 'ST-2024-02', status: 'PRESENT' },
    { id: '3', name: 'Otabek Xolmatov', card: 'ST-2024-03', status: 'ABSENT' },
    { id: '4', name: 'Dilnoza Aliyeva', card: 'ST-2024-04', status: 'EXCUSED' },
    { id: '5', name: 'Sardor Qodirov', card: 'ST-2024-05', status: 'PRESENT' },
  ]);

  const [submitted, setSubmitted] = useState(false);

  const toggleStatus = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStatus =
            s.status === 'PRESENT' ? 'ABSENT' : s.status === 'ABSENT' ? 'EXCUSED' : 'PRESENT';
          return { ...s, status: nextStatus };
        }
        return s;
      }),
    );
  };

  const handleSaveAttendance = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const presentCount = students.filter((s) => s.status === 'PRESENT').length;
  const absentCount = students.filter((s) => s.status === 'ABSENT').length;
  const excusedCount = students.filter((s) => s.status === 'EXCUSED').length;
  const attendancePercentage = Math.round((presentCount / students.length) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            SMP
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">Student Platform</h1>
            <p className="text-xs text-slate-400">Telegram WebApp v1.0</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Online
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* View Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'attendance'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📋 Davomat Olish (1-Click)
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📊 Statistika & Dial
          </button>
        </div>

        {activeTab === 'attendance' ? (
          <div className="space-y-4">
            {/* Group Header Card */}
            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                    Guruh
                  </span>
                  <h2 className="text-lg font-bold">CS-101 (Kompyuter Ilmlari)</h2>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>{currentDate}</span>
                </div>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-center">
                  <p className="text-xs text-emerald-400 font-medium">Bori</p>
                  <p className="text-lg font-bold text-emerald-300">{presentCount}</p>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl text-center">
                  <p className="text-xs text-rose-400 font-medium">Yo'g'i</p>
                  <p className="text-lg font-bold text-rose-300">{absentCount}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-center">
                  <p className="text-xs text-amber-400 font-medium">Sababli</p>
                  <p className="text-lg font-bold text-amber-300">{excusedCount}</p>
                </div>
              </div>
            </div>

            {/* Students Attendance List */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                Talabalar Ro'yxati ({students.length})
              </h3>

              {students.map((student) => (
                <div
                  key={student.id}
                  onClick={() => toggleStatus(student.id)}
                  className="glass-card p-3 rounded-xl border border-slate-800/80 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-sm">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{student.name}</p>
                      <p className="text-xs text-slate-400">{student.card}</p>
                    </div>
                  </div>

                  <div>
                    {student.status === 'PRESENT' && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                        <CheckCircle className="w-4 h-4" /> Bor
                      </span>
                    )}
                    {student.status === 'ABSENT' && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-bold">
                        <XCircle className="w-4 h-4" /> Yo'q
                      </span>
                    )}
                    {student.status === 'EXCUSED' && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold">
                        <Clock className="w-4 h-4" /> Sababli
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Action */}
            <button
              onClick={handleSaveAttendance}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-white shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{submitted ? '✅ Davomat Saqlandi!' : 'Davomatni Saqlash (1-Click)'}</span>
            </button>
          </div>
        ) : (
          /* Stats & Attendance Percentage Dial */
          <div className="space-y-4">
            <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center space-y-4">
              <h3 className="text-sm font-semibold text-slate-400">Guruh Davomat Ko'rsatkichi</h3>

              {/* Circular Progress Dial */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-500 transition-all duration-1000 ease-out"
                    strokeDasharray={`${attendancePercentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-white">
                    {attendancePercentage}%
                  </span>
                  <span className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">
                    A'lo
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Oxirgi 30 kun davomidagi umumiy guruh davomati a'lo darajada.
              </p>
            </div>

            {/* Achievement Card */}
            <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Eng Yaxshi Guruh Mukofoti</p>
                <p className="text-[11px] text-slate-400">
                  Fakultetda eng yuqori davomatga ega top 3 talikda
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
