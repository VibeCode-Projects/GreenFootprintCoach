const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getAchievements
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.get('/achievements', getAchievements);

module.exports = router;
