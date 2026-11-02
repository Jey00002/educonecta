const db = require('../data/database');
const path = require('path');
const fs = require('fs');

class ResourcesController {
  getAll(req, res, next) {
    try {
      const { search, course, cycle, category, sort, type } = req.query;
      const resources = db.getResources({ search, course, cycle, category, sort, type });
      res.json({
        success: true,
        count: resources.length,
        data: resources
      });
    } catch (error) {
      next(error);
    }
  }

  getById(req, res, next) {
    try {
      const resource = db.getResourceById(req.params.id);
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Recurso académico no encontrado'
        });
      }
      res.json({
        success: true,
        data: resource
      });
    } catch (error) {
      next(error);
    }
  }

  create(req, res, next) {
    try {
      const { title, course, cycle, category, description, resourceType, youtubeUrl, githubUrl } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'El título del documento es obligatorio'
        });
      }

      let fileFormat = 'PDF';
      let fileSize = '3.5 MB';
      let fileUrl = null;

      if (resourceType === 'video' || youtubeUrl) {
        fileFormat = 'YouTube HD';
        fileSize = 'Video Tutorial';
      } else if (resourceType === 'repo' || githubUrl) {
        fileFormat = 'GitHub Repo';
        fileSize = 'Código Fuente';
      } else if (req.file) {
        const ext = path.extname(req.file.originalname).replace('.', '').toUpperCase();
        fileFormat = ext || 'PDF';
        const bytes = req.file.size;
        fileSize = bytes > 1024 * 1024
          ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
          : `${(bytes / 1024).toFixed(0)} KB`;
        fileUrl = `/uploads/${req.file.filename}`;
      }

      const newResource = db.addResource({
        title: title.trim(),
        course: course || 'Algoritmos y Estructura de Datos',
        cycle: cycle || 'Ciclo IV',
        category: category || 'Apuntes y Resúmenes',
        description: description || 'Documento académico aportado por el estudiante.',
        fileFormat,
        fileSize,
        fileUrl,
        resourceType: resourceType || (youtubeUrl ? 'video' : (githubUrl ? 'repo' : 'pdf')),
        youtubeUrl: youtubeUrl || null,
        githubUrl: githubUrl || null
      });

      res.status(201).json({
        success: true,
        message: 'Recurso académico publicado exitosamente (+50 pts)',
        data: newResource
      });
    } catch (error) {
      next(error);
    }
  }

  download(req, res, next) {
    try {
      const { id } = req.params;
      const resource = db.incrementDownloads(id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Recurso no encontrado'
        });
      }

      // Si tiene archivo real físico, permitir descarga directa si se pide
      if (resource.fileUrl) {
        const filePath = path.join(__dirname, '..', '..', resource.fileUrl);
        if (fs.existsSync(filePath)) {
          return res.download(filePath, `${resource.title}.${resource.fileFormat.toLowerCase()}`);
        }
      }

      res.json({
        success: true,
        message: `Descarga iniciada de "${resource.title}"`,
        data: {
          id: resource.id,
          title: resource.title,
          downloadsCount: resource.downloadsCount,
          downloadUrl: resource.fileUrl || null
        }
      });
    } catch (error) {
      next(error);
    }
  }

  rate(req, res, next) {
    try {
      const { id } = req.params;
      const { rating } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'La calificación debe estar entre 1 y 5 estrellas'
        });
      }

      const updated = db.rateResource(id, rating);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Recurso no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Calificación registrada',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  remove(req, res, next) {
    try {
      const success = db.deleteResource(req.params.id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Recurso no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Recurso eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ResourcesController();
