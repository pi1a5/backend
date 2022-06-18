/* eslint-disable class-methods-use-this */
const Document = require('../models/Document');

class DocumentController {
  async documents(req, res) {
    try {
      const document = await Document.findAll();
      res.status(200).json(document);
    } catch (error) {
      res.status(500).json(document);
    }
  }

  async getDocumentbyTicket(req, res) {
    try {
      const { idTicket } = req.body;

      if (idTicket === '' || idTicket === ' ' || idTicket === undefined) {
        res.status(400).json('Id_ticket inválido');
        return;
      }

      const document = await Document.findByTicketId(idTicket);

      if (document) {
        res.status(200).json(document);
      } else {
        res.status(500).json('Erro ao encontrar documento.');
      }
    } catch (error) {
      res.status(500).json(document);
    }
  }
}

module.exports = new DocumentController();
