import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

export const EmissionTrendChart = () => {
  const [days, setDays] = useState(7);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await analyticsService.getDailyTrend(days);
        if (isMounted && res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch daily trend:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [days]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[150px]">
          <div className="font-bold text-slate-300 border-b border-slate-800 pb-1">{item.label || label}</div>
          <div className="flex justify-between items-center text-sm font-extrabold text-emerald-400">
            <span>Total Carbon:</span>
            <span>{item.total_carbon_kg} kg</span>
          </div>
          {item.transport > 0 && (
            <div className="flex justify-between text-slate-300">
              <span className="text-blue-400">Transport:</span>
              <span>{item.transport} kg</span>
            </div>
          )}
          {item.energy > 0 && (
            <div className="flex justify-between text-slate-300">
              <span className="text-amber-400">Energy:</span>
              <span>{item.energy} kg</span>
            </div>
          )}
          {item.food > 0 && (
            <div className="flex justify-between text-slate-300">
              <span className="text-emerald-400">Food:</span>
              <span>{item.food} kg</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Carbon Footprint Trend</h3>
          <p className="text-xs text-slate-500">Daily emissions in kg CO2e vs the 5.0 kg sustainable target</p>
        </div>

        {/* Days Filter Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                days === d
                  ? 'bg-white text-forest-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {d === 7 ? '7 Days' : d === 30 ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="chart" />
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          No emissions data recorded for this period yet.
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                unit="kg"
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={5.0}
                stroke="#166534"
                strokeDasharray="4 4"
                label={{ value: '5kg Target', position: 'top', fill: '#166534', fontSize: 10, fontWeight: 700 }}
              />
              <Area
                type="monotone"
                dataKey="total_carbon_kg"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCarbon)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
