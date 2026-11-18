import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  trendDirection, // 'up' | 'down' | 'neutral'
  isGoodWhenDown = true, // for carbon emissions, down is good!
  badge,
  iconColor = 'text-forest-800',
  iconBg = 'bg-forest-50'
}) => {
  let trendColor = 'text-slate-500 bg-slate-100';

  if (trendDirection === 'down') {
    trendColor = isGoodWhenDown
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : 'text-rose-700 bg-rose-50 border-rose-200';
  } else if (trendDirection === 'up') {
    trendColor = isGoodWhenDown
      ? 'text-rose-700 bg-rose-50 border-rose-200'
      : 'text-emerald-700 bg-emerald-50 border-emerald-200';
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center ${iconColor}`}>
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <span className="text-sm font-semibold text-slate-600">{title}</span>
        </div>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between mt-2">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border ${trendColor}`}>
            {trendDirection === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
            {trendDirection === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
            {trendDirection === 'neutral' && <Minus className="w-3.5 h-3.5" />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      {(subtitle || trendLabel) && (
        <div className="mt-2 text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <span>{subtitle || trendLabel}</span>
        </div>
      )}
    </div>
  );
};
