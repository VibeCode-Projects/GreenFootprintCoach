import React, { useState } from 'react';
import { Eye, Trash2, Calendar, Sparkles, Calculator, Search, Filter } from 'lucide-react';
import { formatCarbon, formatDate, getEcoScoreColor } from '../../utils/formatters';
import { CategoryBadge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { ActivityDetailModal } from './ActivityDetailModal';
import { activityService } from '../../services/activityService';
import { useNotification } from '../../context/NotificationContext';

export const ActivityHistoryTable = ({
  activities = [],
  total = 0,
  page = 1,
  pages = 1,
  onPageChange,
  onDeleteSuccess
}) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const { showSuccess, showError } = useNotification();

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity log?')) return;
    try {
      const res = await activityService.deleteActivity(id);
      if (res.success) {
        showSuccess('Activity log deleted.');
        if (onDeleteSuccess) onDeleteSuccess(id);
      }
    } catch (err) {
      showError(err.message || 'Failed to delete activity');
    }
  };

  const filtered = activities.filter((act) => {
    const matchesSearch = act.rawText.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCat === 'all' || act.activities.some((item) => item.category === selectedCat);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Activity History Log</h3>
          <p className="text-xs text-slate-500">Every record is permanently stored and isolated in MongoDB</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-1.5 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-forest-600"
            />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-forest-600"
          >
            <option value="all">All Categories</option>
            <option value="transport">Transport</option>
            <option value="energy">Energy & AC</option>
            <option value="food">Food & Diet</option>
            <option value="shopping">Shopping</option>
            <option value="water">Water</option>
            <option value="waste">Waste</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No activity history matches your filter"
          description="Log a new activity above or clear your search term."
          actionText="Clear Filter"
          onActionClick={() => {
            setSearch('');
            setSelectedCat('all');
          }}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Activity Description</th>
                <th className="py-3 px-3">Categories</th>
                <th className="py-3 px-3">Carbon (kg)</th>
                <th className="py-3 px-3">Eco Score</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((act) => {
                const scoreStyle = getEcoScoreColor(act.eco_score);
                return (
                  <tr key={act._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-slate-700 whitespace-nowrap">
                      {formatDate(act.date)}
                    </td>
                    <td className="py-3.5 px-3 max-w-xs">
                      <div className="font-semibold text-slate-900 line-clamp-1">{act.rawText}</div>
                      <div className="text-[11px] text-slate-400">
                        {act.source === 'ai_logger' ? 'Gemini AI Extracted' : 'Calculator Entry'}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {Array.from(new Set(act.activities.map((a) => a.category))).map((c) => (
                          <CategoryBadge key={c} category={c} />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-extrabold text-slate-900 whitespace-nowrap">
                      {formatCarbon(act.total_carbon_kg)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold border ${scoreStyle.bg} ${scoreStyle.text} ${scoreStyle.border}`}>
                        {act.eco_score}/100
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedActivity(act)}
                          className="p-1.5 text-slate-400 hover:text-forest-700 hover:bg-forest-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(act._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
          <span className="text-slate-500">
            Page {page} of {pages} ({total} total records)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none font-semibold"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  );
};
