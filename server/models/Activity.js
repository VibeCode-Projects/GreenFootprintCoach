const mongoose = require('mongoose');

const singleActivityItemSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['transport', 'energy', 'food', 'shopping', 'water', 'waste', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  carbon_kg: {
    type: Number,
    required: true,
    min: 0
  },
  distance_km: {
    type: Number,
    default: null
  },
  duration_hours: {
    type: Number,
    default: null
  },
  quantity: {
    type: Number,
    default: null
  },
  unit: {
    type: String,
    default: null
  },
  assumptions: {
    type: String,
    default: ''
  }
}, { _id: false });

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rawText: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  activities: {
    type: [singleActivityItemSchema],
    validate: [arr => arr.length > 0, 'At least one activity item is required']
  },
  total_carbon_kg: {
    type: Number,
    required: true,
    min: 0
  },
  eco_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 70
  },
  aiSummary: {
    type: String,
    default: ''
  },
  aiRecommendations: {
    type: [String],
    default: []
  },
  source: {
    type: String,
    enum: ['ai_logger', 'manual_calculator'],
    default: 'ai_logger'
  },
  clarificationNeeded: {
    type: Boolean,
    default: false
  },
  followUpQuestions: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Index for query optimization
activitySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Activity', activitySchema);
