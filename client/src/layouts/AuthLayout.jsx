import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Leaf, ShieldCheck, Sparkles, Trophy } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-forest-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-forest-800 flex items-center justify-center text-white shadow-lg shadow-forest-900/15 group-hover:scale-105 transition-transform">
            <Leaf className="w-6 h-6 text-emerald-300" />
          </div>
          <div className="text-left">
            <span className="block font-black text-xl text-slate-900 tracking-tight leading-none">
              Eco-Habit Coach
            </span>
            <span className="text-xs text-forest-700 font-semibold tracking-wide">
              AI Green Footprint Platform
            </span>
          </div>
        </Link>
      </div>

      {/* Auth Card Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-900/5 rounded-3xl border border-slate-200/80">
          <Outlet />
        </div>

        {/* Feature Badges Footer */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Gemini AI
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
            JWT & BCrypt Secure
          </span>
          <span className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            Gamified Points
          </span>
        </div>
      </div>
    </div>
  );
};
