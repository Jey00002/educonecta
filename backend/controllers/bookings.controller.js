const db = require('../data/database');

class BookingsController {
  getAll(req, res, next) {
    try {
      const bookings = db.getBookings();
      res.json({
        success: true,
        count: bookings.length,
        data: bookings
      });
    } catch (error) {
      next(error);
    }
  }

  create(req, res, next) {
    try {
      const { mentorId, mentorName, studentName, studentEmail, topic, date, time } = req.body;
      const booking = db.addBooking({
        mentorId,
        mentorName,
        studentName,
        studentEmail,
        topic,
        date,
        time
      });

      res.status(201).json({
        success: true,
        message: 'Sesión de asesoría programada',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookingsController();
