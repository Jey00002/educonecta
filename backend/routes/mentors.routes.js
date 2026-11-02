const express = require('express');
const router = express.Router();
const mentorsController = require('../controllers/mentors.controller');

// GET /api/mentors
router.get('/', mentorsController.getAll);

// GET /api/mentors/:id
router.get('/:id', mentorsController.getById);

// POST /api/mentors/:id/book
router.post('/:id/book', mentorsController.book);

module.exports = router;
