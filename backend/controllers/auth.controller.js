const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../data/database');
const { JWT_SECRET } = require('../middlewares/auth');

class AuthController {
  async login(req, res, next) {
    try {
      const { identifier, email, password } = req.body;
      const idToSearch = identifier || email;

      if (!idToSearch || !password) {
        return res.status(400).json({
          success: false,
          message: 'Por favor ingresa tu correo institucional o código estudiantil y contraseña.'
        });
      }

      const user = db.findUserByEmailOrCode(idToSearch);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas. Verifica tu código o correo institucional.'
        });
      }

      // Validar contraseña (acepta contraseñas demo y hash bcrypt)
      const validDemoPasswords = ['demo12345', '123456', 'edu12345', 'educonecta123', 'alex123', 'admin'];
      const isDemoPass = validDemoPasswords.includes(password.toLowerCase().trim());
      let isMatch = isDemoPass;

      if (!isMatch && user.passwordHash) {
        try {
          isMatch = await bcrypt.compare(password, user.passwordHash);
        } catch {
          isMatch = false;
        }
      }

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña incorrecta. Puedes usar la clave demo: demo12345'
        });
      }

      // Generar JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { passwordHash, ...safeUser } = user;

      res.json({
        success: true,
        message: `¡Bienvenido(a) de nuevo, ${user.name.split(' ')[0]}!`,
        data: {
          token,
          user: safeUser
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const { name, email, studentCode, password, degree, cycle } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, correo y contraseña son obligatorios.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres.'
        });
      }

      const existingUser = db.findUserByEmailOrCode(email) || (studentCode ? db.findUserByEmailOrCode(studentCode) : null);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una cuenta registrada con este correo o código de estudiante.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = db.createUser({
        name,
        email,
        studentCode,
        passwordHash,
        degree: degree || 'Ingeniería de Sistemas e Informática',
        cycle: cycle || 'Ciclo I'
      });

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, name: newUser.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { passwordHash: _, ...safeUser } = newUser;

      res.status(201).json({
        success: true,
        message: '¡Registro exitoso! Te damos la bienvenida a EduConecta (+100 pts de bono).',
        data: {
          token,
          user: safeUser
        }
      });
    } catch (error) {
      next(error);
    }
  }

  me(req, res, next) {
    try {
      res.json({
        success: true,
        data: req.user
      });
    } catch (error) {
      next(error);
    }
  }

  logout(req, res) {
    res.json({
      success: true,
      message: 'Sesión cerrada correctamente.'
    });
  }
}

module.exports = new AuthController();
