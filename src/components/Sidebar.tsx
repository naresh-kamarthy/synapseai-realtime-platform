import React, { useState } from 'react';
import { useStore } from '../store';
import { Hash, LogOut, Plus, Trash2, Shield, FolderPlus, Compass, Terminal, Cpu, AlertTriangle, X } from 'lucide-react';
import { BrandLogoFull } from '../brand';

export default function Sidebar() {
  const {
    user,
    workspaces,
    activeWorkspace,
    conversations,
    activeConversation,
    createWorkspace,
    deleteWorkspace,
    setActiveWorkspace,
    createConversation,
    deleteConversation,
    setActiveConversation,
    logout,
    socketConnected,
    setSidebarOpen
  } = useStore();

  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [showNewChannel, setShowNewChannel] = useState(false);

  // Custom UI Deletion Confirmation States
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    await createWorkspace(newWorkspaceName.trim(), 'Collaborative multi-agent project room.');
    setNewWorkspaceName('');
    setShowNewWorkspace(false);
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    await createConversation(newChannelName.trim());
    setNewChannelName('');
    setShowNewChannel(false);
  };

  const confirmDeleteWorkspace = () => {
    if (workspaceToDelete) {
      deleteWorkspace(workspaceToDelete);
      setWorkspaceToDelete(null);
    }
  };

  const confirmDeleteConversation = () => {
    if (conversationToDelete) {
      deleteConversation(conversationToDelete);
      setConversationToDelete(null);
    }
  };

  const workspaceNameBeingDeleted = workspaces.find(w => w.id === workspaceToDelete)?.name || '';
  const conversationTitleBeingDeleted = conversations.find(c => c.id === conversationToDelete)?.title || '';

  return (
    <aside className="w-72 bg-slate-950/50 backdrop-blur-md border-r border-white/5 flex flex-col h-full text-slate-300 relative">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between select-none">
        <BrandLogoFull subtitle="Multi-Agent Hub" />
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
          <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">{socketConnected ? 'Realtime' : 'Offline'}</span>
        </div>
      </div>

      {/* Main Workspace Section */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 select-none">
          <span>Active Workspaces</span>
          <button 
            type="button"
            onClick={() => setShowNewWorkspace(!showNewWorkspace)} 
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Create Workspace"
          >
            <FolderPlus size={15} />
          </button>
        </div>

        {showNewWorkspace && (
          <form onSubmit={handleCreateWorkspace} className="mb-3 space-y-2">
            <input
              type="text"
              placeholder="Workspace name..."
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              autoFocus
            />
            <div className="flex justify-end gap-1.5 text-[10px]">
              <button 
                type="button" 
                onClick={() => setShowNewWorkspace(false)} 
                className="px-2 py-1 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                Create
              </button>
            </div>
          </form>
        )}

        <div className="space-y-1 max-h-36 overflow-y-auto">
          {workspaces.map((ws) => {
            const isActive = activeWorkspace?.id === ws.id;
            return (
              <div 
                key={ws.id} 
                onClick={() => {
                  setActiveWorkspace(ws);
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-white/5 border border-white/10 text-white font-semibold' 
                    : 'hover:bg-white/5 hover:text-white text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-400' : 'bg-transparent'}`} />
                  <span className="truncate">{ws.name}</span>
                </div>
                {workspaces.length > 1 && ws.ownerId === user?.id && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWorkspaceToDelete(ws.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 rounded transition-all cursor-pointer"
                    title="Delete Workspace"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversations / Collaborative Channel Streams List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 select-none">
            <span>Collaborative Rooms</span>
            {activeWorkspace && (
              <button 
                type="button"
                onClick={() => setShowNewChannel(!showNewChannel)} 
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Create Room"
              >
                <Plus size={15} />
              </button>
            )}
          </div>

          {showNewChannel && (
            <form onSubmit={handleCreateChannel} className="mb-3 space-y-2">
              <input
                type="text"
                placeholder="Room name (e.g. brainstorming)..."
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                autoFocus
              />
              <div className="flex justify-end gap-1.5 text-[10px]">
                <button 
                  type="button" 
                  onClick={() => setShowNewChannel(false)} 
                  className="px-2 py-1 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Join
                </button>
              </div>
            </form>
          )}

          <div className="space-y-0.5">
            {conversations.map((c) => {
              const isActive = activeConversation?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveConversation(c);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                    isActive
                      ? 'bg-white/5 text-white border border-white/10 shadow-lg shadow-slate-950/20'
                      : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Hash size={13} className="text-slate-500 shrink-0" />
                    <span className="truncate">{c.title}</span>
                  </div>
                  {conversations.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConversationToDelete(c.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 rounded transition-all cursor-pointer"
                      title="Delete Channel"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
            
            {conversations.length === 0 && (
              <p className="text-[11px] text-slate-500 italic p-2 select-none">No active rooms in workspace.</p>
            )}
          </div>
        </div>

        {/* System Tech Badges */}
        <div className="pt-2 border-t border-white/5 space-y-2 select-none">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Capabilities</div>
          <div className="space-y-1 text-[11px] text-slate-400">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5">
              <Cpu size={12} className="text-cyan-400" />
              <span>Gemini 3.5 Flash Streaming</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5">
              <Terminal size={12} className="text-pink-400" />
              <span>Multi-Agent Comparison</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5">
              <Compass size={12} className="text-emerald-400" />
              <span>Collaborative Presence</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-white/5 bg-slate-950/50 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md border border-white/10">
            {user?.avatar || 'U'}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
              <Shield size={10} className="text-indigo-400 shrink-0" />
              {user?.role === 'admin' ? 'Workspace Admin' : 'Collaborator'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* --- PRISTINE CUSTOM OVERLAY CONFIRMATIONS --- */}
      {workspaceToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 p-5 rounded-2xl shadow-2xl relative animate-fadeIn">
            <button
              type="button"
              onClick={() => setWorkspaceToDelete(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/10 shrink-0">
                <AlertTriangle size={15} />
              </div>
              <h3 className="font-semibold text-white text-sm">Delete Workspace?</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Are you sure you want to delete <span className="text-white font-medium">"{workspaceNameBeingDeleted}"</span>? This will permanently erase all collaborative rooms and continuous chat message history inside this workspace.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setWorkspaceToDelete(null)}
                className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-slate-350 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteWorkspace}
                className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg transition-colors shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {conversationToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 p-5 rounded-2xl shadow-2xl relative animate-fadeIn">
            <button
              type="button"
              onClick={() => setConversationToDelete(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/10 shrink-0">
                <AlertTriangle size={15} />
              </div>
              <h3 className="font-semibold text-white text-sm">Delete Collaborative Room?</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Are you sure you want to delete <span className="text-white font-medium">"{conversationTitleBeingDeleted}"</span>? This action deletes all shared AI streaming sessions in this room.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConversationToDelete(null)}
                className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-slate-350 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteConversation}
                className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg transition-colors shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
