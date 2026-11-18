import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

export const CategoryBreakdownChart = () => {
  const [categories, setCategories] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        const res = await analyticsService.getCategories(30);
        if (isMounted && res.success) {
          const nonZero = res.data.filter((c) => c.carbon_kg > 0);
          setCategories(nonZero.length > 0 ? nonZero : res.data);
          setGrandTotal(res.grandTotal);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCats();
    return () => {
      isMounted = false;
    };
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1">
          <div className="font-bold text-slate-200">{item.name}</div>
          <div className="text-emerald-400 font-extrabold">{item.carbon_kg} kg ({item.percentage}%)</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-slate-900">Emissions by Category</h3>
          <span className="text-xs font-semibold text-slate-500">Last 30 Days</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">Carbon distribution across lifestyle activities</p>
      </div>

      {loading ? (
        <LoadingSkeleton type="chart" />
      ) : grandTotal === 0 ? (
        <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
          <span>No emission activities recorded in the last 30 days.</span>
          <span className="text-[11px] text-slate-500 mt-1">Log activities to see your distribution!</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="carbon_kg"
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} stroke="#ffffff" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Summary Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-medium">Total</span>
              <span className="text-base font-extrabold text-slate-900">{grandTotal} kg</span>
            </div>
          </div>

          {/* Interactive Legend Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {categories.map((cat) => (
              <div key={cat.key} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="font-medium text-slate-700 truncate">{cat.name}</span>
                </div>
                <span className="font-bold text-slate-900 ml-1 shrink-0">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
