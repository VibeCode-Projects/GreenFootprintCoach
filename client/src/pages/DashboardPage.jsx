import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe2,
  Calendar,
  Flame,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  TreePine,
  Target
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { QuickLogger } from '../components/dashboard/QuickLogger';
import { EmissionTrendChart } from '../components/dashboard/EmissionTrendChart';
import { CategoryBreakdownChart } from '../components/dashboard/CategoryBreakdownChart';
import { RecentActivities } from '../components/dashboard/RecentActivities';
import { ImpactSummary } from '../components/dashboard/ImpactSummary';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { analyticsService } from '../services/analyticsService';
import { activityService } from '../services/activityService';
import { formatCarbon, formatEcoPoints } from '../utils/formatters';

export const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [sumRes, actRes] = await Promise.all([
        analyticsService.getSummary(),
        activityService.getActivities({ limit: 5 })
      ]);

      if (sumRes.success) {
        setSummary(sumRes.data);
      }
      if (actRes.success) {
        setActivities(actRes.activities);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleActivityLogged = () => {
    fetchDashboardData();
  };

  const handleActivityDeleted = () => {
    fetchDashboardData();
  };

  if (loading && !summary) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={4} />
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="table" count={3} />
      </div>
    );
  }

  const todayDiff = summary?.dailyChangePct || 0;
  const isDown = todayDiff < 0;

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      {/* 4 Top Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Carbon Footprint */}
        <StatCard
          title="Total Carbon Footprint"
          value={formatCarbon(summary?.totalCarbonFootprint || 0)}
          subtitle={`Across ${summary?.totalActivities || 0} logged entries`}
          icon={Globe2}
          iconColor="text-forest-800"
          iconBg="bg-forest-50"
        />

        {/* 2. Today's Carbon Emissions */}
        <StatCard
          title="Today's Carbon Emissions"
          value={formatCarbon(summary?.todayEmissions || 0)}
          subtitle={
            summary?.todayEmissions > 0
              ? `vs ${formatCarbon(summary?.yesterdayEmissions || 0)} yesterday`
              : 'No emissions logged today yet'
          }
          trend={summary?.yesterdayEmissions > 0 ? `${Math.abs(todayDiff)}%` : null}
          trendDirection={isDown ? 'down' : todayDiff > 0 ? 'up' : 'neutral'}
          isGoodWhenDown={true}
          icon={Calendar}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />

        {/* 3. Weekly Average */}
        <StatCard
          title="Weekly Average"
          value={formatCarbon(summary?.weeklyAverage || 0)}
          subtitle={`Target: ${summary?.targetDailyEmissionKg || 5.0} kg/day`}
          badge={
            (summary?.weeklyAverage || 0) <= (summary?.targetDailyEmissionKg || 5.0)
              ? 'On Track'
              : 'Needs Reduction'
          }
          icon={Target}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        {/* 4. Eco Points Earned */}
        <StatCard
          title="Eco Points Earned"
          value={formatEcoPoints(summary?.ecoPoints || 50)}
          subtitle={`Lvl ${summary?.level || 1} • ${summary?.levelTitle || 'Seedling'} (${summary?.streak || 1}d streak)`}
          icon={Trophy}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Main Conversational Quick Logger */}
      <QuickLogger onActivityLogged={handleActivityLogged} />

      {/* Visual Analytics Charts (Trend & Category) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EmissionTrendChart />
        </div>
        <div>
          <CategoryBreakdownChart />
        </div>
      </div>

      {/* Environmental Impact Equivalencies Overview */}
      <ImpactSummary
        totalCarbon={summary?.totalCarbonFootprint || 0}
        todayEmissions={summary?.todayEmissions || 0}
        weeklyAverage={summary?.weeklyAverage || 0}
        targetDaily={summary?.targetDailyEmissionKg || 5.0}
      />

      {/* Recent Activity Logs */}
      <RecentActivities
        activities={activities}
        onActivityDeleted={handleActivityDeleted}
      />
    </div>
  );
};
