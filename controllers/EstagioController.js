const Estagio = require('../models/Estagio');

class EstagioController {
  async estagios(req, res) {
    try {
      const estagio = await Estagio.findAll();
      res.status(200).json(estagio);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async limparBanco(req, res) {
    try {
      const limpar = await Estagio.limpar();
      if (limpar) {
        res.status(200).json(limpar);
      } else {
        res.status(404).json(limpar);
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new EstagioController();
