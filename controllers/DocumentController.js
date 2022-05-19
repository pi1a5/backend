const Document = require('../models/Document');

class DocumentController {

  async documents(req, res) {
    try {
      var document = await Document.findAll();
      res.status(200).json(document);
    } catch (error) {
      res.status(500).json(document);
    }
  }

}

module.exports = new DocumentController();