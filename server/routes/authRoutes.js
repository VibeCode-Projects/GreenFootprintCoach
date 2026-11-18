const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { aiAndAuthLimiter } = require('../middleware/rateLimiter');

router.post('/register', aiAndAuthLimiter, register);
router.post('/login', aiAndAuthLimiter, login);
router.post('/forgot-password', aiAndAuthLimiter, forgotPassword);
router.get('/me', protect, getMe);

module.exports = router;
