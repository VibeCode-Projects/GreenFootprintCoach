import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Calendar,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
  Award,
  Zap,
  TrendingDown
} from 'lucide-react';
import { activityService } from '../../services/activityService';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { formatCarbon, getEcoScoreColor } from '../../utils/formatters';
import { CategoryBadge } from '../common/Badge';
import { DEMO_PROMPTS } from '../../utils/constants';

export const NaturalLanguageLogger = ({ onActivityLogged }) => {
  const [text, setText] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const { showSuccess, showError } = useNotification();
  const { refreshUser } = useAuth();

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!text.trim()) {
      showError('Please enter a description of your activities.');
      return;
    }

    setIsLoading(true);
    setLastResult(null);

    try {
      const res = await activityService.analyzeNaturalLanguage(text, date);
      if (res.success) {
        setLastResult(res);
        showSuccess(
          `Analysis complete! Extracted ${res.activity.activities.length} activities totaling ${res.activity.total_carbon_kg} kg CO2e.`
        );
        await refreshUser();
        if (onActivityLogged) onActivityLogged(res.activity);
      }
    } catch (err) {
      showError(err.message || 'Failed to process natural language log');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptSelect = (promptText) => {
    setText(promptText);
  };

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-800 text-emerald-300 flex items-center justify-center shadow-md shadow-forest-900/10">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Daily Activity Logger</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Type naturally — Google Gemini converts your daily habits into structured carbon analytics
              </p>
            </div>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Today I travelled 15 km by car, used AC for 5 hours, ate chicken for lunch, and used public transport for 10 km..."
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-forest-600 focus:ring-4 focus:ring-forest-600/10 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Preset Prompts */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Quick Inspiration Prompts (Click to populate)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_PROMPTS.map((promptText, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handlePromptSelect(promptText)}
                  className="text-left text-xs p-2.5 rounded-xl border border-slate-200/90 hover:border-forest-300 hover:bg-forest-50/50 text-slate-600 hover:text-slate-900 transition-all leading-snug"
                >
                  "{promptText}"
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Validates against DEFRA, EPA & IPCC conversion factors</span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !text.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-forest-900/15 transition-all active:scale-95 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                  <span>Gemini is Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Analyze with Gemini AI</span>
                  <Send className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Structured Result Display */}
      {lastResult && lastResult.activity && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-lg shadow-emerald-950/5 space-y-6 animate-in fade-in-0 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {lastResult.aiEngine || 'Gemini AI Analysis Result'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Structured Environmental Extraction</h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-forest-50 border border-forest-100 text-xs font-bold text-forest-900">
                +15 Eco Points Earned
              </div>
            </div>
          </div>

          {/* Metric Overview Hero */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Carbon Emissions</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">
                {formatCarbon(lastResult.activity.total_carbon_kg)}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">Sum of discrete items</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">Daily Eco Score</span>
              <div className="text-3xl font-extrabold text-emerald-900 mt-1">
                {lastResult.activity.eco_score} <span className="text-lg font-normal text-emerald-700">/ 100</span>
              </div>
              <span className="text-xs text-emerald-700 mt-1 block">
                {lastResult.activity.eco_score >= 70 ? 'High Sustainability' : 'Moderate Carbon Footprint'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
              <span className="text-xs text-blue-800 font-semibold uppercase tracking-wider">Extracted Activities</span>
              <div className="text-3xl font-extrabold text-blue-900 mt-1">
                {lastResult.activity.activities.length}
              </div>
              <span className="text-xs text-blue-700 mt-1 block">Categorized items</span>
            </div>
          </div>

          {/* AI Summary */}
          {lastResult.activity.aiSummary && (
            <div className="p-4 rounded-2xl bg-forest-50/50 border border-forest-100 text-sm text-forest-950 leading-relaxed">
              <span className="font-bold text-forest-900 block mb-1">Impact Summary:</span>
              {lastResult.activity.aiSummary}
            </div>
          )}

          {/* Follow up questions if essential data missing */}
          {lastResult.activity.clarificationNeeded && lastResult.activity.followUpQuestions?.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                Missing Detail Clarifications (Assumptions were applied)
              </div>
              <ul className="text-xs text-amber-900 space-y-1 list-disc list-inside">
                {lastResult.activity.followUpQuestions.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Discrete Items List */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Discrete Activity Breakdown (Saved to MongoDB)
            </h4>
            <div className="space-y-2.5">
              {lastResult.activity.activities.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={item.category} />
                      <span className="text-sm font-bold text-slate-900">{item.description}</span>
                    </div>
                    {item.assumptions && (
                      <p className="text-xs text-slate-500">{item.assumptions}</p>
                    )}
                  </div>
                  <div className="text-right self-end sm:self-center">
                    <div className="text-base font-extrabold text-forest-900">{formatCarbon(item.carbon_kg)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          {lastResult.activity.aiRecommendations?.length > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-2">
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Actionable AI Green Recommendations
              </div>
              <ul className="text-xs text-emerald-950 space-y-1.5 list-disc list-inside">
                {lastResult.activity.aiRecommendations.map((rec, i) => (
                  <li key={i} className="leading-relaxed">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
