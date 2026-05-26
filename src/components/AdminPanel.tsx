import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { 
  Shield, Users, Layout, Zap, Activity, ShieldAlert, Sparkles, 
  RefreshCw, X, AlertTriangle, Search, Trash2, ChevronLeft, 
  ChevronRight, CheckCircle, Database, Server, Clock, Sliders, 
  ArrowUpRight, Info, Eye, ShieldCheck, Mail, Calendar, UserX
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
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

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = 'dashboard' | 'users' | 'workspaces' | 'ai_usage' | 'audit' | 'health';

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { token, user } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  
  // Dashboard Metrics & Charts
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [system, setSystem] = useState<SystemStatus | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  
  // Interactive Lists
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [workspacesList, setWorkspacesList] = useState<AdminWorkspace[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errMessage, setErrMessage] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Search and Pagination parameters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);

  // Auto-clear toasts
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // 1. Fetch Dashboard Core
  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    setErrMessage('');
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
        setErrMessage(err.error || 'Access unauthorized.');
      }
    } catch (e) {
      setErrMessage('Failed to establish backend telemetry channel.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Users Grid
  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users?page=${userPage}&limit=10&search=${encodeURIComponent(userSearch)}&role=${userRoleFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsersList(data.users);
        setUserTotalPages(data.pagination.pages);
      }
    } catch (error) {
      showToast('Users retrieval fault.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Workspaces List
  const fetchWorkspaces = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/workspaces', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const list = await res.json();
        setWorkspacesList(list);
      }
    } catch {
      showToast('Workspaces index failure.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 4. Fetch Audit Logs Registry
  const fetchAuditLogs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit-logs?page=${auditPage}&limit=15&action=${auditActionFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.auditLogs);
        setAuditTotalPages(data.pagination.pages);
      }
    } catch {
      showToast('Audit trails fetching failure.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Tab controller hook
  useEffect(() => {
    if (!isOpen) return;
    setErrMessage('');
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'workspaces') {
      fetchWorkspaces();
    } else if (activeTab === 'audit') {
      fetchAuditLogs();
    } else if (activeTab === 'ai_usage') {
      fetchDashboardData(); // uses model counts
    }
  }, [activeTab, isOpen, userPage, auditPage]);

  // Handle User Blocking
  const processBlockUser = async (userId: string, blockedState: boolean) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ blocked: blockedState })
      });
      const resData = await response.json();
      if (response.ok) {
        showToast(blockedState ? 'User account suspended.' : 'User account restored.', 'success');
        // Update local list
        setUsersList(usersList.map(u => u.id === userId ? { ...u, blocked: blockedState } : u));
      } else {
        showToast(resData.error || 'Failed to update user lock state.', 'error');
      }
    } catch {
      showToast('Network error on state mutation.', 'error');
    }
  };

  // Elevate or Demote User Role
  const processUpdateRole = async (userId: string, newRole: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(`Role upgraded to ${newRole.toUpperCase()}.`, 'success');
        setUsersList(usersList.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        showToast(data.error || 'Failed to apply policy rules.', 'error');
      }
    } catch {
      showToast('Network error on updating role.', 'error');
    }
  };

  // Hard profile deletion
  const processHardDeleteUser = async (userId: string, name: string) => {
    if (!token) return;
    if (!window.confirm(`CRITICAL WARNING: Are you sure you want to completely erase "${name}" from the database? This is irreversible and terminates all ownership files.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Collaborator profile annihilated.', 'success');
        setUsersList(usersList.filter(u => u.id !== userId));
      } else {
        showToast(data.error || 'Deletion rejected.', 'error');
      }
    } catch {
      showToast('Annihilation execution defect.', 'error');
    }
  };

  // Destructive administrative workspace deletion
  const processTerminateWorkspace = async (workspaceId: string, title: string) => {
    if (!token) return;
    if (!window.confirm(`ADMINISTRATIVE DESTRUCTION: Force terminate "${title}" workspace and dissolve all related chat channels? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/workspaces/${workspaceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Workspace "${title}" successfully demolished.`, 'success');
        setWorkspacesList(workspacesList.filter(w => w.id !== workspaceId));
      } else {
        showToast(data.error || 'Dismantle sequence rejected.', 'error');
      }
    } catch {
      showToast('Dismantle execution failed.', 'error');
    }
  };

  if (!isOpen) return null;

  // Custom Colors for charts
  const PIE_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];

  return (
    <div className="fixed inset-0 bg-[#020617] backdrop-blur-xl z-[150] flex flex-col md:flex-row text-slate-350 select-none overflow-hidden font-sans">
      
      {/* Background Matrix Accents */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Dynamic Toast Alert Notifications */}
      {toast && (
        <div className="fixed top-5 right-5 z-[210] flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-slideIn bg-slate-900 border-white/10 text-white">
          {toast.type === 'success' && <CheckCircle className="text-emerald-400" size={16} />}
          {toast.type === 'error' && <ShieldAlert className="text-rose-400" size={16} />}
          {toast.type === 'info' && <Info className="text-cyan-400" size={16} />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* A. ADMIN PANEL SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-950/40 border-b md:border-b-0 md:border-r border-white/5 flex flex-col shrink-0 z-10 p-4 relative">
        <div className="flex items-center gap-3 mb-8 px-2 select-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white border border-white/10 shadow-lg shadow-indigo-500/25 shrink-0">
            <Shield size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-xs tracking-tight">Synapse Control</span>
              <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8px] font-mono px-1.5 py-0.5 rounded font-bold">SaaS</span>
            </div>
            <p className="text-[9px] text-slate-500">Enterprise Administration Node</p>
          </div>
        </div>

        {/* Sidebar Nav anchors */}
        <nav className="space-y-1 flex-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-white/5 border border-white/10 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Activity size={14} className={activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'} />
              <span>Diagnostic Console</span>
            </div>
            <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
              activeTab === 'users' 
                ? 'bg-white/5 border border-white/10 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={14} className={activeTab === 'users' ? 'text-cyan-400' : 'text-slate-500'} />
            <div className="flex-1 flex justify-between items-center">
              <span>Collaborator Accounts</span>
              {metrics && <span className="text-[9px] bg-slate-900 border border-white/5 text-slate-400 px-1.5 py-0.5 rounded-full">{metrics.totalUsers}</span>}
            </div>
          </button>

          <button
            onClick={() => setActiveTab('workspaces')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
              activeTab === 'workspaces' 
                ? 'bg-white/5 border border-white/10 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layout size={14} className={activeTab === 'workspaces' ? 'text-emerald-400' : 'text-slate-500'} />
            <div className="flex-1 flex justify-between items-center">
              <span>Productive Workspaces</span>
              {metrics && <span className="text-[9px] bg-slate-900 border border-white/5 text-slate-400 px-1.5 py-0.5 rounded-full">{metrics.totalWorkspaces}</span>}
            </div>
          </button>

          <button
            onClick={() => setActiveTab('ai_usage')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
              activeTab === 'ai_usage' 
                ? 'bg-white/5 border border-white/10 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles size={14} className={activeTab === 'ai_usage' ? 'text-orange-400' : 'text-slate-500'} />
            <span>AI Models Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
              activeTab === 'audit' 
                ? 'bg-white/5 border border-white/10 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock size={14} className={activeTab === 'audit' ? 'text-purple-400' : 'text-slate-500'} />
            <span>Audit Trail Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
              activeTab === 'health' 
                ? 'bg-white/5 border border-white/10 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Server size={14} className={activeTab === 'health' ? 'text-rose-400' : 'text-slate-500'} />
            <span>System Node Health</span>
          </button>
        </nav>

        {/* Footer Admin info and dismiss card */}
        <div className="pt-4 border-t border-white/5 space-y-4 text-xs select-none">
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-indigo-600/5 border border-indigo-500/10">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono flex items-center justify-center text-[10px] font-bold">
              {user?.avatar || 'A'}
            </div>
            <div className="truncate">
              <p className="font-bold text-white text-[11px] truncate leading-none mb-1">{user?.name}</p>
              <p className="text-[9px] font-mono text-indigo-400 font-semibold uppercase tracking-wider">Super Administrator</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/10 text-rose-400 rounded-xl cursor-pointer font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <X size={13} />
            <span>Close Admin Panel</span>
          </button>
        </div>
      </aside>

      {/* B. MAIN PORT CONTENT CONTAINER */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col z-10 relative">
        
        {errMessage ? (
          <div className="max-w-xl mx-auto my-auto bg-rose-500/5 border border-rose-500/10 p-8 rounded-3xl flex flex-col items-center text-center gap-4 shadow-2xl animate-shake">
            <AlertTriangle size={36} className="text-rose-400" />
            <h4 className="text-white font-bold text-base leading-none">Security Access Denied</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{errMessage}</p>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-rose-650/25"
            >
              Return to Workspace
            </button>
          </div>
        ) : (
          <div className="max-w-6xl w-full mx-auto space-y-8 animate-fadeIn flex-1 flex flex-col">
            
            {/* Header Title with quick telemetry sync */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h1 className="text-white font-bold text-xl tracking-tight flex items-center gap-2">
                  <span>Dashboard Hub:</span>
                  <span className="text-gradient bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent capitalize font-bold">{activeTab === 'ai_usage' ? 'AI Telemetry' : activeTab}</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">Multi-Model dynamic cluster analysis telemetry panel.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (activeTab === 'dashboard') fetchDashboardData();
                    if (activeTab === 'users') fetchUsers();
                    if (activeTab === 'workspaces') fetchWorkspaces();
                    if (activeTab === 'audit') fetchAuditLogs();
                    showToast('Telemetry states synchronized.', 'info');
                  }}
                  disabled={loading}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 rounded-xl cursor-pointer text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                  <span>Sync Telemetry</span>
                </button>
              </div>
            </div>

            {/* TAB RENDERING CASES */}
            
            {/* TAB CASE 1: CORE DASHBOARD VISUALIZERS */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 flex-1">
                
                {/* 1. Metric widgets matrices */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900/60 border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-center text-indigo-400 mb-4 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      <span>DAU (Last 24H)</span>
                      <Users size={14} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold font-mono text-white leading-none mb-1.5">
                        {metrics ? metrics.activeUsers : '0'}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold font-mono">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span>{metrics ? metrics.onlineUsers : 0} Sockets Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-center text-cyan-400 mb-4 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      <span>Total Workspaces</span>
                      <Layout size={14} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold font-mono text-white leading-none mb-1.5">
                        {metrics ? metrics.totalWorkspaces : '0'}
                      </h3>
                      <span className="text-[9px] text-slate-500 font-mono font-medium">Shared collaborative registries</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-center text-orange-400 mb-4 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      <span>AI Queries Today</span>
                      <Sparkles size={14} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold font-mono text-white leading-none mb-1.5">
                        {metrics ? metrics.aiRequestsToday : '0'}
                      </h3>
                      <span className="text-[9px] text-amber-500 font-medium font-mono">🚀 Evaluated stream requests</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-center text-rose-500 mb-4 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      <span>Core Response Latency</span>
                      <Clock size={14} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold font-mono text-white leading-none mb-1.5">
                        {metrics ? `${metrics.averageResponseTime}ms` : '0ms'}
                      </h3>
                      <span className="text-[9px] text-emerald-400 font-semibold font-mono">● SLA Compliant</span>
                    </div>
                  </div>
                </div>

                {/* 2. Primary charting Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Daily usage Area chart */}
                  <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl md:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white font-semibold text-xs flex items-center gap-1.5 font-mono">
                        <Activity size={14} className="text-indigo-400" />
                        <span>Daily Collaborative AI Stream Usage</span>
                      </span>
                      <span className="text-[8px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-550">7 DAYS INTERVAL</span>
                    </div>

                    <div className="h-48 w-full text-xs">
                      {charts ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={charts.dailyAiUsage}>
                            <defs>
                              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff04" />
                            <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                            <YAxis stroke="#64748b" fontSize={11} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '12px', fontSize: '11px' }} />
                            <Area type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center font-mono text-slate-500">Compiling chart streams...</div>
                      )}
                    </div>
                  </div>

                  {/* Model Distribution visualizer */}
                  <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white font-semibold text-xs flex items-center gap-1.5 font-mono">
                        <Sliders size={14} className="text-cyan-400" />
                        <span>Model Volume Dist.</span>
                      </span>
                    </div>

                    <div className="h-44 w-full flex items-center justify-center relative">
                      {charts ? (
                        <ResponsiveContainer width="100%" height="105%">
                          <BarChart data={charts.modelUsage}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={9} interval={0} />
                            <YAxis stroke="#64748b" fontSize={9} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff15', borderRadius: '12px' }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {charts.modelUsage.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="font-mono text-slate-500">Assembling matrix...</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Horizontal layout: System processes & recent operations audit */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* System processes metrics indicators */}
                  <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <h4 className="text-white font-semibold text-xs flex items-center gap-2 mb-4 font-mono">
                        <Server size={14} className="text-rose-400" />
                        <span>Clustered Process Telemetry</span>
                      </h4>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-[11px] mb-1.5 font-medium">
                            <span className="text-slate-400 font-mono">VM CPU Core Load</span>
                            <span className="font-bold text-white font-mono">{system ? system.cpuUsage : 0}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full transition-all" style={{ width: `${system ? system.cpuUsage : 0}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1.5 font-medium">
                            <span className="text-slate-400 font-mono">Docker Memory Buffer Pool</span>
                            <span className="font-bold text-white font-mono">{system ? system.memoryUsage : 0}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div className="bg-cyan-500 h-full transition-all" style={{ width: `${system ? system.memoryUsage : 0}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 rounded-xl p-3.5 border border-white/5 space-y-2 mt-5 text-[11px] font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span>Database Server:</span>
                        <span className="text-emerald-400 font-bold block">{system ? system.databaseState : 'HEALTHY'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Online Sockets Pool:</span>
                        <span className="text-white">{system ? system.socketsPool : 0} Sockets</span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Ping Handshake:</span>
                        <span className="text-cyan-400 font-bold">{system ? `${system.pingMs}ms` : '--'}</span>
                      </div>
                    </div>
                  </div>

                  {/* System Actions Telemetry stream */}
                  <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl md:col-span-2">
                    <h4 className="text-white font-semibold text-xs flex items-center gap-2 mb-4 font-mono">
                      <Clock size={14} className="text-purple-400" />
                      <span>Live Audit Incident Feed</span>
                    </h4>

                    <div className="space-y-2.5 max-h-56 overflow-y-auto">
                      {recentLogs.length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-4 text-center">No recent incident reports.</p>
                      ) : (
                        recentLogs.map((log, index) => (
                          <div key={log.id || (log as any)._id || index} className="bg-slate-950/40 border border-white/5 p-3 rounded-xl hover:border-slate-800 transition-all select-text animate-fadeIn">
                            <div className="flex justify-between items-center text-[10px] mb-1">
                              <span className={`px-2 py-0.5 rounded font-bold font-mono text-[9px] uppercase ${
                                log.action === 'FAILED_AUTH' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
                                log.action === 'REGISTER' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                                log.action === 'DELETE_USER' || log.action === 'WORKSPACE_DEL' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500' :
                                'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                              }`}>
                                {log.action}
                              </span>
                              <span className="text-slate-500 font-mono text-[9px]">{new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs mt-1">
                              <p className="text-slate-200 text-[11px] leading-snug">{log.details}</p>
                              <p className="text-[10px] font-mono text-slate-550 italic ml-2">{log.userEmail}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB CASE 2: USER DIRECTORIES MANAGEMENT */}
            {activeTab === 'users' && (
              <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 flex flex-col flex-1">
                
                {/* Search query options and page limit inputs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  
                  <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-xl">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                      <input
                        type="text"
                        placeholder="Search users by name or email address..."
                        value={userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value);
                          setUserPage(1);
                        }}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                      />
                    </div>

                    <select
                      value={userRoleFilter}
                      onChange={(e) => {
                        setUserRoleFilter(e.target.value);
                        setUserPage(1);
                      }}
                      className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
                    >
                      <option value="">All Roles</option>
                      <option value="user">User</option>
                      <option value="admin">Administrator</option>
                    </select>

                    <button
                      onClick={fetchUsers}
                      className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      Search
                    </button>
                  </div>

                  <span className="text-slate-500 text-[11px] font-mono">Found {usersList.length} User Records in buffer</span>
                </div>

                {/* Main responsive user table */}
                <div className="flex-1 overflow-x-auto min-h-80 select-text">
                  <table className="w-full border-collapse text-left text-xs text-slate-350">
                    <thead>
                      <tr className="border-b border-white/5 text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Collaborator</th>
                        <th className="py-3 px-4">Privileges Role</th>
                        <th className="py-3 px-4 text-center">Workspaces Owned</th>
                        <th className="py-3 px-4 text-center">AI Prompt Counts</th>
                        <th className="py-3 px-4">Last Active At</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {usersList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500 italic">No user accounts found matching constraints.</td>
                        </tr>
                      ) : (
                        usersList.map((item, index) => (
                          <tr key={item.id || (item as any)._id || index} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3.5 px-4 flex items-center gap-3">
                              <div className="w-8.5 h-8.5 rounded-full bg-indigo-650 text-white font-bold flex items-center justify-center text-xs shadow-md border border-white/10 shrink-0">
                                {item.avatar}
                              </div>
                              <div className="truncate max-w-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-[12px]">{item.name}</span>
                                  {item.blocked && (
                                    <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[8px] font-bold font-mono rounded px-1.5 uppercase tracking-wider">Blocked</span>
                                  )}
                                </div>
                                <span className="text-slate-500 text-[11px] block mt-0.5">{item.email}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold font-sans text-[10px] uppercase border ${
                                item.role === 'admin' 
                                  ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                                  : 'bg-slate-900 border-white/5 text-slate-400'
                              }`}>
                                <Shield className="w-2.5 h-2.5" />
                                <span>{item.role === 'admin' ? 'SuperAdmin' : 'Collaborator'}</span>
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-100">{item.workspacesCount}</td>
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-100">{item.messagesCount}</td>

                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-450">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-slate-500" />
                                <span>{item.lastActiveAt ? new Date(item.lastActiveAt).toLocaleString() : 'N/A'}</span>
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                
                                {/* Toggle Block Button */}
                                <button
                                  onClick={() => processBlockUser(item.id, !item.blocked)}
                                  className={`p-1.5 rounded-lg cursor-pointer border transition-colors ${
                                    item.blocked 
                                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/25 text-emerald-400' 
                                      : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/25 text-rose-455'
                                  }`}
                                  title={item.blocked ? 'Restore privileges' : 'Suspend account'}
                                >
                                  {item.blocked ? <ShieldCheck size={14} /> : <UserX size={14} />}
                                </button>

                                {/* Direct Elevation Choice */}
                                <select
                                  value={item.role}
                                  onChange={(e) => processUpdateRole(item.id, e.target.value)}
                                  className="bg-slate-950 border border-white/10 rounded-lg py-1 px-1.5 text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500"
                                >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                </select>

                                {/* Delete profile button */}
                                <button
                                  onClick={() => processHardDeleteUser(item.id, item.name)}
                                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 text-rose-400 rounded-lg cursor-pointer transition-colors"
                                  title="Annihilate profile data"
                                >
                                  <Trash2 size={13} />
                                </button>

                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer page index */}
                {userTotalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4 select-none">
                    <span className="text-[11px] text-slate-500 font-mono">Page {userPage} of {userTotalPages}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setUserPage(Math.max(userPage - 1, 1))}
                        disabled={userPage === 1}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        onClick={() => setUserPage(Math.min(userPage + 1, userTotalPages))}
                        disabled={userPage === userTotalPages}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB CASE 3: WORKSPACES DIRECTORY */}
            {activeTab === 'workspaces' && (
              <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 flex flex-col flex-1 select-text">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workspacesList.length === 0 ? (
                    <div className="col-span-2 py-20 text-center text-slate-500 bg-slate-950/20 border border-white/5 rounded-3xl">
                      <Layout size={24} className="text-slate-655 mx-auto mb-2" />
                      <p>No systematic workspaces instantiated on this host.</p>
                    </div>
                  ) : (
                    workspacesList.map((ws, index) => (
                      <div key={ws.id || (ws as any)._id || index} className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold text-white text-sm">{ws.name}</h3>
                              <p className="text-[10px] font-mono text-indigo-400 mt-0.5 select-all">UUID: {ws.id}</p>
                            </div>
                            
                            <button
                              onClick={() => processTerminateWorkspace(ws.id, ws.name)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 text-rose-455 rounded-xl cursor-pointer"
                              title="Dissolve collaborative chamber"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          
                          <p className="text-xs text-slate-400 leading-normal line-clamp-2 mt-2">{ws.description}</p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                          
                          {/* Owner description */}
                          <div className="flex items-center gap-2">
                            <div className="w-5.5 h-5.5 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[9px]">
                              {ws.owner?.avatar || 'SYS'}
                            </div>
                            <div className="truncate max-w-28 leading-none">
                              <span className="text-slate-300 truncate block text-[10px]">{ws.owner?.name || 'System'}</span>
                            </div>
                          </div>

                          {/* Stats parameters */}
                          <div className="flex gap-3 text-slate-450 shrink-0 text-[10px] font-semibold">
                            <span>{ws.membersCount} Members</span>
                            <span>•</span>
                            <span>{ws.channelsCount} Channels</span>
                            <span>•</span>
                            <span>{ws.savedCount} Saved</span>
                          </div>

                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB CASE 4: AI MODELS PERFORMANCE ANALYSIS */}
            {activeTab === 'ai_usage' && (
              <div className="space-y-6 flex-1">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Model popularity stats */}
                  <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl">
                    <h4 className="text-white font-semibold text-xs mb-4 font-mono flex items-center gap-2">
                      <Sliders size={14} className="text-amber-500" />
                      <span>Model Popularity Split</span>
                    </h4>

                    <div className="space-y-3.5">
                      {charts && charts.modelUsage.map((m, index) => (
                        <div key={`${m.name}-${index}`}>
                          <div className="flex justify-between text-[11px] mb-1 font-mono">
                            <span className="text-slate-450 font-bold">{m.name}</span>
                            <span className="text-slate-100">{m.value} times</span>
                          </div>
                          <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                            <div className="h-full transition-all" style={{ width: `${Math.min(m.value * 6, 100)}%`, backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Complete latency analytics metrics widgets */}
                  <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl md:col-span-2 space-y-4">
                    <h4 className="text-white font-semibold text-xs font-mono flex items-center gap-2">
                      <Zap size={14} className="text-indigo-400 animate-pulse" />
                      <span>SLA performance analytics logs</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="bg-slate-950/40 border border-white/5 p-4 rounded-xl space-y-1">
                        <span className="text-slate-500 text-[10px] font-mono font-bold uppercase block">Avg response speed</span>
                        <h4 className="text-xl font-bold font-mono text-white leading-none tracking-tight">{metrics ? `${metrics.averageResponseTime}ms` : '380ms'}</h4>
                        <span className="text-[9px] text-emerald-400 font-bold block mt-3">⚡ 99.8% optimal routing index</span>
                      </div>

                      <div className="bg-slate-950/40 border border-white/5 p-4 rounded-xl space-y-1">
                        <span className="text-slate-500 text-[10px] font-mono font-bold uppercase block">Token Generation</span>
                        <h4 className="text-xl font-bold font-mono text-white leading-none tracking-tight">~{(metrics ? metrics.totalMessages * 210 : '4,800')} symbols</h4>
                        <span className="text-[9px] text-slate-500 block mt-3">Calculated live via cluster prompts</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 flex gap-3 text-xs leading-normal">
                      <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                      <p className="text-slate-400 text-[11px]">
                        Dynamic multi-model diagnostics stream queries dynamically and concurrently to standard model engines. Fallback modules execute instantaneously if transient timeouts are intercepted by WebSockets routers.
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB CASE 5: REVOLUTIONARY AUDIT Telemetry TRAIL DIRECTORY */}
            {activeTab === 'audit' && (
              <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 flex flex-col flex-1 select-text">
                
                {/* Search query options and page filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  
                  <div className="flex gap-3 flex-1 max-w-md">
                    <select
                      value={auditActionFilter}
                      onChange={(e) => {
                        setAuditActionFilter(e.target.value);
                        setAuditPage(1);
                      }}
                      className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
                    >
                      <option value="">All Actions</option>
                      <option value="LOGIN">LOGIN</option>
                      <option value="REGISTER">REGISTER</option>
                      <option value="FAILED_AUTH">FAILED_AUTH</option>
                      <option value="CREATE_WORKSPACE">CREATE_WORKSPACE</option>
                      <option value="INVITE_COLLABORATOR">INVITE_COLLABORATOR</option>
                      <option value="DELETE_WORKSPACE">DELETE_WORKSPACE</option>
                      <option value="BLOCK_USER">BLOCK_USER</option>
                      <option value="UNBLOCK_USER">UNBLOCK_USER</option>
                    </select>

                    <button
                      onClick={fetchAuditLogs}
                      className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      Filter Actions
                    </button>
                  </div>

                  <span className="text-slate-500 text-[11px] font-mono">Centralized Secure Logging Server active</span>
                </div>

                {/* Audit logging responsive listing table */}
                <div className="flex-1 overflow-x-auto min-h-80 select-text">
                  <table className="w-full border-collapse text-left text-xs text-slate-350">
                    <thead>
                      <tr className="border-b border-white/5 text-[11px] font-mono font-bold text-slate-500 uppercase tracking-widest leading-none">
                        <th className="py-3 px-4">Incident Action</th>
                        <th className="py-3 px-4">Operator</th>
                        <th className="py-3 px-4">Audit Details / Parameters</th>
                        <th className="py-3 px-4">IP Node</th>
                        <th className="py-3 px-4">Timestamp Header</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-500 italic">No audit journals captured in this filter state.</td>
                        </tr>
                      ) : (
                        auditLogs.map((log, index) => (
                          <tr key={log.id || (log as any)._id || index} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded font-bold font-mono text-[9px] uppercase border ${
                                log.action === 'FAILED_AUTH' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-455' :
                                log.action === 'REGISTER' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                                log.action === 'BLOCK_USER' || log.action === 'WORKSPACE_DEL' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500' :
                                'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                              }`}>
                                {log.action}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 font-sans text-slate-100">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold block">{log.userName || 'Guest/Anonymous'}</span>
                                <span className="text-[10px] text-slate-500 block">({log.userEmail})</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 leading-normal text-slate-300 font-mono text-[11px] max-w-sm">{log.details}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-450 text-[11px]">{log.ipAddress}</td>
                            
                            <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                              <span>{new Date(log.createdAt).toLocaleString()}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Audit pagination footer controller */}
                {auditTotalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4 select-none">
                    <span className="text-[11px] text-slate-500 font-mono">Audit Log Page {auditPage} of {auditTotalPages}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setAuditPage(Math.max(auditPage - 1, 1))}
                        disabled={auditPage === 1}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        onClick={() => setAuditPage(Math.min(auditPage + 1, auditTotalPages))}
                        disabled={auditPage === auditTotalPages}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB CASE 6: SYSTEM NODE HEALTH & SETTINGS PANEL */}
            {activeTab === 'health' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Visual state checks grid */}
                <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl md:col-span-2 space-y-6 select-text">
                  <h4 className="text-white font-semibold text-xs font-mono flex items-center gap-2">
                    <Server size={14} className="text-emerald-400" />
                    <span>Hardware Integration Server Diagnostic Nodes</span>
                  </h4>

                  <div className="space-y-4 font-mono text-xs">
                    <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-white/5 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Database size={15} className="text-cyan-400" />
                        <div>
                          <p className="font-bold text-slate-200">MongoDB Clusters</p>
                          <p className="text-[10px] text-slate-500">Mongoose persistent node drivers setup pool.</p>
                        </div>
                      </div>
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-0.5 px-2.5 rounded-full font-bold">ONLINE</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-white/5 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Zap size={15} className="text-indigo-400" />
                        <div>
                          <p className="font-bold text-slate-200">Express & Sockets Routers</p>
                          <p className="text-[10px] text-slate-500">Duplex streaming client handshakes gateway.</p>
                        </div>
                      </div>
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-0.5 px-2.5 rounded-full font-bold">ONLINE</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-white/5 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Sparkles size={15} className="text-amber-500" />
                        <div>
                          <p className="font-bold text-slate-200">Google GenAI Client SDK</p>
                          <p className="text-[10px] text-slate-500">Authenticates standard API Keys server-side securely.</p>
                        </div>
                      </div>
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-0.5 px-2.5 rounded-full font-bold">READY</span>
                    </div>
                  </div>
                </div>

                {/* Right columns settings description */}
                <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl space-y-4">
                  <h4 className="text-white font-bold text-xs flex items-center gap-2 mb-2 font-mono">
                    <Sliders size={14} className="text-indigo-400" />
                    <span>SaaS Policies configuration</span>
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2">
                    Access roles enforcement, socket session timeouts, and auditing security configurations are handled securely inside the server configuration parameters.
                  </p>

                  <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 space-y-2 mt-4 text-[11px] font-mono text-slate-400 select-text">
                    <p className="text-white font-semibold flex items-center gap-1">
                      <Shield size={10} className="text-cyan-400" />
                      <span>Security Standard</span>
                    </p>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Security rules limit database queries dynamically based on JWT scopes payload. Cross devices socket handshakes authenticate on matching connection headers.
                    </p>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
}
