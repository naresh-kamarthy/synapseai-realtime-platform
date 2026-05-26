import React, { useEffect } from 'react';
import { useStore } from '../../store';
import AdminSidebar from '../components/AdminSidebar';
import { ShieldCheck, LogOut, Terminal, Bell } from 'lucide-react';
import { BrandLogoCompact } from '../../brand';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, navigateTo, logout } = useStore();

  // Enforce Superuser authorization
  useEffect(() => {
    if (!user) {
      navigateTo('/');
    } else if (user.role !== 'admin') {
      navigateTo('/');
    }
  }, [user, navigateTo]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-slate-400 p-8">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 animate-bounce">
          <Terminal size={24} />
        </div>
        <p className="text-sm font-mono text-slate-300 font-semibold mb-1">Access Denied</p>
        <p className="text-xs text-slate-500 max-w-sm text-center mb-6">Your authorization token is insufficient for administrative cluster services.</p>
        <button
          onClick={() => logout()}
          className="px-5 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] border border-white/5 hover:border-white/10 rounded-xl text-xs font-medium text-slate-300 transition-colors cursor-pointer"
        >
          Sign Out of System
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex h-screen select-none overflow-hidden relative">
      {/* Background atmospheric glowing elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[20%] w-[600px] h-[600px] bg-indigo-650/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-cyan-650/10 rounded-full blur-[120px]" />
      </div>

      {/* 1. Sidebar Navigation Column */}
      <AdminSidebar />

      {/* 2. Main Work Panel Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10 h-full overflow-hidden">
        {/* Top Header navbar container */}
        <header className="h-16 border-b border-white/5 bg-[#05070f]/90 backdrop-blur px-6 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-indigo-400 font-bold" />
            <span className="text-xs font-mono font-medium tracking-tight text-slate-200">System Control Console</span>
            <span className="text-[10px] font-mono text-slate-600">|</span>
            <BrandLogoCompact />
          </div>

          <div className="flex items-center gap-4.5">
            {/* Server Online node badge */}
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-mono text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>NODE_STABLE</span>
            </div>

            {/* Profile pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
              <div className="w-5 h-5 rounded-full bg-[#1e293b] text-[#818cf8] font-bold flex items-center justify-center text-[10px]">
                {user.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <span className="text-[11px] font-medium text-slate-300 font-mono">{user.name || 'Admin'}</span>
            </div>
          </div>
        </header>

        {/* 3. Panel Main View with scroll */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
