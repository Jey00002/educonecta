const db = require('../data/database');

class ProfileController {
  getProfile(req, res, next) {
    try {
      const profile = db.getProfile();
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  updateProfile(req, res, next) {
    try {
      const updated = db.updateProfile(req.body);
      res.json({
        success: true,
        message: 'Perfil actualizado correctamente',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  getStats(req, res, next) {
    try {
      const stats = db.getStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProfileController();
