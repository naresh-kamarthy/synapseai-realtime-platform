import { useStore } from '../store';
import { X, Copy, Trash2, ClipboardCheck, Sparkles } from 'lucide-react';
import React, { useState } from 'react';

export default function SavedResponses() {
  const { 
    savedResponses, 
    deleteSavedResponse, 
    isSavedResponsesOpen, 
    setSavedResponsesOpen 
  } = useStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (!isSavedResponsesOpen) return null;

  return (
    <div className="w-80 bg-slate-950/50 backdrop-blur-md border-l border-white/5 flex flex-col h-full z-10 text-slate-300">
      
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/2">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-cyan-400" />
          <h2 className="font-semibold text-white tracking-tight text-sm">Pinned AI Insights</h2>
        </div>
        <button
          type="button"
          onClick={() => setSavedResponsesOpen(false)}
          className="p-1 hover:bg-white/10 rounded-lg hover:text-white transition-colors cursor-pointer text-slate-400"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body List of Pinned Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {savedResponses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
            <div className="w-12 h-12 rounded-full border border-dashed border-white/10 flex items-center justify-center mb-3 text-lg">
              💡
            </div>
            <p className="text-xs font-semibold text-slate-400">No saved responses yet</p>
            <p className="text-[10px] text-slate-500 mt-1 px-4">Pin important comparisons or codes from the chat stream to display them here.</p>
          </div>
        ) : (
          savedResponses.map((item) => (
            <div 
              key={item.id} 
              className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2.5 transition-all hover:border-white/20 shadow-md shadow-slate-950/10"
            >
              {/* Card Meta details */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-semibold bg-white/10 text-cyan-400 px-2 py-0.5 rounded uppercase">
                    {item.modelName}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono block mt-1">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.responseContent, item.id)}
                    className="p-1.5 hover:bg-white/10 rounded-lg hover:text-white transition-colors cursor-pointer text-slate-400"
                    title="Copy Content"
                  >
                    {copiedId === item.id ? <ClipboardCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSavedResponse(item.id)}
                    className="p-1.5 hover:bg-white/10 rounded-lg hover:text-rose-400 transition-colors cursor-pointer text-slate-400"
                    title="Unpin Response"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Input Prompt Snippet */}
              <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-[11px] italic shrink-0 leading-normal text-slate-400 truncate">
                Prompt: "{item.prompt}"
              </div>

              {/* Text content representation */}
              <div className="text-[11px] text-slate-300 font-sans leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-white/10">
                {item.responseContent}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
