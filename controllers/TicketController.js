/* eslint-disable max-len */
/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */
/* eslint-disable dot-notation */
/* eslint-disable prefer-destructuring */
/* eslint-disable linebreak-style */
/* eslint-disable class-methods-use-this */
const Ticket = require('../models/Ticket');
const Validate = require('../modules/validate');

class TicketController {
  async newTicket(req, res) {
    try {
      const {
        corpoTexto, sub, diastrabalhados,
      } = req.body;

      const data = {
        corpoTexto: corpoTexto,
        sub: sub,
        diastrabalhados: diastrabalhados,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const files = req['files'];
      console.log('a');

      const result = await Ticket.new(corpoTexto, sub, files, diastrabalhados);
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async tickets(req, res) {
    try {
      const ticket = await Ticket.getAll();
      res.status(ticket.status).json(ticket.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getTicketsUser(req, res) {
    try {
      const {
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const getAllTickets = await Ticket.getAllbyUserId(sub);

      res.status(getAllTickets.status).json(getAllTickets.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getPendingTicket(req, res) {
    try {
      const {
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const getAllTickets = await Ticket.getPending(sub);

      res.status(getAllTickets.status).json(getAllTickets.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getClosedTickets(req, res) {
    try {
      const {
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const getAllTickets = await Ticket.getClosed(sub);

      res.status(getAllTickets.status).json(getAllTickets.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getTicketsWithoutSupervisor(req, res) {
    try {
      const { sub } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const ticket = await Ticket.getWithoutSupervisor(sub);
      res.status(ticket.status).json(ticket.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getTicketsWithSupervisor(req, res) {
    try {
      const { sub } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const ticket = await Ticket.getWithSupervisor(sub);
      res.status(ticket.status).json(ticket.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getClosedTicketsWithSupervisor(req, res) {
    try {
      const { sub } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const ticket = await Ticket.getWithSupervisor(sub);
      res.status(ticket.status).json(ticket.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getTicketForm(req, res) {
    try {
      const { sub } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const ticket = await Ticket.getForm(sub);
      res.status(ticket.status).json(ticket.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async feedbackTicket(req, res) {
    try {
      const {
        sub, idTicket, feedback, aceito, idfrequencia, obrigatorio,
      } = req.body;
      const data = {
        sub: sub,
        idTicket: idTicket,
        feedback: feedback,
        aceito: aceito,
        idfrequencia: idfrequencia,
        obrigatorio: obrigatorio,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const ticket = await Ticket.updateFeedback(sub, idTicket, feedback, aceito, idfrequencia, obrigatorio);

      res.status(ticket.status).json(ticket.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async updateLatestTicket(req, res) {
    try {
      const {
        idTicket, ticket,
      } = req.body;
      const data = {
        idTicket: idTicket,
        ticket: ticket,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const result = await Ticket.updateLatest(idTicket, ticket);
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async deletePendingTicket(req, res) {
    try {
      const {
        idTicket, sub,
      } = req.body;
      const data = {
        idTicket: idTicket,
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const result = await Ticket.deletePending(idTicket, sub);
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  // async getPdfUrl(req, res){
  //   try {
  //     const { id }  = req.body

  //     if (id === '' || id === ' ' || id === undefined) {
  //       res.status(400).json('id inválido');
  //       return
  //     }

  //     const getUrl = await Ticket.getPdfUrl(id)

  //     if (getUrl){
  //       res.status(200).json(getUrl);
  //     } else{
  //       res.status(404).json('Arquivos não encontrados');
  //     }

  //   } catch(error){
  //     res.status(500).json(error);
  //   }
  // }
}

module.exports = new TicketController();
