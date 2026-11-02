const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');

// GET /api/profile
router.get('/', profileController.getProfile);

// PUT /api/profile
router.put('/', profileController.updateProfile);

// GET /api/profile/stats
router.get('/stats', profileController.getStats);

module.exports = router;
