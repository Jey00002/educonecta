const db = require('../data/database');

class CommunitiesController {
  getAll(req, res, next) {
    try {
      const communities = db.getCommunities();
      res.json({
        success: true,
        count: communities.length,
        data: communities
      });
    } catch (error) {
      next(error);
    }
  }

  toggleMembership(req, res, next) {
    try {
      const community = db.toggleCommunityMembership(req.params.id);
      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Comunidad no encontrada'
        });
      }

      res.json({
        success: true,
        message: community.isMember
          ? `¡Te has unido a ${community.name}!`
          : `Has salido de ${community.name}`,
        data: community
      });
    } catch (error) {
      next(error);
    }
  }

  create(req, res, next) {
    try {
      const { name, faculty, type, description } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de la comunidad es obligatorio'
        });
      }

      const community = db.createCommunity({ name: name.trim(), faculty, type, description });
      res.status(201).json({
        success: true,
        message: 'Comunidad creada exitosamente',
        data: community
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommunitiesController();
