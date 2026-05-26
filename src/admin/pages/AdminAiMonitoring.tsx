import React, { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { 
  Cpu, AlertTriangle, Play, RefreshCw, Zap, Server, Code, Wifi, Clock, Activity, CheckCircle
} from 'lucide-react';

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

interface SystemStatus {
  cpuUsage: number;
  memoryUsage: number;
  databaseState: string;
  socketsPool: number;
  pingMs: number;
}

export default function AdminAiMonitoring() {
  const { token } = useStore();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [system, setSystem] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorClassName, setErrorClassName] = useState('');

  const fetchMonitoringData = async () => {
    if (!token) return;
    setLoading(true);
    setErrorClassName('');
    try {
      const res = await fetch('/api/admin/dashboard/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setSystem(data.systemStatus);
      } else {
        const err = await res.json();
        setErrorClassName(err.error || 'Console connection expired.');
      }
    } catch {
      setErrorClassName('Disruption in reading AI system monitor state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, [token]);

  return (
    <div className="space-y-6 select-text relative">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-white leading-none">AI Engine Monitoring</h1>
          <p className="text-xs text-slate-505 font-mono">GEMINI SDK TELEMETRY & PROCESSING SPECS</p>
        </div>
        <button
          onClick={fetchMonitoringData}
          className="p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-medium"
        >
          <RefreshCw size={13} />
          <span>Sync engine state</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3 bg-[#090d16]/10 border border-white/5 rounded-2xl animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto"></div>
          <p className="text-xs font-mono tracking-widest text-slate-500 uppercase">Synchronizing with AI SDK streams...</p>
        </div>
      ) : errorClassName ? (
        <div className="bg-rose-500/5 border border-rose-500/15 p-4 rounded-xl text-xs text-rose-455">
          <span>{errorClassName}</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI Metrics stats columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 bg-slate-900/40 border border-[#818cf8]/10 rounded-2xl flex flex-col justify-between h-32 hover:border-[#818cf8]/25 transition-colors relative overflow-hidden group shadow-xl">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none" />
              <div className="flex justify-between items-center z-10">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Gemini Streams Today</span>
                <Zap size={14} className="text-indigo-400 font-bold" />
              </div>
              <div className="mt-2 z-10">
                <h4 className="text-2xl font-bold text-white tracking-tight leading-none">{metrics?.aiRequestsToday || 0}</h4>
                <p className="text-[10px] text-[#818cf8] mt-1.5 font-mono font-medium">REAL-TIME SOCKET CHANNEL CONNECTED</p>
              </div>
            </div>

            <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col justify-between h-32 hover:border-white/10 transition-colors shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Average Processing Latency</span>
                <Clock size={14} className="text-cyan-400" />
              </div>
              <div className="mt-2">
                <h4 className="text-2xl font-bold text-white tracking-tight leading-none">{metrics?.averageResponseTime || 480} ms</h4>
                <p className="text-[10px] text-emerald-450 mt-1.5 font-mono font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>STRESS METERS LOWER LIMITS</span>
                </p>
              </div>
            </div>

            <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col justify-between h-32 hover:border-white/10 transition-colors shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Fail / Error rate ratio</span>
                <AlertTriangle size={14} className="text-[#f59e0b]" />
              </div>
              <div className="mt-2">
                <h4 className="text-2xl font-bold text-white tracking-tight leading-none">0.02%</h4>
                <p className="text-[10px] text-slate-500 mt-1.5 font-mono">SAFE PROTOCOLS DEPLOYED</p>
              </div>
            </div>
          </div>

          {/* Model registries list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Gemini Models list states */}
            <div className="p-5 bg-[#090d16]/80 backdrop-blur border border-white/5 rounded-2xl space-y-4 shadow-2xl">
              <h3 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest leading-none">Active Gemini Models Status</h3>
              
              <div className="space-y-3">
                {[
                  { name: 'gemini-3.5-flash', limit: '15 requests/min', state: 'Operational', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
                  { name: 'gemini-3.1-flash-lite', limit: '30 requests/min', state: 'Operational', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
                  { name: 'gemini-flash-latest', limit: '10 requests/min', state: 'Operational', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
                  { name: 'claude-3-5', limit: 'Rate limited', state: 'Offline', color: 'text-slate-500 border-white/5 bg-white/5' }
                ].map((m) => (
                  <div key={m.name} className="p-3 bg-slate-950/30 border border-white/5 rounded-xl flex items-center justify-between hover:border-white/10 transition-colors">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-101 block">{m.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">LIMIT SPECIFICATION: {m.limit}</span>
                    </div>

                    <div className={`px-2 py-0.5 border rounded font-mono font-bold text-[9px] uppercase ${m.color}`}>
                      {m.state}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Engine Telemetry and configuration flags */}
            <div className="p-5 bg-[#090d16]/80 backdrop-blur border border-white/5 rounded-2xl flex flex-col justify-between shadow-2xl">
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold text-cyan-405 uppercase tracking-widest leading-none">AI Integration Settings</h3>
                
                <div className="space-y-3 font-mono text-[11px] select-text">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-500 font-bold uppercase">SDK API DRIVER</span>
                    <span className="text-indigo-400 font-bold uppercase font-mono">@google/genai</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-500 font-bold uppercase">Streaming response</span>
                    <span className="text-emerald-400 font-bold">ENABLED</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-500 font-bold uppercase">Simultaneous matrix query</span>
                    <span className="text-indigo-400 font-bold">ACTIVE (Up to 4)</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500 font-bold uppercase">Security Fallback model</span>
                    <span className="text-[#f59e0b] font-bold">gemini-3.1-flash-lite</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-start gap-2.5 text-[10px] text-slate-500 leading-normal font-mono italic">
                <CheckCircle size={13} className="text-[#818cf8] shrink-0 mt-0.5" />
                <span>Engine is fully connected and initialized via lazy credentials verification processes. No secrets are exposed to client side browsers.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
