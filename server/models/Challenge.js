const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['transport', 'energy', 'food', 'shopping', 'water', 'waste', 'habit'],
    default: 'habit'
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'community'],
    default: 'weekly'
  },
  targetDays: {
    type: Number,
    default: 7
  },
  targetMetric: {
    type: String,
    default: 'Complete habit daily'
  },
  pointsReward: {
    type: Number,
    default: 50
  },
  carbonSavingsEstimateKg: {
    type: Number,
    default: 3.5
  },
  icon: {
    type: String,
    default: 'Award' // Lucide icon name
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  participantsCount: {
    type: Number,
    default: 12
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Challenge', challengeSchema);
