const User = require('../models/User');
const Achievement = require('../models/Achievement');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'eco_habit_coach_super_secret_jwt_key_2026';
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if user exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Create user with 50 welcome eco points
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      ecoPoints: 50,
      level: 1,
      levelTitle: 'Seedling',
      streak: 1
    });

    // Create initial Welcome achievement
    await Achievement.create({
      userId: user._id,
      badgeKey: 'welcome_pioneer',
      title: 'Green Pioneer',
      description: 'Joined the AI Eco-Habit & Green Footprint community',
      icon: 'Sprout',
      category: 'milestone',
      points: 20
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Eco-Habit Coach.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        ecoPoints: user.ecoPoints,
        level: user.level,
        levelTitle: user.levelTitle,
        streak: user.streak,
        targetDailyEmissionKg: user.targetDailyEmissionKg
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    // Check user exists with password field explicitly selected
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        ecoPoints: user.ecoPoints,
        level: user.level,
        levelTitle: user.levelTitle,
        streak: user.streak,
        targetDailyEmissionKg: user.targetDailyEmissionKg
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const achievementsCount = await Achievement.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
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
        preferences: user.preferences,
        achievementsCount,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password handling
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your account email address.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // In production, an email with a reset token is dispatched.
    // For academic evaluation, return a friendly, functional demo message
    return res.status(200).json({
      success: true,
      message: user 
        ? `Password reset link simulated: In a production environment, an email is dispatched to ${email}. For academic testing, you may re-register or use demo credentials.`
        : `If an account with ${email} exists, password reset instructions have been simulated.`
    });
  } catch (error) {
    next(error);
  }
};
