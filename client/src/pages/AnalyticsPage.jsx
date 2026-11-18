import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { activityService } from '../services/activityService';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { formatCarbon, formatDate, getEcoScoreColor } from '../utils/formatters';
import { CategoryBadge } from '../components/common/Badge';
import { BarChart3, TrendingDown, Calendar, PieChart as PieIcon, Layers } from 'lucide-react';

export const AnalyticsPage = () => {
  const [days, setDays] = useState(30);
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAllAnalytics = async () => {
      setLoading(true);
      try {
        const [dailyRes, weeklyRes, catRes, actRes] = await Promise.all([
          analyticsService.getDailyTrend(days),
          analyticsService.getWeekly(),
          analyticsService.getCategories(days),
          activityService.getActivities({ limit: 8 })
        ]);

        if (isMounted) {
          if (dailyRes.success) setDailyData(dailyRes.data);
          if (weeklyRes.success) setWeeklyData(weeklyRes.data);
          if (catRes.success) setCategoryData(catRes.data);
          if (actRes.success) setActivities(actRes.activities);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAllAnalytics();
    return () => {
      isMounted = false;
    };
  }, [days]);

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      {/* Header & Date Range Filter */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-forest-700 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Interactive Data Analytics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Carbon Analytics &amp; Emission Trends
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real MongoDB telemetry mapped to responsive Recharts visualizations
          </p>
        </div>

        {/* Global Date Filter Pill */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl self-start sm:self-auto border border-slate-200/80">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                days === d
                  ? 'bg-forest-800 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {d === 7 ? 'Last 7 Days' : d === 30 ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <LoadingSkeleton type="chart" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LoadingSkeleton type="chart" />
            <LoadingSkeleton type="chart" />
          </div>
        </div>
      ) : (
        <>
          {/* 1. Daily Carbon Emission Line/Area Chart */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Daily Carbon Emission Trend</h3>
                <p className="text-xs text-slate-500">Day-by-day emissions (kg CO2e) with the 5.0 kg climate benchmark</p>
              </div>
            </div>

            <div className="h-72 sm:h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} unit="kg" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
                            <div className="font-bold text-slate-300">{item.label || label}</div>
                            <div className="text-sm font-extrabold text-emerald-400">{item.total_carbon_kg} kg CO2e</div>
                            <div className="text-[11px] text-slate-400">{item.activitiesCount} activity items logged</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={5.0}
                    stroke="#166534"
                    strokeDasharray="4 4"
                    label={{ value: '5kg Target Limit', position: 'top', fill: '#166534', fontSize: 11, fontWeight: 700 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total_carbon_kg"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#analyticsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2 & 3. Weekly Bar Chart & Category Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weekly Bar Chart */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Weekly Carbon Aggregation</h3>
                <p className="text-xs text-slate-500">Comparative total emissions across the last 4 weeks</p>
              </div>

              <div className="h-64 sm:h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="weekLabel" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} unit="kg" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                              <div className="font-bold text-slate-300">{item.weekLabel} ({item.range})</div>
                              <div className="text-emerald-400 font-extrabold">{item.total_carbon_kg} kg Total</div>
                              <div className="text-slate-400">Avg {item.average_daily} kg/day</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="total_carbon_kg" fill="#166534" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Pie Chart */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Category Share Distribution</h3>
                <p className="text-xs text-slate-500">Percentage share of emissions by lifestyle sector</p>
              </div>

              <div className="h-64 sm:h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.filter((c) => c.carbon_kg > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="carbon_kg"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2 rounded-xl text-xs space-y-0.5">
                              <span className="font-bold">{item.name}</span>: {item.carbon_kg} kg ({item.percentage}%)
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(val) => <span className="text-xs text-slate-700">{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Historical Activity Table Preview */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Recent Activity Data Telemetry</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Emissions</th>
                    <th className="py-2.5 px-3">Eco Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activities.map((act) => {
                    const scoreStyle = getEcoScoreColor(act.eco_score);
                    return (
                      <tr key={act._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                          {formatDate(act.date)}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-900 line-clamp-1">{act.rawText}</td>
                        <td className="py-3 px-3 font-extrabold text-forest-900">{formatCarbon(act.total_carbon_kg)}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded font-bold border ${scoreStyle.bg} ${scoreStyle.text} ${scoreStyle.border}`}>
                            {act.eco_score}/100
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
