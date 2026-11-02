const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings.controller');

// GET /api/bookings
router.get('/', bookingsController.getAll);

// POST /api/bookings
router.post('/', bookingsController.create);

module.exports = router;
