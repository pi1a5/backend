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

  async limparBanco(req, res) {
    try {
      const limpar = await Estagio.limpar();
      res.status(limpar.status).json(limpar.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async createNewEstagio(req, res) {
    try {
      const { // pegar idcurso e nome do orientador com o sub
        idProcesso, cargaHoraria, sub, dataLimite, corpoTexto,
      } = req.body;
      const data = {
        sub: sub,
        idProcesso: idProcesso,
        cargaHoraria: cargaHoraria,
        dataLimite: dataLimite,
        corpoTexto: corpoTexto,
      };

      const files = req['files'];

      console.log(data);
      console.log(files);


      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);


      const result = await Estagio.newEstagio(idProcesso, sub, cargaHoraria, dataLimite, corpoTexto, files);
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new EstagioController();
