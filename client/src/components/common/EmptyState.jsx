import React from 'react';
import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = Leaf,
  title = 'No records found',
  description = 'Start tracking your daily activities to visualize your carbon footprint and receive AI recommendations.',
  actionText = 'Log Daily Activity',
  actionLink = '/activities',
  onActionClick
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="w-14 h-14 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">{description}</p>
      {actionLink ? (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm shadow-sm transition-all active:scale-95"
        >
          {actionText}
        </Link>
      ) : onActionClick ? (
        <button
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm shadow-sm transition-all active:scale-95"
        >
          {actionText}
        </button>
      ) : null}
    </div>
  );
};
