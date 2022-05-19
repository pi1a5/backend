const Course = require('../models/Estagio');

class EstagioController {

  async estagios(req, res) {
    try {
      var estagio = await Estagio.findAll();
      res.status(200).json(estagio);
    } catch (error) {
      res.status(500).json(error);
    }
  }

}

module.exports = new EstagioController();