const Recommendation = require('../models/Recommendation');
const CarbonRecord = require('../models/CarbonRecord');
const geminiService = require('../services/geminiService');
const gamificationService = require('../services/gamificationService');

// @desc    Get user recommendations
// @route   GET /api/recommendations
// @access  Private
exports.getRecommendations = async (req, res, next) => {
  try {
    const filter = { userId: req.user.id };

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }

    let recommendations = await Recommendation.find(filter).sort({ priority: -1, createdAt: -1 });

    // If user has zero recommendations yet, auto-generate default smart recommendations
    if (recommendations.length === 0 && !req.query.status) {
      const defaultRecs = [
        {
          userId: req.user.id,
          title: 'Switch to Low-Emission Commuting',
          description: 'Using public transit, cycling, or walking for trips under 3 km can save over 50 kg of CO2e every month.',
          category: 'transport',
          estimatedSavingsKg: 3.5,
          difficulty: 'medium',
          priority: 'high',
          actionableSteps: [
            'Try taking the metro or bus for your next trip to work/college',
            'Keep a bicycle tuned up for neighborhood errands',
            'Track your fuel savings on the Eco-Habit dashboard'
          ],
          status: 'pending',
          source: 'system_preset'
        },
        {
          userId: req.user.id,
          title: 'Optimize Air Conditioner Temperature',
          description: 'Keep AC settings at 24°C (75°F) instead of 18°C. Each degree increase cuts energy consumption by up to 6%.',
          category: 'energy',
          estimatedSavingsKg: 2.8,
          difficulty: 'easy',
          priority: 'high',
          actionableSteps: [
            'Set AC thermostat to 24°C',
            'Use timer mode to turn off after 4 hours at night',
            'Keep curtains closed during peak afternoon sun'
          ],
          status: 'pending',
          source: 'system_preset'
        },
        {
          userId: req.user.id,
          title: 'Adopt Plant-Forward Meal Swaps',
          description: 'Replacing 1-2 red meat meals per week with hearty plant-based proteins significantly decreases your diet footprint.',
          category: 'food',
          estimatedSavingsKg: 4.0,
          difficulty: 'easy',
          priority: 'medium',
          actionableSteps: [
            'Try lentil, chickpea, or bean-based curries',
            'Explore vegetarian dining options twice a week',
            'Choose locally produced seasonal vegetables'
          ],
          status: 'pending',
          source: 'system_preset'
        },
        {
          userId: req.user.id,
          title: 'Ditch Single-Use Plastic Water Bottles',
          description: 'Carrying a reusable insulated water flask prevents tens of plastic bottles from entering oceans and landfills.',
          category: 'shopping',
          estimatedSavingsKg: 1.2,
          difficulty: 'easy',
          priority: 'medium',
          actionableSteps: [
            'Keep a refillable steel bottle in your bag',
            'Refill at clean water stations',
            'Say no to single-use plastic cups'
          ],
          status: 'pending',
          source: 'system_preset'
        }
      ];

      await Recommendation.insertMany(defaultRecs);
      recommendations = await Recommendation.find(filter).sort({ priority: -1, createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger AI analysis to generate personalized green recommendations
// @route   POST /api/recommendations/generate
// @access  Private
exports.generateRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Gather last 30 days data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const records = await CarbonRecord.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    });

    let totalKg = 0;
    let transportKg = 0;
    let energyKg = 0;
    let foodKg = 0;

    records.forEach(r => {
      totalKg += r.total_carbon_kg || 0;
      transportKg += r.transport_kg || 0;
      energyKg += r.energy_kg || 0;
      foodKg += r.food_kg || 0;
    });

    const safeTotal = totalKg || 1;
    const summary = {
      totalKg: Number(totalKg.toFixed(2)),
      transportKg: Number(transportKg.toFixed(2)),
      transportPct: Math.round((transportKg / safeTotal) * 100),
      energyKg: Number(energyKg.toFixed(2)),
      energyPct: Math.round((energyKg / safeTotal) * 100),
      foodKg: Number(foodKg.toFixed(2)),
      foodPct: Math.round((foodKg / safeTotal) * 100),
      topCategory: transportKg >= energyKg ? (transportKg >= foodKg ? 'transport' : 'food') : (energyKg >= foodKg ? 'energy' : 'food')
    };

    const newRecs = await geminiService.generatePersonalizedAdvice(summary);

    const docsToInsert = newRecs.map(r => ({
      userId,
      title: r.title,
      description: r.description,
      category: r.category || 'general',
      estimatedSavingsKg: r.estimatedSavingsKg || 2.0,
      difficulty: r.difficulty || 'medium',
      priority: r.priority || 'medium',
      actionableSteps: r.actionableSteps || [],
      status: 'pending',
      source: 'gemini_ai'
    }));

    const inserted = await Recommendation.insertMany(docsToInsert);

    res.status(201).json({
      success: true,
      message: `Generated ${inserted.length} new personalized AI recommendations.`,
      recommendations: inserted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update recommendation status (pending, in_progress, completed)
// @route   PATCH /api/recommendations/:id
// @access  Private
exports.updateRecommendationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: pending, in_progress, completed.'
      });
    }

    const rec = await Recommendation.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!rec) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found.'
      });
    }

    const wasCompleted = rec.status === 'completed';
    rec.status = status;

    let pointsAwarded = 0;
    if (status === 'completed' && !wasCompleted) {
      rec.completedAt = new Date();
      // Award 25 eco points for adopting an eco recommendation
      const pts = await gamificationService.awardPoints(req.user.id, 25, 'Adopted Green Recommendation');
      pointsAwarded = 25;
    }

    await rec.save();

    res.status(200).json({
      success: true,
      message: `Recommendation marked as ${status}.`,
      recommendation: rec,
      pointsAwarded
    });
  } catch (error) {
    next(error);
  }
};
