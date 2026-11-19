const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');
const { seedDatabase } = require('./utils/seedData');

// Route imports
const authRoutes = require('./routes/authRoutes');
const activityRoutes = require('./routes/activityRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS'));
  },
  credentials: true
}));

// Request body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API Rate Limiter
app.use('/api', apiLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '')
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/users', userRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AI-Powered Eco-Habit & Green Footprint Coach API',
    version: '1.0.0',
    documentation: '/api/health',
    status: 'online'
  });
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

let server;

async function startServer() {
  try {
    await connectDB();
    await seedDatabase();

    server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🌿 Eco-Habit Coach Backend Server Running on Port: ${PORT}`);
      console.log(`📡 Health API: http://localhost:${PORT}/api/health`);
      console.log(`🤖 Gemini AI Key: ${process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Not Set (Using Deterministic NLP Fallback) ⚠️'}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };
