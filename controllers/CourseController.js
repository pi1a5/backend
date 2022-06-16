const Course = require('../models/Course');

class CouserController {

  async courses(req, res) {
    try {
      var course = await Course.findAll();
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      res.status(200).json(course);
    } catch (error) {
      res.status(500).json(error);
    }
  }

}

module.exports = new CouserController();