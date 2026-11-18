const mongoose = require('mongoose');

const carbonRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  dateString: {
    type: String, // Normalized format YYYY-MM-DD
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true
  },
  total_carbon_kg: {
    type: Number,
    default: 0
  },
  transport_kg: {
    type: Number,
    default: 0
  },
  energy_kg: {
    type: Number,
    default: 0
  },
  food_kg: {
    type: Number,
    default: 0
  },
  shopping_kg: {
    type: Number,
    default: 0
  },
  water_kg: {
    type: Number,
    default: 0
  },
  waste_kg: {
    type: Number,
    default: 0
  },
  activitiesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure only one aggregated record per user per calendar day
carbonRecordSchema.index({ userId: 1, dateString: 1 }, { unique: true });

module.exports = mongoose.model('CarbonRecord', carbonRecordSchema);
