const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [60, 'Name cannot exceed 60 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Do not return password by default in queries
  },
  avatar: {
    type: String,
    default: 'https://api.dicebear.com/7.x/bottts/svg?seed=eco'
  },
  bio: {
    type: String,
    default: 'Eco enthusiast on a journey to carbon neutrality.'
  },
  location: {
    type: String,
    default: 'Global Citizen'
  },
  ecoPoints: {
    type: Number,
    default: 50 // Welcome bonus points
  },
  level: {
    type: Number,
    default: 1
  },
  levelTitle: {
    type: String,
    default: 'Seedling'
  },
  streak: {
    type: Number,
    default: 1
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  targetDailyEmissionKg: {
    type: Number,
    default: 5.0 // Global target for climate neutrality
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true },
    theme: { type: String, default: 'light' }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate level and title from points
userSchema.methods.updateLevel = function() {
  const points = this.ecoPoints || 0;
  if (points >= 1000) {
    this.level = 5;
    this.levelTitle = 'Earth Champion';
  } else if (points >= 600) {
    this.level = 4;
    this.levelTitle = 'Green Guardian';
  } else if (points >= 300) {
    this.level = 3;
    this.levelTitle = 'Eco Scout';
  } else if (points >= 100) {
    this.level = 2;
    this.levelTitle = 'Sprout';
  } else {
    this.level = 1;
    this.levelTitle = 'Seedling';
  }
};

module.exports = mongoose.model('User', userSchema);
