const Ticket = require('../models/Ticket');
const Documento = require('../models/Document');

class TicketController {

  async tickets(req, res) {
    try {
      var ticket = await Ticket.findAll();
      res.status(200).json(ticket);
    } catch (error) {
      res.status(500).json(ticket);
    }
  }

  async newTicketInicio(req, res){

    try{
      const { corpo_texto, data_limite, sub , doc1, doc2, eProfessor} = req.body;
      
      if (corpo_texto === '' || corpo_texto === ' ' || corpo_texto === undefined) {
        res.status(400).json('Corpo de texto inválido');
        return
      }

      if (data_limite === '' || data_limite === ' ' || data_limite === undefined) {
        res.status(400).json('Data limite inválida');
        return
      }

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return
      }

      if (doc1 === '' || doc1 === ' ' || doc1 === undefined) {
        res.status(400).json('doc1 inválido');
        return
      }

      if (doc2 === '' || doc2 === ' ' || doc2 === undefined) {
        res.status(400).json('doc2 inválido');
        return
      }

      if (eProfessor === '' || eProfessor === ' ' || eProfessor === undefined) {
        res.status(400).json('doc2 inválido');
        return
      }

      const checkIfTicket = await Ticket.checkIfHasTicket(sub); // sub

      if (checkIfTicket){
        if(await Ticket.createTicketInicio(corpo_texto, data_limite, sub, doc1, doc2, eProfessor)){
          res.status(200).json('Ticket criado com sucesso.');
        } else{
          res.status(500).json('Erro ao criar Ticket.');
        }
      } else{
        res.status(500).json('Usuário já iniciou estágio.');
      }
    } catch(error){
      res.status(500).json(error);
    }

  }

  async checkIfAcompanhamento(req, res){
      try{
          const { sub } = req.body

          if (sub === '' || sub === ' ' || sub === undefined) {
            res.status(400).json('Sub inválido');
            return
          }

          if (await Ticket.checkIfinAcompanhamento(sub)){
            res.status(200).json(true);
          } else{
            res.status(403).json(false);
          }
      } catch(error){
      res.status(500).json(error);
    }
  }

  async getTicketsUser(req, res){
    try{
      const { sub } = req.body

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return
      }

      const getAllTickets = await Ticket.findAllbyUserId(sub);

      if (getAllTickets){
        res.status(200).json(getAllTickets);
      } else{
        res.status(404).json('Tickets não encontrados');
      }

    } catch(error){
      res.status(500).json(error);
    }

  }

}

module.exports = new TicketController();