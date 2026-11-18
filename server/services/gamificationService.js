const User = require('../models/User');
const Achievement = require('../models/Achievement');

class GamificationService {
  /**
   * Update consecutive daily logging streak
   */
  async updateStreak(user) {
    const now = new Date();
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;

    if (!lastActive) {
      user.streak = 1;
      user.lastActiveDate = now;
      await user.save();
      return user.streak;
    }

    // Normalize to dates ignoring time
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());

    const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Logged in the next consecutive day
      user.streak += 1;
      user.lastActiveDate = now;
    } else if (diffDays === 0) {
      // Already logged today; keep current streak
      user.lastActiveDate = now;
    } else if (diffDays > 1) {
      // Missed more than 1 day; reset streak
      user.streak = 1;
      user.lastActiveDate = now;
    }

    await user.save();
    return user.streak;
  }

  /**
   * Add eco points and handle leveling
   */
  async awardPoints(userId, points, reason = 'Eco Activity') {
    const user = await User.findById(userId);
    if (!user) return null;

    const oldLevel = user.level;
    user.ecoPoints = (user.ecoPoints || 0) + points;
    user.updateLevel();
    await user.save();

    const leveledUp = user.level > oldLevel;

    return {
      ecoPoints: user.ecoPoints,
      level: user.level,
      levelTitle: user.levelTitle,
      leveledUp,
      pointsAdded: points,
      reason
    };
  }

  /**
   * Check and unlock eligible achievements
   */
  async checkAchievements(user, context = {}) {
    const newlyUnlocked = [];
    const userId = user._id;

    // Define badge criteria
    const criteria = [
      {
        badgeKey: 'first_log',
        title: 'First Green Footprint',
        description: 'Logged your very first daily environmental activity',
        icon: 'Footprints',
        category: 'logging',
        points: 25,
        condition: () => context.activitiesCount >= 1
      },
      {
        badgeKey: 'streak_3',
        title: 'Consistency Scout',
        description: 'Logged activities for 3 consecutive days',
        icon: 'Flame',
        category: 'streak',
        points: 50,
        condition: () => user.streak >= 3
      },
      {
        badgeKey: 'streak_7',
        title: 'Weekly Earth Guardian',
        description: 'Maintained a 7-day sustainable logging streak',
        icon: 'Zap',
        category: 'streak',
        points: 100,
        condition: () => user.streak >= 7
      },
      {
        badgeKey: 'carbon_cutter_5kg',
        title: 'Climate Neutral Day',
        description: 'Kept daily carbon footprint under the sustainable 5.0 kg threshold',
        icon: 'ShieldCheck',
        category: 'reduction',
        points: 40,
        condition: () => context.latestTotalCarbon && context.latestTotalCarbon <= 5.0
      },
      {
        badgeKey: 'point_collector_250',
        title: 'Sprout Master',
        description: 'Earned over 250 lifetime eco points',
        icon: 'Sprout',
        category: 'milestone',
        points: 50,
        condition: () => user.ecoPoints >= 250
      },
      {
        badgeKey: 'challenge_joined',
        title: 'Challenger Spirit',
        description: 'Joined your first community green challenge',
        icon: 'Compass',
        category: 'challenge',
        points: 20,
        condition: () => context.challengeJoined === true
      },
      {
        badgeKey: 'challenge_completed',
        title: 'Eco Conqueror',
        description: 'Successfully finished an eco habit challenge',
        icon: 'Trophy',
        category: 'challenge',
        points: 75,
        condition: () => context.challengeCompleted === true
      }
    ];

    for (const item of criteria) {
      if (item.condition()) {
        const existing = await Achievement.findOne({ userId, badgeKey: item.badgeKey });
        if (!existing) {
          const unlocked = await Achievement.create({
            userId,
            badgeKey: item.badgeKey,
            title: item.title,
            description: item.description,
            icon: item.icon,
            category: item.category,
            points: item.points
          });

          // Award bonus points for achievement
          user.ecoPoints = (user.ecoPoints || 0) + item.points;
          user.updateLevel();
          await user.save();

          newlyUnlocked.push(unlocked);
        }
      }
    }

    return newlyUnlocked;
  }
}

module.exports = new GamificationService();
