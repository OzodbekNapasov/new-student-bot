import React from 'react';
import { GraduationCap, ShieldCheck, UserCheck, Smartphone } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl text-center space-y-6 border border-slate-800 shadow-2xl">
        <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto text-blue-400">
          <GraduationCap className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">Student Management Platform</h1>
          <p className="text-xs text-slate-400">Next.js 15 + NestJS + Neon Postgres + Telegram WebApp</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-left">
            <Smartphone className="w-5 h-5 text-blue-400 mb-1" />
            <div className="text-xs font-bold text-white">Telegram Mini App</div>
            <div className="text-[10px] text-slate-400">Student & Leader Portal</div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-left">
            <ShieldCheck className="w-5 h-5 text-purple-400 mb-1" />
            <div className="text-xs font-bold text-white">Web Admin Panel</div>
            <div className="text-[10px] text-slate-400">Super Admin Dashboard</div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>Status: Online</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Next.js 15 Ready
          </span>
        </div>
      </div>
    </main>
  );
}
