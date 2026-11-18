import React from 'react';
import { CarbonCalculator } from '../components/calculator/CarbonCalculator';
import { Calculator, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

export const CalculatorPage = () => {
  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      {/* Intro Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-forest-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            <span>Interactive Carbon Accounting</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Scientific Carbon Footprint Calculator
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Need granular emissions accounting for individual appliances, commute modes, or meals? Select categories below, configure variables, and stage them into your daily log tray.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/90 px-3.5 py-2 rounded-2xl text-xs font-bold text-emerald-900 shrink-0 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>IPCC &amp; DEFRA Conversion Factors</span>
        </div>
      </div>

      {/* Main Interactive Multi-Category Calculator */}
      <CarbonCalculator />
    </div>
  );
};
