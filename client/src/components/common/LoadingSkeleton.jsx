import React from 'react';

export const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const skeletons = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {skeletons.map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 animate-pulse space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200" />
              <div className="h-4 bg-slate-200 rounded w-24" />
            </div>
            <div className="h-8 bg-slate-200 rounded w-32 mt-2" />
            <div className="h-3 bg-slate-100 rounded w-40" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-slate-200 rounded w-48" />
          <div className="h-8 bg-slate-100 rounded w-28" />
        </div>
        <div className="h-64 bg-slate-100 rounded-xl w-full" />
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse space-y-3">
        <div className="h-5 bg-slate-200 rounded w-40 mb-4" />
        {skeletons.map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded-lg w-full" />
        ))}
      </div>
    );
  }

  return <div className="h-20 bg-slate-200 rounded-xl animate-pulse" />;
};
