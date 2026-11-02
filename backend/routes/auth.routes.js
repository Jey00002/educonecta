const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/register
router.post('/register', authController.register);

// GET /api/auth/me (requiere token JWT)
router.get('/me', requireAuth, authController.me);

// POST /api/auth/logout
router.post('/logout', authController.logout);

module.exports = router;
