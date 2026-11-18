import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Leaf,
  ShieldCheck,
  BarChart3,
  Award,
  ArrowRight,
  Calculator,
  Flame,
  Globe2,
  TreePine,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <header className="h-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 sm:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-forest-800 flex items-center justify-center text-white shadow-md shadow-forest-900/10">
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 leading-none block">Eco-Habit Coach</span>
            <span className="text-xs text-forest-700 font-semibold tracking-wide">AI Green Footprint</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-sm transition-all active:scale-95"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 sm:px-12 pt-16 pb-24 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Environmental Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-50 border border-forest-200/80 text-forest-800 text-xs font-bold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>BCA Academic Capstone • Powered by Google Gemini AI & DEFRA Factors</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl leading-[1.15]">
          Understand, Log & Slash Your Carbon Footprint with{' '}
          <span className="bg-gradient-to-r from-forest-800 via-forest-700 to-emerald-600 bg-clip-text text-transparent">
            Conversational AI
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
          No complex spreadsheets or confusing surveys. Simply describe your daily commute, meals, and electricity usage in plain English. Our Gemini-powered AI extracts your carbon emissions, tracks trends, and coaches you to carbon neutrality.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-extrabold text-base shadow-xl shadow-forest-950/15 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Sparkles className="w-5 h-5 text-emerald-300" />
            <span>Start Tracking Free</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-base border border-slate-200 shadow-sm transition-all"
          >
            Sign In with Demo Account
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Natural Language AI Logging</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Type "Drove 15km in petrol car, used AC 5 hours, ate chicken lunch". Gemini parses discrete activities into structured JSON with verified factors.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Deep Recharts Analytics</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Interactive 7/30/90-day emission area trends, weekly bars, and category pie charts connected directly to MongoDB data aggregation.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Gamified Sustainability</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Earn Eco Points, level up from Seedling to Earth Champion, maintain daily logging streaks, and conquer weekly challenges with peers.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500">
        <p>© 2026 Eco-Habit Coach • BCA Final Year Academic Capstone Project</p>
      </footer>
    </div>
  );
};
