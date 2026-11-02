const express = require('express');
const router = express.Router();

const resourcesRoutes = require('./resources.routes');
const mentorsRoutes = require('./mentors.routes');
const communitiesRoutes = require('./communities.routes');
const profileRoutes = require('./profile.routes');
const bookingsRoutes = require('./bookings.routes');
const authRoutes = require('./auth.routes');

// Verificación de estado del API
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'EduConecta API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Rutas agrupadas
router.use('/auth', authRoutes);
router.use('/resources', resourcesRoutes);
router.use('/mentors', mentorsRoutes);
router.use('/communities', communitiesRoutes);
router.use('/profile', profileRoutes);
router.use('/bookings', bookingsRoutes);

module.exports = router;
