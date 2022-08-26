/* eslint-disable linebreak-style */
/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */
/* eslint-disable class-methods-use-this */
const Estagio = require('../models/Estagio');
const Validate = require('../modules/validate');

class EstagioController {
  async processos(req, res) {
    try {
      const estagio = await Estagio.findAll();
      res.status(estagio.status).json(estagio.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async findAllByCourse(req, res) {
    try {
      const {
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const estagio = await Estagio.findAllByCourse(sub);
      res.status(estagio.status).json(estagio.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new EstagioController();
