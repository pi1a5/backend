/* eslint-disable linebreak-style */
/* eslint-disable object-shorthand */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
const Document = require('../models/Document');
const Validate = require('../modules/validate');

class DocumentController {
  async documents(req, res) {
    try {
      const document = await Document.findAll();
      res.status(document.status).json(document.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async createNewDocumentType(req, res) {
    try {
      const {
        nome, sigla, template,
      } = req.body;
      const data = {
        nome: nome,
        sigla: sigla,
        template: template,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const document = await Document.newDocumentType(nome, sigla, template);
      res.status(document.status).json(document.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async delete(req, res) {
    try {
      const {
        file, sub,
      } = req.body;
      const data = {
        file: file,
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const document = await Document.delete(file, sub);
      res.status(document.status).json(document.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new DocumentController();
