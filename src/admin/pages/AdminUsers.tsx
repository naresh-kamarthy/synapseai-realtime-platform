import React, { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { 
  Users, Search, Shield, UserX, Trash2, ArrowUpDown, ChevronLeft, 
  ChevronRight, Sparkles, Filter, MoreVertical, X, CheckSquare, ShieldCheck
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  blocked: boolean;
  lastActiveAt: string;
  createdAt: string;
  workspacesCount: number;
  messagesCount: number;
}

export default function AdminUsers() {
  const { token, user: currentUser } = useStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorClassName, setErrorClassName] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Trigger loading automatically on parameter modification with a debounced search handler
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, page, roleFilter, token]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    setErrorClassName('');
    try {
      const response = await fetch(`/api/admin/users?page=${page}&limit=8&search=${encodeURIComponent(search)}&role=${roleFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        const err = await response.json();
        showToast(err.error || 'Failed to list user account pools.', 'error');
      }
    } catch {
      showToast('Telemetry line disruption on retrieving users directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const executeBlockToggle = async (userId: string, targetBlockedState: boolean) => {
    if (!token) return;
    if (userId === currentUser?.id) {
      showToast('Failed: You are barred from locking your own account.', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ blocked: targetBlockedState })
      });
      if (res.ok) {
        showToast(targetBlockedState ? 'User lock deployed.' : 'User lock removed.');
        setUsers(users.map(u => u.id === userId ? { ...u, blocked: targetBlockedState } : u));
      } else {
        const err = await res.json();
        showToast(err.error || 'Request state modification failure.', 'error');
      }
    } catch {
      showToast('State modification request failed.', 'error');
    }
  };

  const executeRoleChange = async (userId: string, newRole: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        showToast(`Role policies adjusted successfully.`);
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update user security privileges.', 'error');
      }
    } catch {
      showToast('Privilege upgrade request failed.', 'error');
    }
  };

  const executeHardErase = async (userId: string, username: string) => {
    if (!token) return;
    if (userId === currentUser?.id) {
      showToast('Erase operation aborted. Self-deletion is denied.', 'error');
      return;
    }
    const confirmed = window.confirm(`CRITICAL WARNING:\nAre you absolutely sure you want to permanently erase the account profile for "${username}"?\nThis deletes all files, environments, and records.`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Account successfully annihilated.');
        setUsers(users.filter(u => u.id !== userId));
      } else {
        const err = await res.json();
        showToast(err.error || 'Hard deletion rejected.', 'error');
      }
    } catch {
      showToast('Failed to apply account wipe.', 'error');
    }
  };

  return (
    <div className="space-y-6 select-text relative">
      {/* Dynamic feedback toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border text-xs font-semibold font-mono animate-slideIn ${
          toast.type === 'success' ? 'bg-[#05070f] text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' : 'bg-[#05070f] text-rose-455 border-rose-500/20 shadow-rose-500/5'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main title bar area */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-white leading-none">Users Management</h1>
          <p className="text-xs text-slate-505 font-mono">MONITOR & POLICE PARTICIPANTS IN REAL-TIME</p>
        </div>
      </div>

      {/* Database querying options: search and filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4.5 bg-[#090d16]/80 backdrop-blur rounded-2xl border border-white/5 shadow-xl">
        <div className="md:col-span-2 relative">
          <input
            type="text"
            placeholder="Search account by email, name or workspace ID..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-slate-950 border border-white/5 rounded-xl py-2.5 pl-9 pr-8 text-xs text-slate-101 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors font-sans"
          />
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          {search && (
            <button 
              onClick={() => handleSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="w-full bg-slate-950 border border-white/5 rounded-xl py-2.5 pl-3 pr-8 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer appearance-none font-sans"
          >
            <option value="">Security Level: All</option>
            <option value="user">Collaborator (Standard)</option>
            <option value="admin">Administrator (Super)</option>
          </select>
          <Filter size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Grid records wrapper */}
      <div className="bg-[#090d16]/30 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto"></div>
            <p className="text-xs font-mono tracking-widest text-slate-500 animate-pulse uppercase">Querying user registry indices...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center space-y-1.5 text-slate-500 italic text-xs font-sans">
            <p>No user accounts returned under configured parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-slate-950/20 text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                  <th className="py-4 px-5 font-bold">Collaborator Profile</th>
                  <th className="py-4 px-5 font-bold">Role</th>
                  <th className="py-4 px-5 font-bold">Volume Prompts</th>
                  <th className="py-4 px-5 font-bold text-center">Admin Controls</th>
                  <th className="py-4 px-5 font-bold text-right">Erase Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-900/10">
                {users.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.015] transition-colors">
                    {/* Name, email, avatar */}
                    <td className="py-4 px-5 flex items-center gap-3">
                      <div className="w-8.5 h-8.5 rounded-full bg-[#1e293b] text-indigo-400 font-bold border border-[#818cf8]/15 shadow-md flex items-center justify-center shrink-0 font-sans">
                        {item.name ? item.name[0].toUpperCase() : 'A'}
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-semibold text-slate-101 block leading-tight">{item.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono hover:text-indigo-400 transition-colors block mt-0.5">{item.email}</span>
                      </div>
                    </td>

                    {/* Security level role badge */}
                    <td className="py-4 px-5">
                      {item.role === 'admin' ? (
                        <span className="px-2.5 py-0.5 rounded-md font-bold font-mono text-[9px] bg-indigo-500/5 text-indigo-400 border border-indigo-500/20 uppercase flex items-center gap-1 w-max">
                          <ShieldCheck size={10} />
                          <span>SUPER_ADMIN</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md font-bold font-mono text-[9px] bg-emerald-500/5 text-emerald-450 border border-emerald-500/10 uppercase flex items-center gap-1 w-max">
                          <span>COLLABORATOR</span>
                        </span>
                      )}
                    </td>

                    {/* Messages volume */}
                    <td className="py-4 px-5 font-mono text-[11px] text-slate-350">
                      <span className="font-bold text-slate-200">{item.messagesCount || 0}</span> prompts logged
                    </td>

                    {/* State controller switches */}
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Block / Unblock toggler */}
                        <button
                          onClick={() => executeBlockToggle(item.id, !item.blocked)}
                          disabled={item.id === currentUser?.id}
                          className={`px-3 py-1.5 rounded-xl font-medium text-[10px] border tracking-tight font-sans transition-all cursor-pointer ${
                            item.blocked
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/15'
                              : 'bg-white/5 border-white/5 text-slate-350 hover:bg-white/10 hover:border-white/10'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {item.blocked ? 'Release Lockout' : 'Suspend user'}
                        </button>

                        {/* Promote / Demote privileges */}
                        <button
                          onClick={() => executeRoleChange(item.id, item.role === 'admin' ? 'user' : 'admin')}
                          disabled={item.id === currentUser?.id}
                          className="px-3 py-1.5 rounded-xl font-medium text-[10px] bg-slate-950/60 border border-white/5 hover:border-white/10 text-slate-300 hover:text-white hover:bg-slate-900 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {item.role === 'admin' ? 'Revoke Super' : 'Deploy Super'}
                        </button>
                      </div>
                    </td>

                    {/* Destruction trigger */}
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => executeHardErase(item.id, item.name)}
                        disabled={item.id === currentUser?.id}
                        className="p-2 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/5 hover:border-rose-550/20 text-rose-400 hover:text-rose-300 rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center justify-center"
                        title="Delete User Securely"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Dynamic page navigator control */}
        {!loading && totalPages > 1 && (
          <div className="py-4 px-5 bg-slate-950/20 border-t border-white/5 flex items-center justify-between font-mono text-[11px] text-slate-450 select-none">
            <span>Page <span className="text-white font-bold">{page}</span> of {totalPages} pages</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
