const Ticket = require('../models/Ticket');

class TicketController {

  async tickets(req, res) {
    try {
      var ticket = await Ticket.findAll();
      res.status(200).json(ticket);
    } catch (error) {
      res.status(500).json(ticket);
    }
  }

  async newTicket(req, res){

    try{
       const { corpo_texto, data_limite, sub } = req.body;
      
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

      const checkIfTicket = await Ticket.checkIfHasTicket(sub); // sub

      if (checkIfTicket){
        if(await Ticket.createTicket( corpo_texto, data_limite, sub)){ // corpo e data
          res.status(200).json('Ticket criado com sucesso.');
        } else{
          res.status(500).json('Erro ao criar Ticket.');
        }
      } else{
        res.status(500).json('Usuário já tem ticket.');
      }
    } catch(error){
      res.status(500).json(error);
    }

  }

  async checkIfAcompanhamento(req, res){
      try{
          //const { sub } = req.body

          //if (sub === '' || sub === ' ' || sub === undefined) {
          //  res.status(400).json('Sub inválido');
          //  return
          //}

          if (await Ticket.checkIfinAcompanhamento("115840656247776377946")){
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