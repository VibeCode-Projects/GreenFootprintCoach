import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  CheckCircle2,
  Calendar,
  TreePine,
  ArrowRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import { challengeService } from '../../services/challengeService';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { formatCarbon, formatEcoPoints } from '../../utils/formatters';
import { CategoryBadge, DifficultyBadge } from '../common/Badge';

export const ChallengeCard = ({ challenge, onStatusUpdated }) => {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();
  const { refreshUser } = useAuth();

  const handleJoin = async () => {
    setLoading(true);
    try {
      const res = await challengeService.joinChallenge(challenge._id);
      if (res.success) {
        showSuccess(res.message);
        await refreshUser();
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err) {
      showError(err.message || 'Failed to join challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleProgress = async () => {
    setLoading(true);
    try {
      const res = await challengeService.updateProgress(challenge._id);
      if (res.success) {
        showSuccess(res.message);
        await refreshUser();
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err) {
      showError(err.message || 'Failed to update challenge progress');
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round(((challenge.userProgress || 0) / (challenge.targetDays || 7)) * 100)
  );

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CategoryBadge category={challenge.category} />
            <DifficultyBadge difficulty={challenge.difficulty} />
          </div>
          <div className="flex items-center gap-1 text-xs font-extrabold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>+{challenge.pointsReward} Pts</span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base font-bold text-slate-900 leading-snug">{challenge.title}</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{challenge.description}</p>
        </div>

        {/* Carbon & Target Info */}
        <div className="grid grid-cols-2 gap-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Carbon Savings</span>
            <span className="font-bold text-forest-800">~{formatCarbon(challenge.carbonSavingsEstimateKg)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Goal Metric</span>
            <span className="font-semibold text-slate-800">{challenge.targetMetric}</span>
          </div>
        </div>

        {/* Progress Bar (if joined) */}
        {challenge.userStatus !== 'not_joined' && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Challenge Progress</span>
              <span className="text-forest-800">
                {challenge.userProgress} / {challenge.targetDays} days ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-100">
        {challenge.isCompleted ? (
          <div className="flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Conquered & Rewarded!</span>
          </div>
        ) : challenge.userStatus === 'in_progress' ? (
          <button
            onClick={handleProgress}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Log Daily Habit Check-In (+5 Pts)</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
            ) : (
              <>
                <span>Join Challenge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
