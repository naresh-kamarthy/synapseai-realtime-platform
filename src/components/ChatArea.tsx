import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import ReactMarkdown from 'react-markdown';
import { Copy, ClipboardCheck, Bookmark, BookmarkCheck, ArrowDown, Network, ShieldCheck, Zap } from 'lucide-react';

export default function ChatArea() {
  const { 
    messages, 
    activeConversation, 
    saveResponse, 
    savedResponses, 
    deleteSavedResponse 
  } = useStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedIdMap, setCopiedIdMap] = useState<Record<string, boolean>>({});
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Auto scroll to bottom during chunks stream to create fluid continuous feed
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // Show quick jump-down button if user scrolled up more than 300px
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 300);
  };

  const handleCopyText = (text: string, refKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdMap(prev => ({ ...prev, [refKey]: true }));
    setTimeout(() => {
      setCopiedIdMap(prev => ({ ...prev, [refKey]: false }));
    }, 1500);
  };

  // Check if response is already pinned inside SavedResponses to toggle bookmarks
  const isPinned = (prompt: string, modelName: string) => {
    return savedResponses.some(
      s => s.prompt.trim() === prompt.trim() && s.modelName.trim() === modelName.trim()
    );
  };

  const handlePinToggle = async (
    prompt: string, 
    modelName: string, 
    responseContent: string, 
    senderName: string
  ) => {
    const existing = savedResponses.find(
      s => s.prompt.trim() === prompt.trim() && s.modelName.trim() === modelName.trim()
    );

    if (existing) {
      await deleteSavedResponse(existing.id);
    } else {
      await saveResponse(prompt, modelName, responseContent, senderName);
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-transparent text-slate-400 p-6 select-none">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mb-4 border border-white/10 animate-bounce shadow-xl">
          🛰️
        </div>
        <h3 className="text-sm font-semibold text-white">Select a Workspace Room</h3>
        <p className="text-xs text-slate-400 mt-1.5 max-w-sm text-center">
          Rooms handle distinct chat streams. Pick or create a collaborative lounge in the sidebar to start parallel AI diagnostics.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative bg-transparent">
      
      {/* Feed Container */}
      <div 
        ref={scrollRef} 
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-lg mx-auto leading-relaxed bg-white/5 backdrop-blur-md p-8 border border-white/10 rounded-2xl shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center border border-white/20 mb-4 animate-pulse shadow-lg shadow-indigo-500/20">
              <Network className="text-white" size={20} />
            </div>
            <h4 className="text-sm font-semibold text-white">Collaborative Room Initiated</h4>
            <p className="text-xs text-slate-300 mt-2 px-6">
              This space connects multiple workspace users. Type or edit your prompt dynamically at the bottom, toggle compared model matrices, and click **Compare Models** to broadcast real-time streams!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const modelsKeys = Object.keys(msg.modelResponses);
            const gridCols = modelsKeys.length === 1 ? 'grid-cols-1' : modelsKeys.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3';

            return (
              <div key={msg.id} className="space-y-4">
                
                {/* User Prompt Header Block */}
                <div className="flex items-start gap-4 max-w-3xl">
                  <div className="w-8 h-8 rounded-full bg-indigo-650 text-white font-bold flex items-center justify-center text-xs shadow-md border border-white/25 shrink-0 mt-0.5 bg-gradient-to-br from-indigo-500 to-indigo-700">
                    {msg.senderAvatar === 'SYSTEM' ? '⚙️' : msg.senderAvatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{msg.senderName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-100 font-medium mt-1 leading-relaxed bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-xl border border-white/10 inline-block shadow-sm">
                      {msg.promptText}
                    </p>
                  </div>
                </div>

                {/* Multi-Model Comparison cards in dynamic GRID columns */}
                <div className={`grid gap-4 ${gridCols} w-full`}>
                  {modelsKeys.map((modelKey) => {
                    const response = msg.modelResponses[modelKey];
                    const textRefKey = `${msg.id}_${modelKey}`;
                    const customPinned = isPinned(msg.promptText, response.modelName);

                    return (
                      <div 
                        key={modelKey} 
                        className={`bg-slate-950/20 backdrop-blur-sm border rounded-xl flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                          response.status === 'streaming' 
                            ? 'border-indigo-500/40 bg-indigo-500/5 shadow-lg shadow-indigo-500/5' 
                            : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                        {/* Top Card Navigation Info */}
                        <div className="px-4 py-2.5 bg-white/2 border-b border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              response.status === 'streaming' 
                                ? 'bg-cyan-400 animate-ping' 
                                : response.status === 'completed' 
                                ? 'bg-emerald-500' 
                                : 'bg-slate-650'
                            }`} />
                            <span className="text-xs font-semibold text-white tracking-tight">{response.modelName}</span>
                          </div>

                          {/* Utility copy/bookmark buttons inside matrix column card */}
                          {response.status === 'completed' && (
                            <div className="flex items-center gap-1.5">
                              {/* Metadata Latency stats tag */}
                              {response.durationMs && (
                                <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 bg-white/5 border border-white/5 rounded flex items-center gap-1">
                                  <Zap size={10} className="text-amber-500" />
                                  {response.durationMs}ms
                                </span>
                              )}
                              
                              <button
                                type="button"
                                onClick={() => handleCopyText(response.content, textRefKey)}
                                className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-all cursor-pointer"
                                title="Copy response markdown"
                              >
                                {copiedIdMap[textRefKey] ? (
                                  <ClipboardCheck size={12} className="text-emerald-400" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handlePinToggle(msg.promptText, response.modelName, response.content, msg.senderName)}
                                className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-all cursor-pointer"
                                title={customPinned ? 'Unpin Response' : 'Pin to saved response bar'}
                              >
                                {customPinned ? (
                                  <BookmarkCheck size={12} className="text-cyan-400" />
                                ) : (
                                  <Bookmark size={12} />
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Middle Content Markdown Container */}
                        <div className="p-4 flex-1 text-sm leading-relaxed max-h-[440px] overflow-y-auto scrollbar-thin">
                          {response.status === 'pending' && (
                            <div className="space-y-2.5 py-1">
                              <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse"></div>
                              <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse"></div>
                              <div className="h-4 bg-white/5 rounded w-2/3 animate-pulse"></div>
                            </div>
                          )}

                          {response.status === 'failed' && (
                            <div className="bg-rose-500/5 text-rose-350 border border-rose-500/10 rounded-lg p-3 text-xs flex flex-col gap-1.5">
                              <span className="font-semibold text-[11px] uppercase tracking-wider">Model Node Failure</span>
                              <p className="font-mono">{response.error || 'Connection timed out or client rejected parameter execution.'}</p>
                            </div>
                          )}

                          {(response.status === 'streaming' || response.status === 'completed') && (
                            <div className="markdown-body select-text antialiased">
                              <ReactMarkdown>{response.content}</ReactMarkdown>
                            </div>
                          )}

                          {response.status === 'streaming' && (
                            <span className="inline-block w-1.5 h-4 bg-cyan-400 ml-1 animate-pulse" />
                          )}
                        </div>

                        {/* Bottom diagnostic identifier */}
                        <div className="px-4 py-1.5 bg-white/2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>NODE: SSL_VERIFIED</span>
                          <span className="flex items-center gap-1">
                            <ShieldCheck size={10} className="text-emerald-500" />
                            SECURE WORKSPACE
                          </span>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Floating Scroll to bottom trigger */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-4 right-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-2.5 shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer z-50 flex items-center justify-center animate-bounce animate-duration-1000"
        >
          <ArrowDown size={16} />
        </button>
      )}

    </div>
  );
}
