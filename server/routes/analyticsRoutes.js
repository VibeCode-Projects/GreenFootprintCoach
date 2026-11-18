const express = require('express');
const router = express.Router();
const {
  getSummary,
  getDailyTrend,
  getWeekly,
  getCategories
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', getSummary);
router.get('/daily', getDailyTrend);
router.get('/weekly', getWeekly);
router.get('/categories', getCategories);

module.exports = router;
