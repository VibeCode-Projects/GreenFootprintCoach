const mongoose = require('mongoose');

const userChallengeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['joined', 'in_progress', 'completed', 'abandoned'],
    default: 'joined',
    index: true
  },
  progressDays: {
    type: Number,
    default: 0,
    min: 0
  },
  targetDays: {
    type: Number,
    default: 7
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastCheckInDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  pointsAwarded: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure a user can only have one active instance of a challenge at a time
userChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

module.exports = mongoose.model('UserChallenge', userChallengeSchema);
