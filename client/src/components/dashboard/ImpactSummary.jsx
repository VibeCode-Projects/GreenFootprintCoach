import React from 'react';
import { TreePine, Car, Droplets, Target, ShieldCheck } from 'lucide-react';
import { formatCarbon } from '../../utils/formatters';

export const ImpactSummary = ({ totalCarbon = 0, todayEmissions = 0, weeklyAverage = 0, targetDaily = 5.0 }) => {
  // Equivalency benchmarks:
  // 1 mature tree absorbs ~22 kg CO2 per year (~0.06 kg per day)
  // 1 km by average petrol car = ~0.17 kg CO2
  // 1 plastic bottle saved = ~0.082 kg CO2 avoided
  const treesNeededYear = Math.max(1, Math.round(totalCarbon / 22));
  const carKmEquivalent = Math.round(totalCarbon / 0.17);
  const targetDiff = (todayEmissions - targetDaily).toFixed(1);
  const isUnderTarget = todayEmissions <= targetDaily;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900">Environmental Impact Overview</h3>
        <p className="text-xs text-slate-500">Real-world carbon absorption equivalents</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-forest-50/70 border border-forest-100 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-forest-800 text-emerald-300 flex items-center justify-center shrink-0">
            <TreePine className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-forest-950">{treesNeededYear} Trees</div>
            <div className="text-xs text-forest-800 font-medium">Needed 1 full year to offset your recorded footprint</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-blue-950">{carKmEquivalent} km</div>
            <div className="text-xs text-blue-800 font-medium">Equivalent to driving a petrol passenger car</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-emerald-950">{formatCarbon(todayEmissions)}</div>
            <div className="text-xs text-emerald-800 font-medium">
              {isUnderTarget
                ? `Well done! ${Math.abs(targetDiff)} kg below your ${targetDaily}kg daily goal`
                : `${targetDiff} kg above your ${targetDaily}kg daily goal`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
