import React, { useState } from 'react';
import { Sparkles, Calendar, ChevronRight, Calculator, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCarbon, formatDate, getEcoScoreColor } from '../../utils/formatters';
import { CategoryBadge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { ActivityDetailModal } from '../activities/ActivityDetailModal';
import { activityService } from '../../services/activityService';
import { useNotification } from '../../context/NotificationContext';

export const RecentActivities = ({ activities = [], onActivityDeleted }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const { showSuccess, showError } = useNotification();

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this activity log?')) return;

    try {
      const res = await activityService.deleteActivity(id);
      if (res.success) {
        showSuccess('Activity log deleted.');
        if (onActivityDeleted) onActivityDeleted(id);
      }
    } catch (err) {
      showError(err.message || 'Failed to delete activity');
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Activity Logs</h3>
            <p className="text-xs text-slate-500">Your latest logged daily environmental impacts</p>
          </div>
          <Link
            to="/activities"
            className="text-xs font-semibold text-forest-700 hover:text-forest-900 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {activities.length === 0 ? (
          <EmptyState
            title="No activities logged yet"
            description="Use our AI Natural Language Logger to describe your day in plain English!"
            actionText="Log Your First Activity"
            actionLink="/activities"
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {activities.slice(0, 5).map((act) => {
              const scoreStyle = getEcoScoreColor(act.eco_score);
              return (
                <div
                  key={act._id}
                  onClick={() => setSelectedActivity(act)}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-700 border border-forest-100 flex items-center justify-center shrink-0 mt-0.5">
                      {act.source === 'ai_logger' ? (
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Calculator className="w-4 h-4 text-forest-700" />
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-forest-800 transition-colors">
                        {act.rawText}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(act.date)}
                        </span>
                        <span>•</span>
                        <span>{act.activities.length} activities</span>
                        {act.activities[0] && (
                          <CategoryBadge category={act.activities[0].category} />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900">{formatCarbon(act.total_carbon_kg)}</div>
                      <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded border ${scoreStyle.bg} ${scoreStyle.text} ${scoreStyle.border}`}>
                        Score {act.eco_score}/100
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDelete(e, act._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
      />
    </>
  );
};
