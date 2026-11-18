import React from 'react';
import { Modal } from '../common/Modal';
import { formatDate, formatCarbon, getEcoScoreColor } from '../../utils/formatters';
import { CategoryBadge } from '../common/Badge';
import { Sparkles, Info, Calendar, Award } from 'lucide-react';

export const ActivityDetailModal = ({ activity, isOpen, onClose }) => {
  if (!activity) return null;

  const scoreStyle = getEcoScoreColor(activity.eco_score);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Activity Footprint Breakdown"
      subtitle={`Recorded on ${formatDate(activity.date)}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Header Summary Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-forest-50 to-emerald-50/60 border border-forest-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-forest-700 font-semibold uppercase tracking-wider">Total Carbon Emissions</div>
            <div className="text-3xl font-extrabold text-forest-950 mt-0.5">{formatCarbon(activity.total_carbon_kg)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">Eco Score</div>
            <div className={`text-xl font-bold px-3 py-1 rounded-xl border mt-0.5 inline-block ${scoreStyle.bg} ${scoreStyle.text} ${scoreStyle.border}`}>
              {activity.eco_score} / 100
            </div>
          </div>
        </div>

        {/* Original Natural Language Text */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Original User Log
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 italic">
            "{activity.rawText}"
          </div>
        </div>

        {/* AI Summary */}
        {activity.aiSummary && (
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              AI Impact Assessment
            </div>
            <div className="text-sm text-slate-700 bg-blue-50/40 p-3 rounded-xl border border-blue-100/80 leading-relaxed">
              {activity.aiSummary}
            </div>
          </div>
        )}

        {/* Individual Discrete Activities Extracted */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Discrete Extracted Activities ({activity.activities.length})
          </div>
          <div className="space-y-2.5">
            {activity.activities.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-emerald-300 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={item.category} />
                    <span className="text-sm font-semibold text-slate-900">{item.description}</span>
                  </div>
                  <span className="text-sm font-bold text-forest-800">{formatCarbon(item.carbon_kg)}</span>
                </div>

                {item.assumptions && (
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 pl-1">
                    <span className="font-medium text-slate-400">Emission Factor / Assumption:</span>
                    <span>{item.assumptions}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {activity.aiRecommendations && activity.aiRecommendations.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Personalized AI Recommendations
            </div>
            <ul className="space-y-1 text-xs text-amber-950 list-disc list-inside">
              {activity.aiRecommendations.map((rec, i) => (
                <li key={i} className="leading-relaxed">{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
};
