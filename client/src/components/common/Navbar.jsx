import React from 'react';
import { Menu, Plus, Sparkles, Trophy, Flame } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatEcoPoints } from '../../utils/formatters';

export const Navbar = ({ onOpenSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return { title: 'Overview Dashboard', subtitle: 'Track your carbon emissions and daily sustainability' };
      case '/activities':
        return { title: 'AI Natural Language Logger', subtitle: 'Describe your day and let Gemini calculate your carbon impact' };
      case '/calculator':
        return { title: 'Carbon Footprint Calculator', subtitle: 'Granular multi-category emission estimations' };
      case '/analytics':
        return { title: 'Carbon Analytics & Trends', subtitle: 'Detailed historical charts and emission breakdown' };
      case '/recommendations':
        return { title: 'AI Green Recommendations', subtitle: 'Tailored action steps to reduce high-emission habits' };
      case '/challenges':
        return { title: 'Eco Challenges & Leaderboard', subtitle: 'Compete, earn points, and build sustainable habits' };
      case '/profile':
        return { title: 'User Profile & Badges', subtitle: 'Account preferences, achievements, and statistics' };
      default:
        return { title: 'Eco-Habit Coach', subtitle: 'Your personal carbon footprint assistant' };
    }
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">{title}</h1>
          <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
        </div>
      </div>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center gap-3">
        {user && (
          <>
            {/* Eco Points Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-forest-50 border border-forest-200/80 rounded-full text-xs font-semibold text-forest-800">
              <Trophy className="w-3.5 h-3.5 text-forest-700" />
              <span>{formatEcoPoints(user.ecoPoints || 50)}</span>
            </div>

            {/* Streak Pill */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{user.streak || 1} day streak</span>
            </div>

            {/* Quick Log Button */}
            <Link
              to="/activities"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all shadow-forest-900/10 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">Log Activity</span>
              <span className="sm:hidden">Log</span>
            </Link>

            {/* User Avatar */}
            <Link to="/profile" className="shrink-0 group">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                alt={user.name}
                className="w-9 h-9 rounded-full bg-slate-100 border-2 border-transparent group-hover:border-forest-600 transition-all"
              />
            </Link>
          </>
        )}
      </div>
    </header>
  );
};
