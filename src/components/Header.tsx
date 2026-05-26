import { useState } from 'react';
import { useStore } from '../store';
import { Users, BookmarkCheck, LayoutGrid, Menu, Shield } from 'lucide-react';
import InviteModal from './InviteModal';
import AdminPanel from './AdminPanel';

export default function Header() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const {
    activeWorkspace,
    activeConversation,
    presence,
    user,
    isSidebarOpen,
    setSidebarOpen,
    isSavedResponsesOpen,
    setSavedResponsesOpen,
    isAdminPanelOpen,
    setAdminPanelOpen,
  } = useStore();

  // Get other users besides current logged-in user to show in the presence list
  const otherPresence = presence.filter(p => p.userId !== user?.id);

  return (
    <>
      <header className="h-16 bg-slate-950/30 backdrop-blur-sm border-b border-white/5 px-4 md:px-6 flex items-center justify-between z-10 select-none">

        {/* Left channel and workspace details */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-1.5 -ml-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer block"
            title="Toggle Sidebar"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-1.5 min-w-0">
            <LayoutGrid size={15} className="text-slate-500 shrink-0" />
            <span className="text-xs text-slate-400 font-medium font-mono truncate max-w-[60px] sm:max-w-[120px]">{activeWorkspace?.name || 'Workspace'}</span>
            <span className="text-slate-600 font-light text-xs shrink-0">/</span>
            <span className="text-sm font-semibold text-white truncate max-w-[90px] sm:max-w-[160px]">
              {activeConversation?.title || 'No Room Selected'}
            </span>
          </div>
        </div>

        {/* Right collaborative presence indicators and side actions */}
        <div className="flex items-center gap-2.5 md:gap-4 shrink-0">

          {/* User Presence Avatar Row */}
          <div className="flex items-center gap-1.5 border-r border-white/5 pr-2.5 md:pr-4">
            <div className="flex -space-x-1.5 md:-space-x-2">
              {presence.slice(0, 3).map((p) => {
                const isMe = p.userId === user?.id;
                const hasActivity = !!p.activity;
                return (
                  <div
                    key={p.userId}
                    className="relative group cursor-help z-0 hover:z-10 focus:z-10"
                    title={`${p.userName} ${isMe ? '(You)' : ''} ${hasActivity ? `- Status: ${p.activity}` : ''}`}
                  >
                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full text-[10px] md:text-xs font-bold font-sans flex items-center justify-center border transition-all ${isMe
                        ? 'bg-gradient-to-br from-indigo-500 to-cyan-400 text-white border-white/20 shadow-lg shadow-indigo-500/10'
                        : 'bg-white/5 text-slate-200 border-white/10'
                      }`}>
                      {p.avatar}
                    </div>

                    {/* Real-time specific action status ring / pulse */}
                    {hasActivity ? (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 border border-slate-950 animate-pulse" />
                    ) : (
                      <span className="absolute -bottom-0.5 -right-0.5. w-2 h-2 bg-emerald-500 rounded-full border border-slate-950" />
                    )}

                    {/* Tooltip detail element */}
                    <div className="absolute right-0 top-10 hidden group-hover:block bg-slate-900/90 backdrop-blur-md border border-white/10 px-2.5 py-1.5 rounded-md text-[11px] text-white whitespace-nowrap shadow-xl z-[99]">
                      <p className="font-semibold">{p.userName} {isMe && '(You)'}</p>
                      <p className="text-[10px] text-slate-455">{hasActivity ? `Activity: ${p.activity}` : 'Online'}</p>
                    </div>
                  </div>
                );
              })}

              {presence.length > 3 && (
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[9px] md:text-[10px] font-bold text-slate-400">
                  +{presence.length - 3}
                </div>
              )}
            </div>

            <div className="hidden lg:block text-[11px] font-mono text-slate-400">
              <span className="text-emerald-400 font-semibold">{presence.length}</span> Active
            </div>
          </div>

          {/* Invite Member Trigger */}
          <button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-2 font-medium text-xs rounded-lg border bg-white/2 hover:bg-white/5 text-slate-300 border-white/5 cursor-pointer transition-all"
            title="Invite Collaborator"
          >
            <Users size={13} className="text-slate-400" />
            <span className="hidden md:inline">Invite Collaborator</span>
          </button>

          {/* Admin Panel Trigger (Role protected) */}
          {user?.role === 'admin' && (
            <button
              type="button"
              onClick={() => setAdminPanelOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-2 font-medium text-xs rounded-lg border bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 border-cyan-500/20 cursor-pointer transition-all"
              title="Admin Console"
            >
              <Shield size={13} className="text-cyan-400" />
              <span className="hidden md:inline">Admin Console</span>
            </button>
          )}

          {/* Saved Responses Trigger */}
          <button
            type="button"
            onClick={() => setSavedResponsesOpen(!isSavedResponsesOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-2 font-medium text-xs rounded-lg border transition-all cursor-pointer ${isSavedResponsesOpen
                ? 'bg-white/10 text-white border-white/20 shadow-lg shadow-slate-950/20'
                : 'bg-white/2 hover:bg-white/5 text-slate-300 border-white/5'
              }`}
            title="Pinned Work"
          >
            <BookmarkCheck size={13} className="text-cyan-400" />
            <span className="hidden md:inline">Pinned Work</span>
          </button>
        </div>
      </header>

      {/* Modals Containers outside header containing block */}
      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
      <AdminPanel isOpen={isAdminPanelOpen} onClose={() => setAdminPanelOpen(false)} />
    </>
  );
}
