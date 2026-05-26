import React, { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { 
  Users, Layers, Zap, Activity, Clock, Sliders, RefreshCw, 
  ArrowUpRight, AlertCircle, MessageSquare
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar
} from 'recharts';

interface Metrics {
  totalUsers: number;
  activeUsers: number;
  onlineUsers: number;
  totalWorkspaces: number;
  totalMessages: number;
  aiRequestsToday: number;
  totalPromptStreams: number;
  averageResponseTime: number;
}

interface ChartData {
  dailyAiUsage: { day: string; requests: number }[];
  usergrowth: { day: string; users: number }[];
  workspaceActivity: { day: string; activeRooms: number }[];
  modelUsage: { name: string; value: number }[];
}

interface SystemStatus {
  cpuUsage: number;
  memoryUsage: number;
  databaseState: string;
  socketsPool: number;
  pingMs: number;
}

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

export default function AdminDashboard() {
  const { token } = useStore();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [system, setSystem] = useState<SystemStatus | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/dashboard/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setCharts(data.charts);
        setSystem(data.systemStatus);
        setRecentLogs(data.recentActivity || []);
      } else {
        const err = await res.json();
        setError(err.error || 'Console authorization expired.');
      }
    } catch (e) {
      setError('Connection failure on administrative metrics telemetry channels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white tracking-tight">Executive Dashboard</h1>
            <p className="text-xs text-slate-500">Retrieving operational parameters...</p>
          </div>
          <button disabled className="p-2 text-slate-500 bg-white/5 border border-white/5 rounded-xl">
            <RefreshCw size={14} className="animate-spin" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#090d16] border border-white/5 p-5 rounded-2xl animate-pulse flex flex-col justify-between" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-[#090d16] border border-white/5 rounded-2xl animate-pulse" />
          <div className="h-80 bg-[#090d16] border border-white/5 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-2xl text-center space-y-3">
        <AlertCircle className="mx-auto text-rose-450 font-semibold" size={28} />
        <p className="text-xs font-mono text-rose-400 font-semibold">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-rose-500/15 text-rose-300 rounded-xl text-xs font-medium border border-rose-500/20 hover:bg-rose-500/25 cursor-pointer transition-all"
        >
          Re-establish Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7 select-text">
      {/* Upper header action header bar */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-white leading-none">Operational Dashboard</h1>
          <p className="text-xs text-slate-450 font-mono font-medium">REAL-TIME CENTRAL TELEMETRY</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-medium"
        >
          <RefreshCw size={13} />
          <span>Sync telemetry</span>
        </button>
      </div>

      {/* Grid of widgets metadata cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-between shadow-2xl hover:border-white/10 transition-colors">
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Total Users</span>
            <h4 className="text-2xl font-bold text-white tracking-tight">{metrics?.totalUsers || 0}</h4>
            <p className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <ArrowUpRight size={10} />
              <span>Normal users + Admin</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Users size={18} />
          </div>
        </div>

        <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-between shadow-2xl hover:border-white/10 transition-colors">
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Active/Online</span>
            <h4 className="text-2xl font-bold text-white tracking-tight">
              {metrics?.activeUsers || 0} / <span className="text-emerald-400 text-lg">{metrics?.onlineUsers || 0}</span>
            </h4>
            <p className="text-[10px] text-slate-500 font-mono">
              <span className="text-emerald-400 font-bold font-mono">● {metrics?.onlineUsers || 0} connected</span> sockets now
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Activity size={18} />
          </div>
        </div>

        <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-between shadow-2xl hover:border-white/10 transition-colors">
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Active Workspaces</span>
            <h4 className="text-2xl font-bold text-white tracking-tight">{metrics?.totalWorkspaces || 0}</h4>
            <p className="text-[10px] text-indigo-400 font-mono">Rooms & Collab environments</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Layers size={18} />
          </div>
        </div>

        <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-between shadow-2xl hover:border-white/10 transition-colors">
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">AI Requests (Today)</span>
            <h4 className="text-2xl font-bold text-white tracking-tight">{metrics?.aiRequestsToday || 0}</h4>
            <p className="text-[10px] text-indigo-400 font-mono">Avg Latency {metrics?.averageResponseTime || 480}ms</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
            <Zap size={18} />
          </div>
        </div>
      </div>

      {/* Visual Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: AI usage trends */}
        <div className="p-6 bg-slate-905/40 border border-white/5 rounded-2xl space-y-4">
          <div>
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-widest leading-none">Diagnostic trends</span>
            <h3 className="text-sm font-semibold text-slate-200 mt-1">Daily AI Processing volume</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.dailyAiUsage || []}>
                <defs>
                  <linearGradient id="aiUsageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.03} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} className="font-mono" />
                <YAxis stroke="#64748b" fontSize={10} className="font-mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#ffffff', fontSize: '11px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#aiUsageGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cumulative User growth */}
        <div className="p-6 bg-slate-905/40 border border-white/5 rounded-2xl space-y-4">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-widest leading-none">Growth metrics</span>
            <h3 className="text-sm font-semibold text-slate-200 mt-1">Active Accounts Expansion</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.usergrowth || []}>
                <defs>
                  <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.03} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} className="font-mono" />
                <YAxis stroke="#64748b" fontSize={10} className="font-mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#ffffff', fontSize: '11px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="users" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#userGrowthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System state and Activity log panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health Specs */}
        <div className="p-6 bg-slate-905/40 border border-white/5 rounded-2xl space-y-5 lg:col-span-1">
          <div>
            <span className="text-[10px] font-mono text-[#f59e0b] uppercase font-bold tracking-widest">Hardware / Node Node metrics</span>
            <h3 className="text-sm font-semibold text-slate-200 mt-1">Telemetry Diagnostics</h3>
          </div>

          <div className="space-y-4 font-sans text-xs">
            {/* CPU usage */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-450 font-bold">CPU Core Load</span>
                <span className="text-slate-100 font-semibold">{system?.cpuUsage || 14}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/5">
                <div 
                  className="bg-indigo-550 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${system?.cpuUsage || 14}%` }}
                />
              </div>
            </div>

            {/* RAM usage */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-450 font-bold">Memory Pool Allocation</span>
                <span className="text-slate-100 font-semibold">{system?.memoryUsage || 42}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/5">
                <div 
                  className="bg-indigo-550 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${system?.memoryUsage || 42}%` }}
                />
              </div>
            </div>

            {/* Micro Details List */}
            <div className="pt-4 border-t border-white/5 space-y-3 font-mono text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">DB ENGINE_OK</span>
                <span className="text-cyan-400 font-bold uppercase">{system?.databaseState || 'Mongoose Connect'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">GATEWAY_CONN</span>
                <span className="text-emerald-400 font-bold uppercase">Online websocket</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">PING TRANSIT</span>
                <span className="text-indigo-400 font-bold">{system?.pingMs || 8}ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Audits */}
        <div className="p-6 bg-slate-905/40 border border-white/5 rounded-2xl space-y-4 lg:col-span-2">
          <div>
            <span className="text-[10px] font-mono text-[#a855f7] uppercase font-bold tracking-widest">Realtime logs</span>
            <h3 className="text-sm font-semibold text-slate-200 mt-1">Incident Registry</h3>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-10">No recent incidents recorded.</p>
            ) : (
              recentLogs.slice(0, 4).map((log, index) => (
                <div key={log.id || `log-${index}`} className="p-3.5 bg-slate-950/20 border border-white/5 rounded-xl hover:border-slate-800 transition-colors select-text">
                  <div className="flex justify-between items-center text-[10px] mb-1 font-mono">
                    <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                      log.action.includes('FAILED') || log.action.includes('BLOCK') ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20' : 'bg-slate-300/10 text-slate-350 border border-white/5'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs font-sans text-slate-350 break-words line-clamp-2">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
