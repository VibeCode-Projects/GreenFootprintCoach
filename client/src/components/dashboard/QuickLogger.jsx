import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, Lightbulb } from 'lucide-react';
import { activityService } from '../../services/activityService';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PROMPTS } from '../../utils/constants';

export const QuickLogger = ({ onActivityLogged }) => {
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useNotification();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await activityService.analyzeNaturalLanguage(prompt);
      if (res.success) {
        showSuccess(
          `Logged! Analyzed ${res.activity.activities.length} activities totaling ${res.activity.total_carbon_kg} kg CO2e (+15 pts).`
        );
        setPrompt('');
        await refreshUser();
        if (onActivityLogged) onActivityLogged(res.activity);
      }
    } catch (err) {
      showError(err.message || 'Failed to analyze activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectDemo = (text) => {
    setPrompt(text);
  };

  return (
    <div className="bg-gradient-to-br from-forest-850 to-forest-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-forest-950/10 relative overflow-hidden">
      {/* Decorative leaf watermarks */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-forest-500/15 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">AI Conversational Activity Logger</h2>
              <p className="text-xs text-emerald-200/80">Describe your daily travel, meals, or electricity usage naturally</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-full self-start sm:self-auto">
            Powered by Gemini AI
          </span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Today I travelled 15 km by car, used AC for 5 hours, ate chicken for lunch, and used public transport for 10 km..."
              rows={3}
              className="w-full bg-slate-900/60 border border-white/15 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 rounded-2xl p-4 text-sm text-white placeholder-slate-400 focus:outline-none transition-all resize-none shadow-inner"
            />
            <button
              type="submit"
              disabled={isSubmitting || !prompt.trim()}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Analyze Impact</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Prompt Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 text-xs">
            <span className="text-slate-400 flex items-center gap-1 text-[11px] shrink-0">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Try sample:
            </span>
            {DEMO_PROMPTS.slice(0, 2).map((dp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectDemo(dp)}
                className="bg-white/10 hover:bg-white/15 text-slate-200 px-3 py-1 rounded-lg shrink-0 text-xs border border-white/10 transition-colors truncate max-w-[280px]"
                title={dp}
              >
                "{dp.slice(0, 38)}..."
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};
