const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Activity = require('../models/Activity');
const CarbonRecord = require('../models/CarbonRecord');

// @desc    Get user full profile with stats & achievements
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const achievements = await Achievement.find({ userId: req.user.id }).sort({ unlockedAt: -1 });

    const totalActivities = await Activity.countDocuments({ userId: req.user.id });
    const records = await CarbonRecord.find({ userId: req.user.id });
    const lifetimeCarbon = Number(records.reduce((acc, r) => acc + r.total_carbon_kg, 0).toFixed(2));

    res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        ecoPoints: user.ecoPoints,
        level: user.level,
        levelTitle: user.levelTitle,
        streak: user.streak,
        targetDailyEmissionKg: user.targetDailyEmissionKg,
        preferences: user.preferences,
        createdAt: user.createdAt,
        stats: {
          totalActivities,
          lifetimeCarbon,
          achievementsUnlocked: achievements.length
        },
        achievements
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PATCH /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, location, targetDailyEmissionKg, preferences, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (targetDailyEmissionKg) user.targetDailyEmissionKg = parseFloat(targetDailyEmissionKg);
    if (avatar) user.avatar = avatar;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        ecoPoints: user.ecoPoints,
        level: user.level,
        levelTitle: user.levelTitle,
        streak: user.streak,
        targetDailyEmissionKg: user.targetDailyEmissionKg,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all achievements (unlocked & locked catalogue)
// @route   GET /api/users/achievements
// @access  Private
exports.getAchievements = async (req, res, next) => {
  try {
    const unlocked = await Achievement.find({ userId: req.user.id });
    const unlockedKeys = new Set(unlocked.map(a => a.badgeKey));

    // Full catalog of available badges
    const catalog = [
      {
        badgeKey: 'welcome_pioneer',
        title: 'Green Pioneer',
        description: 'Joined the AI Eco-Habit & Green Footprint community',
        icon: 'Sprout',
        category: 'milestone',
        points: 20
      },
      {
        badgeKey: 'first_log',
        title: 'First Green Footprint',
        description: 'Logged your very first daily environmental activity',
        icon: 'Footprints',
        category: 'logging',
        points: 25
      },
      {
        badgeKey: 'streak_3',
        title: 'Consistency Scout',
        description: 'Logged activities for 3 consecutive days',
        icon: 'Flame',
        category: 'streak',
        points: 50
      },
      {
        badgeKey: 'streak_7',
        title: 'Weekly Earth Guardian',
        description: 'Maintained a 7-day sustainable logging streak',
        icon: 'Zap',
        category: 'streak',
        points: 100
      },
      {
        badgeKey: 'carbon_cutter_5kg',
        title: 'Climate Neutral Day',
        description: 'Kept daily carbon footprint under the 5.0 kg threshold',
        icon: 'ShieldCheck',
        category: 'reduction',
        points: 40
      },
      {
        badgeKey: 'point_collector_250',
        title: 'Sprout Master',
        description: 'Earned over 250 lifetime eco points',
        icon: 'TreePine',
        category: 'milestone',
        points: 50
      },
      {
        badgeKey: 'challenge_joined',
        title: 'Challenger Spirit',
        description: 'Joined your first community green challenge',
        icon: 'Compass',
        category: 'challenge',
        points: 20
      },
      {
        badgeKey: 'challenge_completed',
        title: 'Eco Conqueror',
        description: 'Successfully finished an eco habit challenge',
        icon: 'Trophy',
        category: 'challenge',
        points: 75
      }
    ];

    const allBadges = catalog.map(b => {
      const match = unlocked.find(u => u.badgeKey === b.badgeKey);
      return {
        ...b,
        isUnlocked: unlockedKeys.has(b.badgeKey),
        unlockedAt: match ? match.unlockedAt : null
      };
    });

    res.status(200).json({
      success: true,
      totalBadges: catalog.length,
      unlockedCount: unlocked.length,
      badges: allBadges
    });
  } catch (error) {
    next(error);
  }
};
