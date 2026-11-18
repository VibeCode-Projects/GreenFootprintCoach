const express = require('express');
const router = express.Router();
const {
  analyzeNaturalLanguage,
  logManualCalculator,
  getActivities,
  getActivityById,
  deleteActivity
} = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');
const { aiAndAuthLimiter } = require('../middleware/rateLimiter');

// All activity routes require authentication
router.use(protect);

router.post('/analyze', aiAndAuthLimiter, analyzeNaturalLanguage);
router.post('/manual', logManualCalculator);
router.get('/', getActivities);
router.get('/:id', getActivityById);
router.delete('/:id', deleteActivity);

module.exports = router;
