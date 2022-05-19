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

  async getDocumentbyTicket(req, res){
    try{
      const { id_ticket } = req.body;

      if (id_ticket === '' || id_ticket === ' ' || id_ticket === undefined) {
        res.status(400).json('Id_ticket inválido');
        return
      }

      var document = await Document.findByTicketId(id_ticket);

      if (document){
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