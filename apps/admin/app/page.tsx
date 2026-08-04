import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function AdminHome() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-purple-600/20 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto text-purple-400">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">Super Admin Portal</h1>
          <p className="text-xs text-slate-400">Executive Management Dashboard Skeleton</p>
        </div>
        <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <span>Status: Active</span>
          <span className="text-purple-400 font-semibold">Next.js 15 Admin</span>
        </div>
      </div>
    </main>
  );
}
