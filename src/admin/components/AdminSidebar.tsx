import React from 'react';
import { useStore } from '../../store';
import { 
  Users, Layers, LineChart, Activity, History, Settings, LogOut, 
  ShieldCheck, LayoutDashboard, Terminal
} from 'lucide-react';
import { BrandLogoFull } from '../../brand';

export default function AdminSidebar() {
  const { currentPath, navigateTo, logout, user } = useStore();

  const menuItems = [
    { title: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Users', path: '/admin/users', icon: Users },
    { title: 'Workspaces', path: '/admin/workspaces', icon: Layers },
    { title: 'Analytics', path: '/admin/analytics', icon: LineChart },
    { title: 'AI Monitoring', path: '/admin/ai-monitoring', icon: Activity },
    { title: 'Audit Logs', path: '/admin/audit-logs', icon: History },
    { title: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#090d16] border-r border-white/5 flex flex-col justify-between shrink-0 h-full select-none">
      {/* Upper Logo / Branding area */}
      <div>
        <div className="p-5 border-b border-white/5">
          <BrandLogoFull subtitle="Admin Control" />
        </div>

        {/* User Identity Banner */}
        <div className="px-5 py-4 border-b border-white/5 bg-slate-950/25 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-550/20 shadow-md">
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-205 truncate leading-tight">{user?.name || 'Administrator'}</p>
            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
              <ShieldCheck size={10} className="text-indigo-400 font-bold" />
              <span>SUPER ADMIN</span>
            </span>
          </div>
        </div>

        {/* Navigation Item Tree */}
        <nav className="p-3.5 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path === '/admin/dashboard' && (currentPath === '/admin' || currentPath === '/admin/'));
            return (
              <button
                key={item.path}
                onClick={() => navigateTo(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-sans text-xs font-medium cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-650/15 to-purple-650/5 border border-indigo-500/20 text-indigo-400 font-semibold'
                    : 'text-slate-400 border border-transparent hover:bg-white/[0.02] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={14} className={isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'} />
                  <span>{item.title}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area with Sign out option */}
      <div className="p-4 border-t border-white/5 bg-slate-950/15">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/5 hover:text-rose-300 border border-transparent hover:border-rose-500/10 cursor-pointer transition-colors"
        >
          <LogOut size={14} />
          <span>Exit Workspace</span>
        </button>
      </div>
    </aside>
  );
}
