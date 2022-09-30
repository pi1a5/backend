/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */
/* eslint-disable class-methods-use-this */
const Estagio = require('../models/Estagio');
const Validate = require('../modules/validate');

class EstagioController {
  async estagios(req, res) {
    try {
      const estagio = await Estagio.findAll();
      res.status(estagio.status).json(estagio.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async limparEstagios(req, res) {
    try {
      const limpar = await Estagio.limpar();
      res.status(limpar.status).json(limpar.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async checkIfHasEstagio(req, res) {
    try {
      const { // pegar idcurso e nome do orientador com o sub
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const limpar = await Estagio.checkIfHas(sub);
      res.status(limpar.status).json(limpar.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async createNewEstagio(req, res) {
    try {
      const { // pegar idcurso e nome do orientador com o sub
        idProcesso, cargaHoraria, sub,
      } = req.body;
      const data = {
        sub: sub,
        idProcesso: idProcesso,
        cargaHoraria: cargaHoraria,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const result = await Estagio.newEstagio(idProcesso, sub, cargaHoraria);
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async checkIfEnded(req, res) {
    try {
      const { // pegar idcurso e nome do orientador com o sub
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const result = await Estagio.ended(sub);
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async endInternship(req, res) {
    try {
      const { // pegar idcurso e nome do orientador com o sub
        idestagio,
      } = req.body;

      console.log(idprocesso);
      const data = {
        idestagio: idestagio,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const result = await Estagio.end(idestagio);
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async transferInternship(req, res) {
    try {
      const { // pegar idcurso e nome do orientador com o sub
        idestagio, idorientador
      } = req.body;

      console.log(idprocesso);
      const data = {
        idestagio: idestagio,
        idorientador: idorientador,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const result = await Estagio.transfer(idestagio, idorientador);
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new EstagioController();
