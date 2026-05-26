import React, { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { 
  Layers, Trash2, Calendar, Users, Search, AlertCircle, RefreshCw
} from 'lucide-react';

interface AdminWorkspace {
  id: string;
  name: string;
  description: string;
  owner: { name: string; email: string; avatar: string };
  membersCount: number;
  channelsCount: number;
  savedCount: number;
  createdAt: string;
}

export default function AdminWorkspaces() {
  const { token } = useStore();
  const [workspaces, setWorkspaces] = useState<AdminWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorClassName, setErrorClassName] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchWorkspaces = async () => {
    if (!token) return;
    setLoading(true);
    setErrorClassName('');
    try {
      const res = await fetch('/api/admin/workspaces', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const list = await res.json();
        setWorkspaces(list || []);
      } else {
        const err = await res.json();
        setErrorClassName(err.error || 'Failed to list administrative workspaces.');
      }
    } catch {
      setErrorClassName('Disruption in tele-fetching dynamic workspaces index.');
    } finally {
      setLoading(false);
    }
  };

  const executeWorkspacePurge = async (workspaceId: string, name: string) => {
    if (!token) return;
    const confirmed = window.confirm(`CRITICAL SYSTEM WARNING:\nAre you sure you want to permanently dismantled "${name}" workspace?\nThis action erases all message logs, channels, saved assets, and teammate lists. This cannot be undone.`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/workspaces/${workspaceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Workspace dismantled successfully.');
        setWorkspaces(workspaces.filter(ws => ws.id !== workspaceId));
      } else {
        const err = await res.json();
        showToast(err.error || 'Purge request rejected.', 'error');
      }
    } catch {
      showToast('Purging operational environment failed.', 'error');
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [token]);

  return (
    <div className="space-y-6 select-text relative">
      {/* Dynamic Feedback Toasts */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border text-xs font-semibold font-mono animate-slideIn ${
          toast.type === 'success' ? 'bg-[#05070f] text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' : 'bg-[#05070f] text-rose-455 border-rose-500/20 shadow-rose-500/5'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Title header panel */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-white leading-none">Workspaces Management</h1>
          <p className="text-xs text-slate-505 font-mono">DISSOLVE OR AUDIT ACTIVE COLLABORATION ROOMS</p>
        </div>
        <button
          onClick={fetchWorkspaces}
          className="p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-medium"
        >
          <RefreshCw size={13} />
          <span>Reload workspaces</span>
        </button>
      </div>

      {errorClassName && (
        <div className="bg-rose-500/5 border border-rose-500/15 p-4 rounded-xl text-xs text-rose-400 flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{errorClassName}</span>
        </div>
      )}

      {/* Grid of Workspaces container */}
      {loading ? (
        <div className="py-24 text-center space-y-3 bg-[#090d16]/10 border border-white/5 rounded-2xl">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto"></div>
          <p className="text-xs font-mono tracking-widest text-slate-500 animate-pulse uppercase">Auditing workspaces indices...</p>
        </div>
      ) : workspaces.length === 0 ? (
        <div className="py-20 text-center space-y-1.5 text-slate-505 bg-[#090d16]/10 border border-white/5 rounded-2xl italic text-xs">
          <p>No systematic workspaces instantiated on this host.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((ws) => (
            <div key={ws.id} className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex flex-col justify-between hover:border-white/10 hover:bg-slate-900/60 shadow-xl transition-all relative group select-text">
              {/* Card top */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 overflow-hidden">
                    <h3 className="font-bold text-slate-101 text-sm tracking-tight truncate pr-6">{ws.name}</h3>
                    <p className="text-[11px] text-slate-450 line-clamp-2 leading-relaxed min-h-[34px]">{ws.description || 'No system description configured.'}</p>
                  </div>
                  {/* Purger button */}
                  <button
                    onClick={() => executeWorkspacePurge(ws.id, ws.name)}
                    className="p-2 opacity-50 hover:opacity-100 bg-rose-500/5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl cursor-pointer transition-all inline-flex items-center justify-center"
                    title="Annihilate environment"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Owner data */}
                <div className="flex items-center gap-2.5 p-2 bg-slate-950/30 rounded-xl border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-[#818cf8] font-bold text-[9px] flex items-center justify-center border border-white/5 shrink-0 uppercase font-mono">
                    {ws.owner?.name ? ws.owner.name[0] : 'O'}
                  </div>
                  <div className="overflow-hidden leading-tight">
                    <span className="text-[10px] text-slate-500 font-mono tracking-wider block">OWNER</span>
                    <span className="text-[11px] font-semibold text-slate-300 truncate block">{ws.owner?.name || 'Unknown User'}</span>
                  </div>
                </div>
              </div>

              {/* Card bottom details */}
              <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-500 font-bold">
                <div className="flex items-center gap-1.5 bg-indigo-500/5 px-2 py-1 rounded-lg text-indigo-400 border border-indigo-500/10 uppercase">
                  <Users size={11} className="shrink-0" />
                  <span>{ws.membersCount || 1} teammates</span>
                </div>
                
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  <span>{new Date(ws.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
