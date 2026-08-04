'use client';

import React, { useState } from 'react';
import { Users, BookOpen, CheckCircle, ShieldAlert, Plus, Search, UserCheck, ArrowUpRight } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'students'>('overview');

  const stats = [
    { title: 'Jami Talabalar', value: '1,248', change: '+12%', icon: Users, color: 'from-blue-600 to-indigo-600' },
    { title: 'Akademik Guruhlar', value: '42', change: '+3 yangi', icon: BookOpen, color: 'from-emerald-600 to-teal-600' },
    { title: 'O\'rtacha Davomat', value: '94.2%', change: '+1.5%', icon: CheckCircle, color: 'from-purple-600 to-pink-600' },
    { title: 'Guruh Rahbarlari', value: '38', change: 'Faol', icon: UserCheck, color: 'from-amber-600 to-orange-600' },
  ];

  const groups = [
    { id: '1', name: 'Kompyuter Ilmlari 101', code: 'CS-101', faculty: 'Axborot Texnologiyalari', leader: 'Jasur Bekmurodov', count: 32 },
    { id: '2', name: 'Dasturiy Muhandislik 202', code: 'SE-202', faculty: 'Axborot Texnologiyalari', leader: 'Malika Raximova', count: 28 },
    { id: '3', name: 'Kiberxavfsizlik 301', code: 'CS-301', faculty: 'Kiberxavfsizlik', leader: 'Sardor Qodirov', count: 25 },
    { id: '4', name: 'Sun\'iy Intelekt 401', code: 'AI-401', faculty: 'Sun\'iy Intelekt', leader: 'Otabek Xolmatov', count: 30 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar / Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-500/20">
              ⚡
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Super Admin Portal
              </h1>
              <p className="text-xs text-slate-400">Student Management Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              👑 Super Admin Role
            </span>
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
              A
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📊 Umumiy Analitika
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'groups'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📚 Guruhlar Boshqaruvi
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'students'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎓 Talabalar Boshqaruvi
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</span>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-white">{stat.value}</span>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {stat.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Section */}
        {activeTab === 'groups' || activeTab === 'overview' ? (
          <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Akademik Guruhlar Ro'yxati</h3>
                <p className="text-xs text-slate-400">Platformadagi barcha mavjud guruhlar va tayinlangan guruh rahbarlari</p>
              </div>

              <button className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm text-white shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all">
                <Plus className="w-4 h-4" /> Yangi Guruh Yaratish
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Guruh Kodi</th>
                    <th className="p-3.5">Guruh Nomi</th>
                    <th className="p-3.5">Fakultet</th>
                    <th className="p-3.5">Guruh Rahbari</th>
                    <th className="p-3.5">Talabalar</th>
                    <th className="p-3.5 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {groups.map((group) => (
                    <tr key={group.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-bold text-blue-400">{group.code}</td>
                      <td className="p-3.5 font-semibold text-slate-100">{group.name}</td>
                      <td className="p-3.5 text-slate-400">{group.faculty}</td>
                      <td className="p-3.5 text-slate-300">{group.leader}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-xs font-semibold text-slate-300">
                          {group.count} ta
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 ml-auto">
                          Boshqarish <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
