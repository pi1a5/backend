/* eslint-disable class-methods-use-this */
const Estagio = require('../models/Estagio');

class EstagioController {
  async estagios(req, res) {
    try {
      const estagio = await Estagio.findAll();
      res.status(estagio.status).json(estagio.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async limparBanco(req, res) {
    try {
      const limpar = await Estagio.limpar();
      res.status(limpar.status).json(limpar.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new EstagioController();
