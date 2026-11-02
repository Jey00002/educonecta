const db = require('../data/database');

class MentorsController {
  getAll(req, res, next) {
    try {
      const { specialty, search } = req.query;
      const mentors = db.getMentors({ specialty, search });
      res.json({
        success: true,
        count: mentors.length,
        data: mentors
      });
    } catch (error) {
      next(error);
    }
  }

  getById(req, res, next) {
    try {
      const mentor = db.getMentorById(req.params.id);
      if (!mentor) {
        return res.status(404).json({
          success: false,
          message: 'Tutor no encontrado'
        });
      }
      res.json({
        success: true,
        data: mentor
      });
    } catch (error) {
      next(error);
    }
  }

  book(req, res, next) {
    try {
      const mentorId = Number(req.params.id);
      const mentor = db.getMentorById(mentorId);

      if (!mentor) {
        return res.status(404).json({
          success: false,
          message: 'Tutor no encontrado para la asesoría'
        });
      }

      const { studentName, studentEmail, topic, date, time } = req.body;

      const booking = db.addBooking({
        mentorId: mentor.id,
        mentorName: mentor.name,
        studentName,
        studentEmail,
        topic,
        date,
        time
      });

      res.status(201).json({
        success: true,
        message: `Solicitud de asesoría enviada con éxito a ${mentor.name}`,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MentorsController();
