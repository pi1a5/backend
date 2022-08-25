/* eslint-disable class-methods-use-this */
const Course = require('../models/Course');

class CouserController {
  async courses(req, res) {
    try {
      const course = await Course.findAll();
      res.status(course.status).json(course.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new CouserController();
