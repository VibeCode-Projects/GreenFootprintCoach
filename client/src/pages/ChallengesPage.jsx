import React, { useState, useEffect, useCallback } from 'react';
import { ChallengeCard } from '../components/challenges/ChallengeCard';
import { Leaderboard } from '../components/challenges/Leaderboard';
import { challengeService } from '../services/challengeService';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Trophy, Flame, Shield, Award, Users, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatEcoPoints } from '../utils/formatters';

export const ChallengesPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await challengeService.getChallenges();
      if (res.success) {
        setChallenges(res.challenges);
      }
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      {/* Gamification Status Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Gamification &amp; Eco Habits</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Sustainability Challenges &amp; Leaderboards
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Complete daily and weekly green challenges, maintain your streak, and earn Eco Points to rise through community levels!
          </p>
        </div>

        {/* User Mini Stats */}
        {user && (
          <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 self-start md:self-auto shrink-0">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Current Level</span>
              <span className="text-sm font-extrabold text-forest-900">
                Lvl {user.level || 1} • {user.levelTitle || 'Seedling'}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Eco Points</span>
              <span className="text-sm font-extrabold text-amber-600">{formatEcoPoints(user.ecoPoints || 50)}</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Daily Streak</span>
              <span className="text-sm font-extrabold text-amber-600 flex items-center gap-0.5">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                {user.streak || 1}d
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Challenges (Left 2 cols) & Leaderboard (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Challenges */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Available Eco Challenges</h3>
            <span className="text-xs text-slate-500 font-medium">
              {challenges.length} active weekly habits
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LoadingSkeleton type="card" count={2} />
              <LoadingSkeleton type="card" count={2} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {challenges.map((c) => (
                <ChallengeCard
                  key={c._id}
                  challenge={c}
                  onStatusUpdated={fetchChallenges}
                />
              ))}
            </div>
          )}
        </div>

        {/* Community Leaderboard */}
        <div className="space-y-6">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
};
