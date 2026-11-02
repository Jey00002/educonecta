const jwt = require('jsonwebtoken');
const db = require('../data/database');

const JWT_SECRET = process.env.JWT_SECRET || 'educonecta-utp-secret-key-2026';

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado. Inicia sesión para continuar.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o sesión caducada.'
      });
    }

    // Excluir hash de contraseña
    const { passwordHash, ...userClean } = user;
    req.user = userClean;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token de sesión inválido o expirado.'
    });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = db.findUserById(decoded.id);
      if (user) {
        const { passwordHash, ...userClean } = user;
        req.user = userClean;
      }
    } catch (e) {
      // Ignorar error en auth opcional
    }
  }
  next();
}

module.exports = {
  requireAuth,
  optionalAuth,
  JWT_SECRET
};
