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

  async updateEtapa(req, res) {
    try {
      const { // pegar idcurso e nome do orientador com o sub
        sub, idetapa, etapa,
      } = req.body;
      const data = {
        sub: sub,
        idetapa: idetapa,
        etapa: etapa,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const result = await Etapa.update(sub, idetapa, etapa);
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async deleteProcesso(req, res) {
    try {
      const { // pegar idcurso e nome do orientador com o sub
        idprocesso,
      } = req.body;
      const data = {
        idprocesso: idprocesso,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const result = await Processo.delete(idprocesso);
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async limparBanco(req, res) {
    try {
      const limpar = await Processo.limpar();
      res.status(limpar.status).json(limpar.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async createExample(req, res) {
    try {
      const processo = {
        "sub": "teste",
        "processo": {
        "id": 0,
        "nome": "Padrão",
        "etapas": [
            {
                "id": 0,
                "nome": "Início",
                "prazo": 10,
                "documentos": [
                    {
                        "id": 0,
                        "nome": "docteste1",
                        "sigla": "dc1",
                        "template": "aoba"
                    },
                    {
                        "id": 1,
                        "nome": "docteste2",
                        "sigla": "dc2",
                        "template": "aoba2"
                    }
                ]
            },
            {
                "id": 1,
                "nome": "Acompanhamento",
                "prazo": 15,
                "documentos": [
                    {
                        "id": 0,
                        "nome": "docteste1",
                        "sigla": "dc1",
                        "template": "aoba"
                    }
                ]
            },
            {
                "id": 2,
                "nome": "Finalização",
                "prazo": 5,
                "documentos": [
                    {
                        "id": 0,
                        "nome": "docteste1",
                        "sigla": "dc1",
                        "template": "aoba"
                    },
                    {
                        "id": 1,
                        "nome": "docteste2",
                        "sigla": "dc2",
                        "template": "aoba2"
                    }
                ]
            }
        ]
    }
    }
      const criar = await Processo.newProcesso(processo.sub, processo.processo);
      res.status(criar.status).json(criar.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async test(req, res){
    const { // pegar idcurso e nome do orientador com o sub
      documentos,
    } = req.body;
    const data = {
      documentos: documentos,
    };
    const val = Validate  (data);
    if (val !== true) return res.status(400).json(val);

    const response = await Processo.test(documentos);
    res.status(response.status).json(response.response);
  }
}

module.exports = new ProcessoController();
