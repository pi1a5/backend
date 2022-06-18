const Course = require('../models/Course');

class CouserController {
  async courses(req, res) {
    try {
      const course = await Course.findAll();
      res.status(200).json(course);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new CouserController();
