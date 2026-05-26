import React, { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { 
  LineChart, Activity, RefreshCw, BarChartIcon, Cpu, TrendingUp, PieChart, Info
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

interface ChartData {
  dailyAiUsage: { day: string; requests: number }[];
  usergrowth: { day: string; users: number }[];
  workspaceActivity: { day: string; activeRooms: number }[];
  modelUsage: { name: string; value: number }[];
}

export default function AdminAnalytics() {
  const { token } = useStore();
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorClassName, setErrorClassName] = useState('');

  const fetchAnalytics = async () => {
    if (!token) return;
    setLoading(true);
    setErrorClassName('');
    try {
      const res = await fetch('/api/admin/dashboard/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCharts(data.charts);
      } else {
        const err = await res.json();
        setErrorClassName(err.error || 'Access expired.');
      }
    } catch {
      setErrorClassName('Disruption in tele-fetching dynamic analytics index.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  // Color mappings for different models inside the systems
  const COLORS = ['#818cf8', '#06b6d4', '#10b981', '#a855f7', '#ec4899'];

  return (
    <div className="space-y-7 select-text relative">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-white leading-none">Intelligence Analytics</h1>
          <p className="text-xs text-slate-505 font-mono">DENSE QUANTITATIVE INTELLIGENCE</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-medium"
        >
          <RefreshCw size={13} />
          <span>Sync charts</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3 bg-[#090d16]/10 border border-white/5 rounded-2xl animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto"></div>
          <p className="text-xs font-mono tracking-widest text-slate-500 uppercase">Synchronizing analytics records...</p>
        </div>
      ) : errorClassName ? (
        <div className="bg-rose-500/5 border border-rose-500/15 p-4 rounded-xl text-xs text-rose-450">
          <span>{errorClassName}</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Visual grid charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 1: AI usage Area */}
            <div className="p-6 bg-[#090d16]/80 backdrop-blur border border-white/5 rounded-2xl space-y-4 lg:col-span-2 shadow-2xl">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest">Processing metrics</span>
                <h3 className="text-sm font-semibold text-slate-200 mt-1">Simultaneous Prompt streams by day</h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts?.dailyAiUsage || []}>
                    <defs>
                      <linearGradient id="analytGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
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
                    <Area type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#analytGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Model shares */}
            <div className="p-6 bg-[#090d16]/80 backdrop-blur border border-white/5 rounded-2xl space-y-5 lg:col-span-1 flex flex-col justify-between shadow-2xl">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">Model registry</span>
                <h3 className="text-sm font-semibold text-slate-200">Processing distribution ratio</h3>
              </div>

              {/* Progress-styled distribution ratios */}
              <div className="space-y-4 pt-2">
                {charts?.modelUsage && charts.modelUsage.length > 0 ? (
                  charts.modelUsage.map((item, index) => {
                    const total = charts.modelUsage.reduce((acc, cr) => acc + cr.value, 0) || 1;
                    const percent = Math.round((item.value / total) * 100);
                    const color = COLORS[index % COLORS.length];

                    return (
                      <div key={item.name} className="space-y-1 font-sans text-xs select-text">
                        <div className="flex justify-between items-center text-[11px] font-mono">
                          <span className="text-slate-350 font-bold flex items-center gap-1.5 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                            <span>{item.name}</span>
                          </span>
                          <span className="text-slate-100 font-bold">{item.value} calls ({percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/5">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ width: `${percent}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 italic text-center py-10">No model usage recorded.</p>
                )}
              </div>

              <div className="pt-4 border-t border-white/5 flex items-start gap-2.5 text-[10px] text-slate-500 font-mono italic leading-normal">
                <Info size={13} className="text-indigo-400 shrink-0 mt-0.5" />
                <span>Ratios represent real prompts successfully streamed by Google Gemini SDK.</span>
              </div>
            </div>
          </div>

          {/* Chart 3: Workspace Activity growth */}
          <div className="p-6 bg-[#090d16]/80 backdrop-blur border border-white/5 rounded-2xl space-y-4 shadow-2xl">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">Sandbox statistics</span>
              <h3 className="text-sm font-semibold text-slate-200 mt-1">Instantiation volumes of active sandbox rooms</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.workspaceActivity || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.03} />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={10} className="font-mono" />
                  <YAxis stroke="#64748b" fontSize={10} className="font-mono" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#ffffff', fontSize: '11px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '10px' }}
                  />
                  <Bar dataKey="activeRooms" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.8}>
                    {charts?.workspaceActivity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#10b981" fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
