/* eslint-disable linebreak-style */
/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */
/* eslint-disable dot-notation */
/* eslint-disable prefer-destructuring */
/* eslint-disable linebreak-style */
/* eslint-disable class-methods-use-this */
const { getAll } = require('../models/Ticket');
const Ticket = require('../models/Ticket');
const Validate = require('../modules/validate');

class TicketController {
  async newTicket(req, res) {
    try {
      const {
        corpoTexto, sub, cargaHoraria // idestagio,
      } = req.body;

      const data = {
        corpoTexto: corpoTexto,
        cargaHoraria: cargaHoraria,
        sub: sub,
        // idestagio: idestagio,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const files = req['files'];
      const idestagio = 3;
      console.log('a');

      const result = await Ticket.new(corpoTexto, sub, idestagio, files);
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

  async getTicketsWithoutSupervisor(req, res) {
    try {
      const { sub } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const ticket = await Ticket.getJoinWithoutSupervisor(sub);
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

      const ticket = await Ticket.getJoinWithSupervisorOpen(sub);
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

      const ticket = await Ticket.getJoinWithSupervisorClosed(sub);
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

  async createTicket(req, res) {
    try {
      const {
        sub, mensagem, documentos,
      } = req.body;
      const data = {
        sub: sub,
        mensagem: mensagem,
        documentos: documentos,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const ticket = await Ticket.create(sub, mensagem, documentos);
      res.status(ticket.status).json(ticket.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async feedbackTicket(req, res) {
    try {
      const {
        sub, idTicket, feedback, eAceito,
      } = req.body;

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return;
      }

      if (idTicket === '' || idTicket === ' ' || idTicket === undefined) {
        res.status(400).json('id_ticket inválido');
        return;
      }

      if (feedback === '' || feedback === ' ' || feedback === undefined) {
        res.status(400).json('feedback inválido');
        return;
      }

      if (eAceito === '' || eAceito === ' ' || eAceito === undefined) {
        res.status(400).json('Sub inválido');
        return;
      }

      const ticket = await Ticket.updateFeedback(sub, idTicket, feedback, eAceito);

      if (ticket) {
        res.status(200).json(ticket);
      } else {
        res.status(500).json('Erro ao encontrar tickets.');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async checkIfFinalizou(req, res) {
    try {
      const { sub } = req.body;

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return;
      }

      if (await Ticket.checkFinalizou(sub)) {
        res.status(200).json(true);
      } else {
        res.status(200).json(false);
      }
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
