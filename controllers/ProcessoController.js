/* eslint-disable linebreak-style */
/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */
/* eslint-disable class-methods-use-this */
const Processo = require('../models/Processo');
const Etapa = require('../models/Etapa');
const Validate = require('../modules/validate');

class ProcessoController {
  async processos(req, res) {
    try {
      const estagio = await Processo.findAll();
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

      const estagio = await Processo.findAllByCourse(sub);
      res.status(estagio.status).json(estagio.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async createNewProcesso(req, res) {
    try {
      const { // pegar idcurso e nome do orientador com o sub
        sub, processo,
      } = req.body;
      const data = {
        sub: sub,
        processo: processo,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const estagio = await Processo.newProcesso(sub, processo);
      res.status(estagio.status).json(estagio.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async addEtapa(req,res) {
    try {
      const { // pegar idcurso e nome do orientador com o sub
        sub, idprocesso, etapa
      } = req.body;
      const data = {
        sub: sub,
        idprocesso: idprocesso,
        etapa: etapa,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const result = await Etapa.add(sub, idprocesso, etapa);
      res.status(estagio.status).json(estagio.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new ProcessoController();
