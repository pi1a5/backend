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
      // const { corpo_texto, data_limite, sub } = req.body;
      
      //if (corpo_texto === '' || corpo_texto === ' ' || corpo_texto === undefined) {
      //  res.status(400).json('Corpo de texto inválido');
      //  return
      //}

      //if (data_limite === '' || data_limite === ' ' || data_limite === undefined) {
      //  res.status(400).json('Data limite inválida');
      //  return
      //}

      //if (sub === '' || sub === ' ' || sub === undefined) {
      //  res.status(400).json('Data limite inválida');
      //  return
      //}

      const checkIfTicket = await Ticket.checkIfHasTicket("115840656247776377946"); // sub

      if (checkIfTicket){
        if(await Ticket.createTicket()){
          res.status(200).json(Ticket);
        }
      } else{
        res.status(500).json('Usuário já tem ticket');
      }
    } catch(error){
      res.status(500).json(error);
    }

  }

}

module.exports = new TicketController();