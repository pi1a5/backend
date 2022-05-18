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

}

module.exports = new TicketController();