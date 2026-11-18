const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  generateRecommendations,
  updateRecommendationStatus
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');
const { aiAndAuthLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.get('/', getRecommendations);
router.post('/generate', aiAndAuthLimiter, generateRecommendations);
router.patch('/:id', updateRecommendationStatus);

module.exports = router;
