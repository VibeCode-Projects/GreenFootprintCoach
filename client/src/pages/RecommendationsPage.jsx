import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Loader2,
  Filter,
  Check,
  RefreshCw,
  Award
} from 'lucide-react';
import { recommendationService } from '../services/recommendationService';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { formatCarbon } from '../utils/formatters';
import { CategoryBadge, DifficultyBadge, StatusBadge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

export const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const { showSuccess, showError } = useNotification();
  const { refreshUser } = useAuth();

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;

      const res = await recommendationService.getRecommendations(params);
      if (res.success) {
        setRecommendations(res.recommendations);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const res = await recommendationService.generateRecommendations();
      if (res.success) {
        showSuccess(res.message || 'New personalized AI recommendations generated!');
        await fetchRecommendations();
      }
    } catch (err) {
      showError(err.message || 'Failed to generate recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await recommendationService.updateStatus(id, newStatus);
      if (res.success) {
        showSuccess(
          newStatus === 'completed'
            ? 'Habit adopted! +25 Eco Points awarded!'
            : `Status changed to ${newStatus}.`
        );
        if (newStatus === 'completed') {
          await refreshUser();
        }
        await fetchRecommendations();
      }
    } catch (err) {
      showError(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-forest-800 to-forest-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-forest-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Habits Optimization Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Personalized Green Recommendations
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            Gemini analyzes your historical emissions data, identifies highest carbon leakages, and formulates high-impact, achievable lifestyle changes.
          </p>
        </div>

        <button
          onClick={handleGenerateAI}
          disabled={isGenerating}
          className="relative z-10 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg transition-all active:scale-95 shrink-0 self-start sm:self-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Analyzing History...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Generate AI Advice</span>
            </>
          )}
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {[
            { key: 'all', label: 'All Habits' },
            { key: 'pending', label: 'Pending' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'completed', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                statusFilter === tab.key
                  ? 'bg-white text-forest-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Dropdown Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-forest-600"
          >
            <option value="all">All Categories</option>
            <option value="transport">Transport</option>
            <option value="energy">Energy & AC</option>
            <option value="food">Food & Diet</option>
            <option value="shopping">Shopping</option>
            <option value="water">Water</option>
            <option value="waste">Waste</option>
          </select>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {loading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No recommendations match your criteria"
          description="Click 'Generate AI Advice' above to analyze your past 30 days emissions and create new recommendations."
          actionText="Generate AI Advice"
          onActionClick={handleGenerateAI}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => (
            <div
              key={rec._id}
              className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
                rec.status === 'completed'
                  ? 'border-emerald-200 bg-emerald-50/20 shadow-sm'
                  : 'border-slate-200/80 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                {/* Badges Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={rec.category} />
                    <DifficultyBadge difficulty={rec.difficulty} />
                  </div>
                  <StatusBadge status={rec.status} />
                </div>

                {/* Title & Savings */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{rec.title}</h3>
                  <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl shrink-0">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>-{formatCarbon(rec.estimatedSavingsKg)}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>

                {/* Actionable Steps Checklist */}
                {rec.actionableSteps?.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Actionable Steps
                    </span>
                    <ul className="space-y-1">
                      {rec.actionableSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-400 font-medium">
                  {rec.status === 'completed' ? 'Reward claimed (+25 pts)' : 'Complete to earn +25 pts'}
                </span>

                <div className="flex items-center gap-2">
                  {rec.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(rec._id, 'in_progress')}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                    >
                      Start Habit
                    </button>
                  )}

                  {rec.status !== 'completed' ? (
                    <button
                      onClick={() => handleUpdateStatus(rec._id, 'completed')}
                      className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold transition-all shadow-sm active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Mark Complete</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(rec._id, 'in_progress')}
                      className="text-slate-400 hover:text-slate-600 font-medium underline text-[11px]"
                    >
                      Reopen Habit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
