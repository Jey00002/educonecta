const express = require('express');
const router = express.Router();
const communitiesController = require('../controllers/communities.controller');

// GET /api/communities
router.get('/', communitiesController.getAll);

// POST /api/communities
router.post('/', communitiesController.create);

// POST /api/communities/:id/toggle-membership
router.post('/:id/toggle-membership', communitiesController.toggleMembership);

module.exports = router;
