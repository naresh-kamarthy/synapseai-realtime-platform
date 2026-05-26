import React, { useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Send, Sparkles, CheckSquare, Square, Eye, Users } from 'lucide-react';

export default function PromptBox() {
  const {
    collaborativePromptText,
    sendPromptTextChange,
    sendTypingStatus,
    submitPrompt,
    selectedModels,
    toggleModel,
    whoIsEditing,
    presence
  } = useStore();

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    sendPromptTextChange(value);

    // Broadcast Typing Indicator Status start
    sendTypingStatus(true);

    // Debounce to stop typing indicator broadcast after 1.5s
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 1500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collaborativePromptText.trim()) return;

    submitPrompt(collaborativePromptText.trim());

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTypingStatus(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const totalModelsAvailable = [
    { key: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', desc: 'Real API Streaming' },
    { key: 'claude-3-5', label: 'Claude 3.5 Sonnet', desc: 'Comparative Insights' },
    { key: 'gpt-4o', label: 'GPT-4o Workspace', desc: 'Analytical Matrix' }
  ];

  return (
    <div className="p-4 bg-slate-900/20 border-t border-white/5 backdrop-blur-sm z-10 shrink-0">
      <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto space-y-3">
        
        {/* Collaborative Feedback Line */}
        {whoIsEditing && (
          <div className="flex items-center gap-1.5 px-1">
            <Users size={12} className="text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono text-cyan-400 font-semibold animate-pulse">
              ⚡ {whoIsEditing} is modifying the prompt draft in real-time...
            </span>
          </div>
        )}

        {/* Dynamic Model selector badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-505 mr-1 flex items-center gap-1 select-none font-bold">
            <Eye size={10} />
            Compare Agents:
          </span>
          {totalModelsAvailable.map((mod) => {
            const isSelected = selectedModels.includes(mod.key);
            return (
              <button
                key={mod.key}
                type="button"
                onClick={() => toggleModel(mod.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-white/10 border-white/20 text-white shadow-lg shadow-indigo-500/5' 
                    : 'bg-white/5 border-white/5 text-slate-455 hover:text-slate-200'
                }`}
                title={mod.desc}
              >
                {isSelected ? (
                  <CheckSquare size={13} className="text-cyan-400" />
                ) : (
                  <Square size={13} className="text-slate-500" />
                )}
                <span>{mod.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input box wrapping area */}
        <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all shadow-2xl">
          <textarea
            rows={2}
            value={collaborativePromptText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a prompt collaboratively here... Press Enter or click Submit to compare selected AI agents."
            className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-slate-550 focus:outline-none resize-none leading-relaxed min-h-[50px] scrollbar-none"
          />

          <div className="px-4 py-2 border-t border-white/5 bg-white/2 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-mono">
              Press Enter/Return to broadcast comparison. Shift+Enter for new line.
            </span>
            
            <button
              type="submit"
              disabled={!collaborativePromptText.trim()}
              className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                collaborativePromptText.trim()
                  ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20 active:scale-95'
                  : 'bg-white/5 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Send size={14} />
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
