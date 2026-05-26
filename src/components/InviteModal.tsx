import React, { useState } from 'react';
import { useStore, secureFetch } from '../store';
import { Mail, CheckCircle, AlertTriangle, X, Loader2 } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const { activeWorkspace, token } = useStore();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  if (!isOpen || !activeWorkspace) return null;

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setMsg('');

    try {
      const res = await secureFetch(`/api/workspaces/${activeWorkspace.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMsg(`Success: ${data.member.name} has been added to this workspace.`);
        setEmail('');
      } else {
        setStatus('error');
        setMsg(data.error || 'Invitation sequence aborted.');
      }
    } catch (err) {
      setStatus('error');
      setMsg('Network pipeline failed. Try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[150] flex items-start justify-center p-4 overflow-y-auto pt-20 md:pt-28 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="mb-5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
            <Mail size={16} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">Invite Collaborator</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">WORKSPACE: {activeWorkspace.name}</p>
          </div>
        </div>

        {status === 'success' && (
          <div className="bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 rounded-xl px-3 py-2.5 text-xs flex gap-2 mb-4 animate-fadeIn">
            <CheckCircle size={14} className="shrink-0 mt-0.5 text-emerald-400" />
            <p>{msg}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-xl px-3 py-2.5 text-xs flex gap-2 mb-4 animate-fadeIn">
            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-rose-400" />
            <p>{msg}</p>
          </div>
        )}

        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="invite-email" className="text-[10px] uppercase font-bold text-slate-400 block font-mono tracking-wider">Teammate Email Address</label>
            <div className="relative">
              <input
                id="invite-email"
                type="email"
                required
                placeholder="collaborator@synapseai.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-3.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-500 font-sans mt-1">
              Tip: Enter any email to instantly invite or provision them to your team sandbox.
            </p>
          </div>

          <div className="flex gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-slate-350 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold cursor-pointer transition-colors border border-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex-1 py-2.5 bg-gradient-to-r from-indigo-650 to-indigo-500 hover:from-indigo-600 hover:to-indigo-400 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Inviting Teammate...</span>
                </>
              ) : (
                <span>Send Invitation</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
