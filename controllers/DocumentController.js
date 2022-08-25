/* eslint-disable class-methods-use-this */
const Document = require('../models/Document');

class DocumentController {
  async documents(req, res) {
    try {
      const document = await Document.findAll();
      res.status(document.status).json(document.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new DocumentController();
