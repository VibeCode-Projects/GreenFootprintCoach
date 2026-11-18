import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Flame, Shield, Award, Users } from 'lucide-react';
import { challengeService } from '../../services/challengeService';
import { formatEcoPoints } from '../../utils/formatters';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLeaderboard = async () => {
      try {
        const res = await challengeService.getLeaderboard();
        if (isMounted && res.success) {
          setLeaderboard(res.leaderboard);
          setUserRank(res.userRank);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchLeaderboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center text-xs shadow-sm">
          🥇
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-black flex items-center justify-center text-xs shadow-sm">
          🥈
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-700/20 text-amber-900 font-black flex items-center justify-center text-xs shadow-sm">
          🥉
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-xs">
        {rank}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900">Community Eco Leaderboard</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Top eco-conscious changemakers ranked by total earned points</p>
        </div>

        <div className="flex items-center gap-2 bg-forest-50 px-3 py-1.5 rounded-xl border border-forest-100 text-xs font-bold text-forest-900 self-start sm:self-auto">
          <span>Your Rank: #{userRank}</span>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : (
        <div className="divide-y divide-slate-100">
          {leaderboard.map((item) => (
            <div
              key={item.id}
              className={`py-3.5 px-3 rounded-2xl flex items-center justify-between gap-3 transition-colors ${
                item.isCurrentUser
                  ? 'bg-forest-50/80 border border-forest-200/90 shadow-sm'
                  : 'hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-center gap-3">
                {getRankBadge(item.rank)}
                <img
                  src={item.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.name}`}
                  alt={item.name}
                  className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{item.name}</span>
                    {item.isCurrentUser && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-forest-800 text-white uppercase tracking-wider">
                        You
                      </span>
                    )}
                    {item.isDemo && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200" title="Simulated peer profile for academic demo">
                        Demo Peer
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-medium text-forest-700">{item.levelTitle || 'Seedling'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                      <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {item.streak || 1}d
                    </span>
                    {item.location && (
                      <>
                        <span>•</span>
                        <span>{item.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm sm:text-base font-extrabold text-forest-900">
                  {formatEcoPoints(item.ecoPoints)}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Level {item.level || 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
