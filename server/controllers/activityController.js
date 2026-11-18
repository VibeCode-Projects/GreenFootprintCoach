const Activity = require('../models/Activity');
const CarbonRecord = require('../models/CarbonRecord');
const Recommendation = require('../models/Recommendation');
const User = require('../models/User');
const geminiService = require('../services/geminiService');
const carbonService = require('../services/carbonCalculationService');
const gamificationService = require('../services/gamificationService');

const { getLocalDateString, getStartOfDay, getEndOfDay } = require('../utils/dateUtils');

/**
 * Helper to sync daily aggregated CarbonRecord
 */
async function syncDailyCarbonRecord(userId, dateObj) {
  const targetDate = new Date(dateObj);
  const startOfDay = getStartOfDay(targetDate);
  const endOfDay = getEndOfDay(targetDate);
  const dateString = getLocalDateString(targetDate);

  const dailyActivities = await Activity.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  });

  if (dailyActivities.length === 0) {
    await CarbonRecord.findOneAndDelete({ userId, dateString });
    return null;
  }

  let totalKg = 0;
  let transportKg = 0;
  let energyKg = 0;
  let foodKg = 0;
  let shoppingKg = 0;
  let waterKg = 0;
  let wasteKg = 0;

  dailyActivities.forEach(act => {
    act.activities.forEach(item => {
      const kg = item.carbon_kg || 0;
      totalKg += kg;
      if (item.category === 'transport') transportKg += kg;
      else if (item.category === 'energy') energyKg += kg;
      else if (item.category === 'food') foodKg += kg;
      else if (item.category === 'shopping') shoppingKg += kg;
      else if (item.category === 'water') waterKg += kg;
      else if (item.category === 'waste') wasteKg += kg;
    });
  });

  const record = await CarbonRecord.findOneAndUpdate(
    { userId, dateString },
    {
      date: startOfDay,
      total_carbon_kg: Number(totalKg.toFixed(2)),
      transport_kg: Number(transportKg.toFixed(2)),
      energy_kg: Number(energyKg.toFixed(2)),
      food_kg: Number(foodKg.toFixed(2)),
      shopping_kg: Number(shoppingKg.toFixed(2)),
      water_kg: Number(waterKg.toFixed(2)),
      waste_kg: Number(wasteKg.toFixed(2)),
      activitiesCount: dailyActivities.length
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return record;
}

// @desc    Analyze natural language activity log via Gemini AI
// @route   POST /api/activities/analyze
// @access  Private
exports.analyzeNaturalLanguage = async (req, res, next) => {
  try {
    const { text, date } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a description of your activities.'
      });
    }

    const activityDate = date ? new Date(date) : new Date();

    // 1. Call Gemini AI Service (with automatic robust NLP fallback if key is unconfigured)
    const aiResult = await geminiService.analyzeActivities(text);

    // 2. Persist Activity document
    const activity = await Activity.create({
      userId: req.user.id,
      rawText: text,
      date: activityDate,
      activities: aiResult.activities,
      total_carbon_kg: aiResult.total_carbon_kg,
      eco_score: aiResult.eco_score,
      aiSummary: aiResult.summary,
      aiRecommendations: aiResult.recommendations,
      source: 'ai_logger',
      clarificationNeeded: aiResult.clarificationNeeded,
      followUpQuestions: aiResult.followUpQuestions
    });

    // 3. Update aggregated CarbonRecord
    await syncDailyCarbonRecord(req.user.id, activityDate);

    // 4. Update user streak
    const currentStreak = await gamificationService.updateStreak(req.user);

    // 5. Award eco points for logging (+15 points)
    const pointsUpdate = await gamificationService.awardPoints(req.user.id, 15, 'Daily Activity Logged');

    // 6. Check and unlock achievements
    const totalCount = await Activity.countDocuments({ userId: req.user.id });
    const newlyUnlockedAchievements = await gamificationService.checkAchievements(req.user, {
      activitiesCount: totalCount,
      latestTotalCarbon: aiResult.total_carbon_kg
    });

    // 7. Seed actionable recommendations into Recommendation collection if relevant
    if (aiResult.recommendations && aiResult.recommendations.length > 0) {
      for (const recText of aiResult.recommendations.slice(0, 2)) {
        await Recommendation.create({
          userId: req.user.id,
          title: 'Reduce Activity Impact',
          description: recText,
          category: aiResult.activities[0]?.category || 'general',
          estimatedSavingsKg: Number((aiResult.total_carbon_kg * 0.25).toFixed(1)),
          difficulty: 'easy',
          priority: 'medium',
          status: 'pending',
          source: 'gemini_ai'
        }).catch(() => {}); // non-blocking
      }
    }

    res.status(201).json({
      success: true,
      message: 'Activity log analyzed and saved successfully.',
      activity,
      gamification: {
        pointsEarned: 15,
        totalPoints: pointsUpdate?.ecoPoints,
        level: pointsUpdate?.level,
        levelTitle: pointsUpdate?.levelTitle,
        streak: currentStreak,
        newAchievements: newlyUnlockedAchievements
      },
      aiEngine: aiResult.aiEngine || 'Google Gemini AI'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log activity via manual multi-category calculator
// @route   POST /api/activities/manual
// @access  Private
exports.logManualCalculator = async (req, res, next) => {
  try {
    const { items, date, notes } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one valid calculator entry item.'
      });
    }

    const calculatedItems = [];
    let totalCarbon = 0;

    for (const item of items) {
      let result;
      switch (item.category) {
        case 'transport':
          result = carbonService.calculateTransport(item);
          break;
        case 'energy':
          result = carbonService.calculateEnergy(item);
          break;
        case 'food':
          result = carbonService.calculateFood(item);
          break;
        case 'shopping':
          result = carbonService.calculateShopping(item);
          break;
        case 'water':
          result = carbonService.calculateWater(item);
          break;
        case 'waste':
          result = carbonService.calculateWaste(item);
          break;
        default:
          result = {
            category: 'other',
            description: item.description || 'Calculated activity',
            carbon_kg: parseFloat(item.carbon_kg) || 1.0,
            assumptions: 'Custom manual entry'
          };
      }
      calculatedItems.push(result);
      totalCarbon += result.carbon_kg;
    }

    totalCarbon = Number(totalCarbon.toFixed(2));
    const activityDate = date ? new Date(date) : new Date();
    const ecoScore = carbonService.computeEcoScore(totalCarbon);

    const activity = await Activity.create({
      userId: req.user.id,
      rawText: notes || `Manual Calculator: ${calculatedItems.map(i => i.description).join(', ')}`,
      date: activityDate,
      activities: calculatedItems,
      total_carbon_kg: totalCarbon,
      eco_score: ecoScore,
      aiSummary: `Manual carbon footprint log totaling ${totalCarbon} kg CO2e across ${calculatedItems.length} categories.`,
      source: 'manual_calculator'
    });

    await syncDailyCarbonRecord(req.user.id, activityDate);
    const currentStreak = await gamificationService.updateStreak(req.user);
    const pointsUpdate = await gamificationService.awardPoints(req.user.id, 15, 'Calculator Entry');

    const totalCount = await Activity.countDocuments({ userId: req.user.id });
    const newlyUnlockedAchievements = await gamificationService.checkAchievements(req.user, {
      activitiesCount: totalCount,
      latestTotalCarbon: totalCarbon
    });

    res.status(201).json({
      success: true,
      message: 'Carbon calculator entry recorded successfully.',
      activity,
      gamification: {
        pointsEarned: 15,
        totalPoints: pointsUpdate?.ecoPoints,
        streak: currentStreak,
        newAchievements: newlyUnlockedAchievements
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user activities with pagination and date filter
// @route   GET /api/activities
// @access  Private
exports.getActivities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user.id };

    if (req.query.category) {
      filter['activities.category'] = req.query.category;
    }

    if (req.query.startDate && req.query.endDate) {
      filter.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const total = await Activity.countDocuments(filter);
    const activities = await Activity.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: activities.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      activities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single activity by ID
// @route   GET /api/activities/:id
// @access  Private
exports.getActivityById = async (req, res, next) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found.'
      });
    }

    res.status(200).json({
      success: true,
      activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete activity by ID
// @route   DELETE /api/activities/:id
// @access  Private
exports.deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found.'
      });
    }

    const actDate = activity.date;
    await activity.deleteOne();

    // Recalculate daily CarbonRecord
    await syncDailyCarbonRecord(req.user.id, actDate);

    res.status(200).json({
      success: true,
      message: 'Activity log deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
