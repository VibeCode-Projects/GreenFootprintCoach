const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  badgeKey: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['logging', 'streak', 'reduction', 'challenge', 'milestone'],
    default: 'logging'
  },
  points: {
    type: Number,
    default: 25
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// A user can only earn a specific badgeKey once
achievementSchema.index({ userId: 1, badgeKey: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);
