const express = require('express');
const router = express.Router();
const resourcesController = require('../controllers/resources.controller');
const upload = require('../middlewares/upload');

// GET /api/resources (con filtros search, course, cycle, category, sort)
router.get('/', resourcesController.getAll);

// GET /api/resources/:id
router.get('/:id', resourcesController.getById);

// POST /api/resources (soporta multipart con archivo y json regular)
router.post('/', upload.single('file'), resourcesController.create);

// POST /api/resources/:id/download
router.post('/:id/download', resourcesController.download);

// POST /api/resources/:id/rate
router.post('/:id/rate', resourcesController.rate);

// DELETE /api/resources/:id
router.delete('/:id', resourcesController.remove);

module.exports = router;
