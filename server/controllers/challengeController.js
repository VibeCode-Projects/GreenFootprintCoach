const Challenge = require('../models/Challenge');
const UserChallenge = require('../models/UserChallenge');
const User = require('../models/User');
const gamificationService = require('../services/gamificationService');

// @desc    Get all challenges with user progress
// @route   GET /api/challenges
// @access  Private
exports.getChallenges = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const challenges = await Challenge.find({ isActive: true });
    const userChallenges = await UserChallenge.find({ userId });

    const userChallengeMap = new Map();
    userChallenges.forEach(uc => {
      userChallengeMap.set(uc.challengeId.toString(), uc);
    });

    const enrichedChallenges = challenges.map(c => {
      const uc = userChallengeMap.get(c._id.toString());
      return {
        ...c.toObject(),
        userStatus: uc ? uc.status : 'not_joined',
        userProgress: uc ? uc.progressDays : 0,
        isCompleted: uc ? uc.status === 'completed' : false,
        joinedAt: uc ? uc.joinedAt : null,
        userChallengeId: uc ? uc._id : null
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedChallenges.length,
      challenges: enrichedChallenges
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join an eco challenge
// @route   POST /api/challenges/join
// @access  Private
exports.joinChallenge = async (req, res, next) => {
  try {
    const { challengeId } = req.body;

    if (!challengeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid challengeId.'
      });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found.'
      });
    }

    let userChallenge = await UserChallenge.findOne({
      userId: req.user.id,
      challengeId
    });

    if (userChallenge) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this challenge.'
      });
    }

    userChallenge = await UserChallenge.create({
      userId: req.user.id,
      challengeId,
      targetDays: challenge.targetDays,
      status: 'in_progress',
      progressDays: 0
    });

    // Increment challenge participant counter
    challenge.participantsCount = (challenge.participantsCount || 0) + 1;
    await challenge.save();

    // Check achievement for joining challenge
    await gamificationService.checkAchievements(req.user, { challengeJoined: true });

    res.status(201).json({
      success: true,
      message: `Successfully joined "${challenge.title}"!`,
      userChallenge
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-in / advance progress or complete a challenge
// @route   PATCH /api/challenges/:id/progress
// @access  Private
exports.updateProgress = async (req, res, next) => {
  try {
    const challengeId = req.params.id;
    const userChallenge = await UserChallenge.findOne({
      userId: req.user.id,
      challengeId
    });

    if (!userChallenge) {
      return res.status(404).json({
        success: false,
        message: 'You have not joined this challenge yet.'
      });
    }

    if (userChallenge.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This challenge has already been completed.'
      });
    }

    const challenge = await Challenge.findById(challengeId);
    userChallenge.progressDays += 1;
    userChallenge.lastCheckInDate = new Date();

    let pointsAwarded = 0;
    let isNowCompleted = false;

    // Check if user has achieved the target days
    if (userChallenge.progressDays >= userChallenge.targetDays) {
      userChallenge.status = 'completed';
      userChallenge.completedAt = new Date();
      isNowCompleted = true;

      // Prevent duplicate reward points
      if (!userChallenge.pointsAwarded) {
        userChallenge.pointsAwarded = true;
        const reward = challenge ? challenge.pointsReward : 50;
        await gamificationService.awardPoints(req.user.id, reward, `Challenge Completed: ${challenge?.title}`);
        pointsAwarded = reward;

        await gamificationService.checkAchievements(req.user, { challengeCompleted: true });
      }
    } else {
      userChallenge.status = 'in_progress';
      // Small daily check-in bonus (5 points)
      await gamificationService.awardPoints(req.user.id, 5, 'Daily Challenge Check-in');
      pointsAwarded = 5;
    }

    await userChallenge.save();

    res.status(200).json({
      success: true,
      message: isNowCompleted
        ? `Congratulations! You conquered the "${challenge.title}" challenge and earned ${pointsAwarded} Eco Points!`
        : `Check-in recorded! Progress: ${userChallenge.progressDays}/${userChallenge.targetDays} days.`,
      userChallenge,
      pointsAwarded,
      isCompleted: isNowCompleted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Community Leaderboard
// @route   GET /api/challenges/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res, next) => {
  try {
    // Fetch top real users
    const realUsers = await User.find({})
      .select('name avatar ecoPoints level levelTitle streak location')
      .sort({ ecoPoints: -1 })
      .limit(10);

    const mappedReal = realUsers.map((u, idx) => ({
      id: u._id,
      rank: idx + 1,
      name: u.name,
      avatar: u.avatar,
      ecoPoints: u.ecoPoints,
      level: u.level,
      levelTitle: u.levelTitle,
      streak: u.streak,
      location: u.location,
      isCurrentUser: u._id.toString() === req.user.id.toString(),
      isDemo: false
    }));

    // Realistic demo community peers (clearly identified as demo peers if list is short)
    const demoPeers = [
      {
        id: 'demo-peer-1',
        name: 'Aarav Patel',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aarav',
        ecoPoints: 840,
        level: 4,
        levelTitle: 'Green Guardian',
        streak: 18,
        location: 'Mumbai, IN',
        isCurrentUser: false,
        isDemo: true
      },
      {
        id: 'demo-peer-2',
        name: 'Emma Watson',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Emma',
        ecoPoints: 620,
        level: 4,
        levelTitle: 'Green Guardian',
        streak: 12,
        location: 'London, UK',
        isCurrentUser: false,
        isDemo: true
      },
      {
        id: 'demo-peer-3',
        name: 'Carlos Mendez',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Carlos',
        ecoPoints: 490,
        level: 3,
        levelTitle: 'Eco Scout',
        streak: 9,
        location: 'Madrid, ES',
        isCurrentUser: false,
        isDemo: true
      },
      {
        id: 'demo-peer-4',
        name: 'Ananya Sharma',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ananya',
        ecoPoints: 310,
        level: 3,
        levelTitle: 'Eco Scout',
        streak: 7,
        location: 'Bengaluru, IN',
        isCurrentUser: false,
        isDemo: true
      }
    ];

    // Combine and sort
    const combined = [...mappedReal];
    // If fewer than 5 real users, include demo peers
    if (combined.length < 5) {
      demoPeers.forEach(dp => {
        if (!combined.some(u => u.name === dp.name)) {
          combined.push(dp);
        }
      });
    }

    combined.sort((a, b) => b.ecoPoints - a.ecoPoints);
    const finalLeaderboard = combined.map((u, i) => ({ ...u, rank: i + 1 }));

    // User's own rank
    const currentUserEntry = finalLeaderboard.find(u => u.isCurrentUser);

    res.status(200).json({
      success: true,
      leaderboard: finalLeaderboard,
      userRank: currentUserEntry ? currentUserEntry.rank : 1
    });
  } catch (error) {
    next(error);
  }
};
