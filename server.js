require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const apiRoutes = require('./backend/routes');
const { errorHandler } = require('./backend/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// Middlewares Globales
// ==========================================
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos subidos (archivos PDF, ZIP, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir archivos estáticos del frontend (HTML, CSS, JS, Assets)
app.use(express.static(__dirname));

// ==========================================
// Rutas de API REST
// ==========================================
app.use('/api', apiRoutes);

// Fallback SPA: Cualquier ruta web no-API sirve el index.html
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  next();
});

// Ruta 404 para endpoints de API no existentes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta de API no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Manejador central de errores
app.use(errorHandler);

// Iniciar Servidor HTTP
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`Servidor EduConecta Backend activo en Node.js`);
    console.log(`URL Principal: http://localhost:${PORT}`);
    console.log(`API Health:    http://localhost:${PORT}/api/health`);
    console.log(`API Recursos:  http://localhost:${PORT}/api/resources`);
    console.log(`API Tutores:   http://localhost:${PORT}/api/mentors`);
    console.log(`API Comunidad: http://localhost:${PORT}/api/communities`);
    console.log('====================================================');
  });
}

module.exports = app;
