const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
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
    enum: ['transport', 'energy', 'food', 'shopping', 'water', 'waste', 'general'],
    default: 'general'
  },
  estimatedSavingsKg: {
    type: Number,
    default: 1.5,
    min: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  actionableSteps: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending',
    index: true
  },
  source: {
    type: String,
    enum: ['gemini_ai', 'rule_engine', 'system_preset'],
    default: 'gemini_ai'
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

recommendationSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
