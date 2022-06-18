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

  async getTicketsUser(req, res) {
    try {
      const { sub } = req.body;

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return;
      }

      const getAllTickets = await Ticket.getAllbyUserId(sub);

      if (getAllTickets) {
        res.status(200).json(getAllTickets);
      } else {
        res.status(404).json('Tickets não encontrados');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getTicketsWithoutSupervisor(req, res) {
    try {
      const { sub } = req.body;

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return;
      }

      var ticket = await Ticket.getJoinWithoutSupervisor(sub);
      res.status(200).json(ticket);
    } catch (error) {
      res.status(500).json(ticket);
    }
  }

  async getTicketsWithSupervisor(req, res) {
    try {
      const { sub } = req.body;

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return;
      }

      var ticket = await Ticket.getJoinWithSupervisorOpen(sub);
      if (ticket) {
        res.status(200).json(ticket);
      } else {
        res.status(500).json('Erro ao encontrar tickets.');
      }
    } catch (error) {
      res.status(500).json(ticket);
    }
  }

  async getClosedTicketsWithSupervisor(req, res) {
    try {
      const { sub } = req.body;

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return;
      }

      var ticket = await Ticket.getJoinWithSupervisorClosed(sub);
      if (ticket) {
        res.status(200).json(ticket);
      } else {
        res.status(500).json('Erro ao encontrar tickets.');
      }
    } catch (error) {
      res.status(500).json(ticket);
    }
  }

  async feedbackTicket(req, res) {
    try {
      const {
        sub, id_ticket, feedback, eAceito,
      } = req.body;

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return;
      }

      if (id_ticket === '' || id_ticket === ' ' || id_ticket === undefined) {
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

      var ticket = await Ticket.updateFeedback(sub, id_ticket, feedback, eAceito);

      if (ticket) {
        res.status(200).json(ticket);
      } else {
        res.status(500).json('Erro ao encontrar tickets.');
      }
    } catch (error) {
      res.status(500).json(ticket);
    }
  }

  async newTicketInicio(req, res) {
    try {
      const {
        corpo_texto, data_limite, sub, eProfessor,
      } = req.body;
      const { tce } = req.files;
      const { pa } = req.files;

      if (corpo_texto === '' || corpo_texto === ' ' || corpo_texto === undefined) {
        res.status(400).json('Corpo de texto inválido');
        return;
      }

      if (data_limite === '' || data_limite === ' ' || data_limite === undefined) {
        res.status(400).json('Data limite inválida');
        return;
      }

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return;
      }

      if (tce === '' || tce === ' ' || tce === undefined) {
        res.status(400).json('tce inválido');
        return;
      }

      if (pa === '' || pa === ' ' || pa === undefined) {
        res.status(400).json('pa inválido');
        return;
      }

      if (eProfessor === '' || eProfessor === ' ' || eProfessor === undefined) {
        res.status(400).json('doc2 inválido');
        return;
      }

      const checkIfTicket = await Ticket.checkIfHasStarted(sub); // sub

      if (checkIfTicket) {
        if (await Ticket.createTicketInicio(corpo_texto, data_limite, sub, tce, pa, eProfessor)) {
          res.status(200).json('Ticket criado com sucesso.');
        } else {
          res.status(500).json('Erro ao criar Ticket.');
        }
      } else {
        res.status(500).json('Usuário já iniciou estágio.');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async newTicketAcompanhamento(req, res) {
    try {
      const {
        corpo_texto, sub, eProfessor, data_limite,
      } = req.body;
      const { rae } = req.files;

      if (corpo_texto === '' || corpo_texto === ' ' || corpo_texto === undefined) {
        res.status(400).json('Corpo de texto inválido');
        return;
      }

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return;
      }

      if (rae === '' || rae === ' ' || rae === undefined) {
        res.status(400).json('rae inválido');
        return;
      }

      if (eProfessor === '' || eProfessor === ' ' || eProfessor === undefined) {
        res.status(400).json('eProfessor inválido');
        return;
      }

      if (data_limite === '' || data_limite === ' ' || data_limite === undefined) {
        res.status(400).json('data_limite inválido');
        return;
      }

      const checkIfTicket = await Ticket.checkIfinAcompanhamento(sub); // sub

      if (checkIfTicket) {
        if (await Ticket.createTicketAcompanhamento(corpo_texto, sub, rae, eProfessor, data_limite)) {
          res.status(200).json('Ticket criado com sucesso.');
        } else {
          res.status(500).json('Erro ao criar Ticket.');
        }
      } else {
        res.status(500).json('Usuário já iniciou estágio.');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async newTicketFim(req, res) {
    try {
      const {
        corpo_texto, sub, eProfessor, data_limite,
      } = req.body;
      const { tre } = req.files;

      if (corpo_texto === '' || corpo_texto === ' ' || corpo_texto === undefined) {
        res.status(400).json('Corpo de texto inválido');
        return;
      }

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return;
      }

      if (tre === '' || tre === ' ' || tre === undefined) {
        res.status(400).json('tre inválido');
        return;
      }

      if (eProfessor === '' || eProfessor === ' ' || eProfessor === undefined) {
        res.status(400).json('eProfessor inválido');
        return;
      }

      if (data_limite === '' || data_limite === ' ' || data_limite === undefined) {
        res.status(400).json('data_limite inválido');
        return;
      }

      const checkIfTicket = await Ticket.checkIfFim(sub); // sub

      if (checkIfTicket) {
        if (await Ticket.createTicketFim(corpo_texto, sub, tre, eProfessor, data_limite)) {
          res.status(200).json('Ticket criado com sucesso.');
        } else {
          res.status(500).json('Erro ao criar Ticket.');
        }
      } else {
        res.status(500).json('Usuário já iniciou estágio.');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async checkIfAcompanhamento(req, res) {
    try {
      const { sub } = req.body;

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return;
      }

      if (await Ticket.checkIfinAcompanhamento(sub)) {
        res.status(200).json(true);
      } else {
        res.status(403).json(false);
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
