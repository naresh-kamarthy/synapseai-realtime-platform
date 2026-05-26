import React, { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { 
  History, Search, Filter, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, ShieldAlert
} from 'lucide-react';

interface AuditLog {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  action: string;
  details: string;
  workspaceId?: string;
  ipAddress: string;
  createdAt: string;
}

export default function AdminAuditLogs() {
  const { token } = useStore();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorClassName, setErrorClassName] = useState('');

  const fetchAuditLogs = async () => {
    if (!token) return;
    setLoading(true);
    setErrorClassName('');
    try {
      const res = await fetch(`/api/admin/audit-logs?page=${page}&limit=12&action=${actionFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.auditLogs || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        const err = await res.json();
        setErrorClassName(err.error || 'Failed to list audit logs.');
      }
    } catch {
      setErrorClassName('Disruption in reading system audit trace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, actionFilter, token]);

  return (
    <div className="space-y-6 select-text relative">
      {/* Title bar area */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-white leading-none">Security Audit Logs</h1>
          <p className="text-xs text-slate-505 font-mono">TRACK PLATFORM ACTIONS & SYSTEM SECURITY LOGS</p>
        </div>
        <button
          onClick={() => { setPage(1); fetchAuditLogs(); }}
          className="p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-medium"
        >
          <RefreshCw size={13} />
          <span>Reload Logs</span>
        </button>
      </div>

      {/* Query filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4.5 bg-[#090d16]/80 backdrop-blur rounded-2xl border border-white/5 shadow-xl">
        <div className="md:col-span-2 relative">
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="w-full bg-slate-950 border border-white/5 rounded-xl py-2.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-505 cursor-pointer appearance-none font-sans"
          >
            <option value="">Filter Action: All System Events</option>
            <option value="LOGIN_SUCCESS">Successful logins (LOGIN_SUCCESS)</option>
            <option value="LOGIN_FAILED">Unsuccessful logins (LOGIN_FAILED)</option>
            <option value="REGISTER">New account registrations (REGISTER)</option>
            <option value="BLOCK_USER">Administrative profile blocks (BLOCK_USER)</option>
            <option value="UNBLOCK_USER">Administrative profile restorations (UNBLOCK_USER)</option>
            <option value="ROLE_CHANGE">Privileges/Policy modification (ROLE_CHANGE)</option>
            <option value="WORKSPACE_DESTROY">Workspace Dismantles (WORKSPACE_DESTROY)</option>
            <option value="USER_DELETED">User account deletions (USER_DELETED)</option>
          </select>
          <Filter size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>

        <button
          onClick={() => { setPage(1); fetchAuditLogs(); }}
          className="bg-indigo-650 hover:bg-indigo-500 border border-indigo-500/30 text-white hover:text-white rounded-xl text-xs font-semibold font-sans py-2.5 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Search size={13} />
          <span>Search Logs</span>
        </button>
      </div>

      {errorClassName && (
        <div className="bg-rose-500/5 border border-rose-500/15 p-4 rounded-xl text-xs text-rose-455 flex items-center gap-2">
          <ShieldAlert size={14} />
          <span>{errorClassName}</span>
        </div>
      )}

      {/* Grid container table */}
      <div className="bg-[#090d16]/30 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto"></div>
            <p className="text-xs font-mono tracking-widest text-slate-500 uppercase animate-pulse">Querying audit trail maps...</p>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-xs text-slate-505 text-center py-24 italic">No audit events matched configured filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-slate-950/20 text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                  <th className="py-4 px-5 font-bold">Action</th>
                  <th className="py-4 px-5 font-bold">Collaborator Node</th>
                  <th className="py-4 px-5 font-bold">Details</th>
                  <th className="py-4 px-5 font-bold">IP Address</th>
                  <th className="py-4 px-5 font-bold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-900/10">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.015] transition-colors">
                    {/* Action badge */}
                    <td className="py-4 px-5">
                      <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold border ${
                        log.action.includes('FAILED') || log.action.includes('BLOCK') || log.action.includes('DESTROY') || log.action.includes('DELETED')
                          ? 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                          : log.action.includes('ROLE_CHANGE')
                          ? 'bg-amber-500/10 text-[#f59e0b] border-[#f59e0b]/20'
                          : 'bg-emerald-500/10 text-emerald-450 border-emerald-500/10'
                      }`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Operator Name / Email */}
                    <td className="py-4 px-5 leading-tight">
                      <span className="text-xs font-semibold text-slate-101 block">{log.userName || 'System / Guest'}</span>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{log.userEmail || 'N/A'}</span>
                    </td>

                    {/* Action summary/details */}
                    <td className="py-4 px-5 text-slate-300 font-sans max-w-sm break-words leading-relaxed">
                      {log.details}
                    </td>

                    {/* IP */}
                    <td className="py-4 px-5 font-mono text-slate-455 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    {/* Timestamp */}
                    <td className="py-4 px-5 text-right text-slate-500 font-mono text-[10px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Dynamic page navigator controls */}
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
