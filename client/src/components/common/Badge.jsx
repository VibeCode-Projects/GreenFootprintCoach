import React from 'react';
import { CATEGORIES } from '../../utils/constants';

export const CategoryBadge = ({ category }) => {
  const cat = CATEGORIES[category] || CATEGORIES.other;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cat.bgColor} ${cat.textColor} ${cat.borderColor}`}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
      {cat.label}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = 'Pending';

  if (status === 'completed') {
    color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    label = 'Completed';
  } else if (status === 'in_progress') {
    color = 'bg-blue-50 text-blue-800 border-blue-200';
    label = 'In Progress';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${color}`}>
      {label}
    </span>
  );
};

export const DifficultyBadge = ({ difficulty }) => {
  let color = 'bg-slate-100 text-slate-700';

  if (difficulty === 'easy') {
    color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (difficulty === 'medium') {
    color = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (difficulty === 'hard') {
    color = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${color}`}>
      {difficulty}
    </span>
  );
};
