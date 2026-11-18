const CarbonRecord = require('../models/CarbonRecord');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { getLocalDateString, getStartOfDay } = require('../utils/dateUtils');

// @desc    Get dashboard summary statistics
// @route   GET /api/analytics/summary
// @access  Private
exports.getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const todayStr = getLocalDateString(now);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // 1. Get today's record
    const todayRecord = await CarbonRecord.findOne({ userId, dateString: todayStr });
    const todayEmissions = todayRecord ? todayRecord.total_carbon_kg : 0;

    // 2. Get yesterday's record
    const yesterdayRecord = await CarbonRecord.findOne({ userId, dateString: yesterdayStr });
    const yesterdayEmissions = yesterdayRecord ? yesterdayRecord.total_carbon_kg : 0;

    // Daily change percentage
    let dailyChangePct = 0;
    if (yesterdayEmissions > 0) {
      dailyChangePct = Number((((todayEmissions - yesterdayEmissions) / yesterdayEmissions) * 100).toFixed(1));
    }

    // 3. Weekly Average (last 7 days)
    const weekRecords = await CarbonRecord.find({
      userId,
      date: { $gte: sevenDaysAgo }
    });

    const weeklyTotal = weekRecords.reduce((acc, r) => acc + r.total_carbon_kg, 0);
    const weeklyAverage = Number((weeklyTotal / 7).toFixed(2));

    // 4. Total lifetime emissions & activities
    const allRecords = await CarbonRecord.find({ userId });
    const totalCarbon = Number(allRecords.reduce((acc, r) => acc + r.total_carbon_kg, 0).toFixed(2));
    const totalActivities = await Activity.countDocuments({ userId });

    // 5. Category totals all-time
    const catTotals = {
      transport: Number(allRecords.reduce((acc, r) => acc + (r.transport_kg || 0), 0).toFixed(2)),
      energy: Number(allRecords.reduce((acc, r) => acc + (r.energy_kg || 0), 0).toFixed(2)),
      food: Number(allRecords.reduce((acc, r) => acc + (r.food_kg || 0), 0).toFixed(2)),
      shopping: Number(allRecords.reduce((acc, r) => acc + (r.shopping_kg || 0), 0).toFixed(2)),
      water: Number(allRecords.reduce((acc, r) => acc + (r.water_kg || 0), 0).toFixed(2)),
      waste: Number(allRecords.reduce((acc, r) => acc + (r.waste_kg || 0), 0).toFixed(2))
    };

    let dominantCategory = 'transport';
    let maxCatVal = -1;
    Object.entries(catTotals).forEach(([cat, val]) => {
      if (val > maxCatVal) {
        maxCatVal = val;
        dominantCategory = cat;
      }
    });

    const user = await User.findById(userId);

    res.status(200).json({
      success: true,
      data: {
        totalCarbonFootprint: totalCarbon,
        todayEmissions,
        yesterdayEmissions,
        dailyChangePct,
        weeklyAverage,
        weeklyTotal: Number(weeklyTotal.toFixed(2)),
        ecoPoints: user.ecoPoints,
        level: user.level,
        levelTitle: user.levelTitle,
        streak: user.streak,
        totalActivities,
        targetDailyEmissionKg: user.targetDailyEmissionKg || 5.0,
        dominantCategory,
        categoryTotals: catTotals
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily carbon emission trend (7d, 30d, 90d)
// @route   GET /api/analytics/daily
// @access  Private
exports.getDailyTrend = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const daysParam = parseInt(req.query.days, 10) || 7;
    const numDays = Math.min(90, Math.max(7, daysParam));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (numDays - 1));
    startDate.setHours(0, 0, 0, 0);

    const records = await CarbonRecord.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const recordMap = new Map();
    records.forEach(r => {
      recordMap.set(r.dateString, r);
    });

    // Build unbroken series
    const dailyData = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < numDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const str = getLocalDateString(d);
      const dayLabel = `${weekdays[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`;

      const rec = recordMap.get(str);
      dailyData.push({
        date: str,
        label: dayLabel,
        total_carbon_kg: rec ? rec.total_carbon_kg : 0,
        transport: rec ? rec.transport_kg : 0,
        energy: rec ? rec.energy_kg : 0,
        food: rec ? rec.food_kg : 0,
        shopping: rec ? rec.shopping_kg : 0,
        water: rec ? rec.water_kg : 0,
        waste: rec ? rec.waste_kg : 0,
        activitiesCount: rec ? rec.activitiesCount : 0
      });
    }

    res.status(200).json({
      success: true,
      days: numDays,
      data: dailyData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly grouped emissions
// @route   GET /api/analytics/weekly
// @access  Private
exports.getWeekly = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const numWeeks = 4; // Past 4 weeks

    const weeks = [];
    const now = new Date();

    for (let w = numWeeks - 1; w >= 0; w--) {
      const end = new Date(now);
      end.setDate(end.getDate() - (w * 7));
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const records = await CarbonRecord.find({
        userId,
        date: { $gte: start, $lte: end }
      });

      const total = Number(records.reduce((acc, r) => acc + r.total_carbon_kg, 0).toFixed(2));
      weeks.push({
        weekLabel: `Wk ${numWeeks - w}`,
        range: `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`,
        total_carbon_kg: total,
        average_daily: Number((total / 7).toFixed(2))
      });
    }

    res.status(200).json({
      success: true,
      data: weeks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise emissions for pie/donut charts
// @route   GET /api/analytics/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days, 10) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const records = await CarbonRecord.find({
      userId,
      date: { $gte: startDate }
    });

    const totals = {
      transport: 0,
      energy: 0,
      food: 0,
      shopping: 0,
      water: 0,
      waste: 0
    };

    records.forEach(r => {
      totals.transport += r.transport_kg || 0;
      totals.energy += r.energy_kg || 0;
      totals.food += r.food_kg || 0;
      totals.shopping += r.shopping_kg || 0;
      totals.water += r.water_kg || 0;
      totals.waste += r.waste_kg || 0;
    });

    const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

    const categoryList = [
      { name: 'Transport', key: 'transport', carbon_kg: Number(totals.transport.toFixed(2)), color: '#3B82F6' },
      { name: 'Energy & AC', key: 'energy', carbon_kg: Number(totals.energy.toFixed(2)), color: '#F59E0B' },
      { name: 'Food & Diet', key: 'food', carbon_kg: Number(totals.food.toFixed(2)), color: '#10B981' },
      { name: 'Shopping & Goods', key: 'shopping', carbon_kg: Number(totals.shopping.toFixed(2)), color: '#8B5CF6' },
      { name: 'Water Usage', key: 'water', carbon_kg: Number(totals.water.toFixed(2)), color: '#06B6D4' },
      { name: 'Waste Management', key: 'waste', carbon_kg: Number(totals.waste.toFixed(2)), color: '#64748B' }
    ].map(cat => ({
      ...cat,
      percentage: grandTotal > 0 ? Number(((cat.carbon_kg / grandTotal) * 100).toFixed(1)) : 0
    }));

    res.status(200).json({
      success: true,
      grandTotal: Number(grandTotal.toFixed(2)),
      data: categoryList
    });
  } catch (error) {
    next(error);
  }
};
