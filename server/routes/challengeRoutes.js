const express = require('express');
const router = express.Router();
const {
  getChallenges,
  joinChallenge,
  updateProgress,
  getLeaderboard
} = require('../controllers/challengeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getChallenges);
router.post('/join', joinChallenge);
router.patch('/:id/progress', updateProgress);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
