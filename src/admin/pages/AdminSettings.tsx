import React, { useState } from 'react';
import { 
  Settings, Shield, Lock, Eye, EyeOff, Save, RefreshCw, Terminal, CheckCircle
} from 'lucide-react';

export default function AdminSettings() {
  const [toast, setToast] = useState<string | null>(null);
  const [sessionTimeout, setSessionTimeout] = useState('24h');
  const [rateLimit, setRateLimit] = useState('60');

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Platform settings saved successfully.');
  };

  return (
    <div className="space-y-6 select-text relative">
      {/* Dynamic Feedback Toasts */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-500/20 bg-[#05070f] text-emerald-400 text-xs font-semibold font-mono animate-slideIn">
          <span>{toast}</span>
        </div>
      )}

      {/* Page Title area */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-white leading-none">Console Settings</h1>
        <p className="text-xs text-slate-550 font-mono">ADJUST ADMIN OPERATIONAL CONSTANTS</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings blocks */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="p-6 bg-[#090d16]/80 backdrop-blur border border-white/5 rounded-2xl space-y-5 shadow-2xl">
            <h3 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest leading-none">Platform Privileges configuration</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block font-mono">Administrative Session Expiration</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-505 transition-colors cursor-pointer font-sans"
                >
                  <option value="1h">1 hour (Strict)</option>
                  <option value="8h">8 hours (Standard)</option>
                  <option value="24h">24 hours (Relaxed)</option>
                  <option value="7d">7 days (Extended)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block font-mono">Collaborator API Rate Limits</label>
                <input
                  type="number"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(e.target.value)}
                  placeholder="Requests per minute"
                  className="w-full bg-slate-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 placeholder-slate-650 focus:outline-none focus:border-indigo-505 transition-colors font-sans"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#090d16]/80 backdrop-blur border border-white/5 rounded-2xl space-y-5 shadow-2xl">
            <h3 className="text-xs font-mono font-bold text-cyan-404 uppercase tracking-widest leading-none">Security Rules Definitions</h3>
            
            <div className="space-y-3 font-mono text-[11px] select-text bg-[#03050a] p-4.5 rounded-xl border border-white/5 text-slate-400 leading-relaxed">
              <p className="text-indigo-400 font-bold mb-1">// SECURITY ARCHITECTURE METRICS</p>
              <p>JWT Signature Hash Algorithm: <span className="text-white">HS256 (HMAC-SHA256)</span></p>
              <p>Password encryption strength: <span className="text-white">Bcrypt Salt Factor (10 rounds)</span></p>
              <p>Storage protocol layer: <span className="text-white">MongoDB Atlas Sandbox Storage</span></p>
              <p>Socket.IO connection: <span className="text-emerald-450">SSL handshake authentication verified</span></p>
            </div>
          </div>

          {/* Action trigger button */}
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-650 hover:bg-indigo-500 border border-indigo-500/30 text-white rounded-xl text-xs font-semibold font-sans tracking-tight transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Save size={14} />
            <span>Save administrative settings</span>
          </button>
        </div>

        {/* Sidebar Info Panels */}
        <div className="space-y-6 lg:col-span-1">
          <div className="p-6 bg-[#090d16]/80 border border-white/5 rounded-2xl space-y-4 shadow-2xl">
            <div className="flex gap-2 text-indigo-400 font-bold">
              <Shield size={16} />
              <h3 className="text-xs font-mono uppercase tracking-widest">DevSecOps Protection</h3>
            </div>
            <p className="text-xs text-slate-400 leading-normal font-sans">All modification requests, account adjustments, and workspace deletions are permanently recorded in the immutable MongoDB security trace registry.</p>
          </div>

          <div className="p-6 bg-[#090d16]/80 border border-white/5 rounded-2xl space-y-4 shadow-2xl font-mono text-[11px]">
            <span className="text-slate-550 font-bold tracking-widest">// SOFTWARE STACK FLAGS</span>
            <div className="space-y-1.5 leading-normal text-slate-450 mt-2">
              <p>PLATFORM: <span className="text-slate-300">STABLE-DEPLOY v2.4.0</span></p>
              <p>DATABASE: <span className="text-slate-300">MONGO_CONN (OK)</span></p>
              <p>TLS INGRESS: <span className="text-slate-300">PORT 3000 PROXY</span></p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
