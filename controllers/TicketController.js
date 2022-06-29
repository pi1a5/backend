/* eslint-disable linebreak-style */
/* eslint-disable dot-notation */
/* eslint-disable prefer-destructuring */
/* eslint-disable linebreak-style */
/* eslint-disable class-methods-use-this */
const Ticket = require('../models/Ticket');

class TicketController {
  async tickets(req, res) {
    try {
      const ticket = await Ticket.findAll();
      res.status(200).json(ticket);
    } catch (error) {
      res.status(500).json(error);
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

      const ticket = await Ticket.getJoinWithoutSupervisor(sub);
      res.status(200).json(ticket);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getTicketsWithSupervisor(req, res) {
    try {
      const { sub } = req.body;

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return;
      }

      const ticket = await Ticket.getJoinWithSupervisorOpen(sub);
      if (ticket) {
        res.status(200).json(ticket);
      } else {
        res.status(500).json('Erro ao encontrar tickets.');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getClosedTicketsWithSupervisor(req, res) {
    try {
      const { sub } = req.body;

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return;
      }

      const ticket = await Ticket.getJoinWithSupervisorClosed(sub);
      if (ticket) {
        res.status(200).json(ticket);
      } else {
        res.status(500).json('Erro ao encontrar tickets.');
      }
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

  async newTicketInicio(req, res) {
    try {
      const {
        corpoTexto, dataLimite, sub, eProfessor,
      } = req.body;
      const tce = req['files'].tce;
      const pa = req['files'].pa;

      if (corpoTexto === '' || corpoTexto === ' ' || corpoTexto === undefined) {
        res.status(400).json('Corpo de texto inválido');
        return;
      }

      if (dataLimite === '' || dataLimite === ' ' || dataLimite === undefined) {
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

      console.log(checkIfTicket);
      console.log(checkIfTicket.result, checkIfTicket.message);
      
      if (checkIfTicket.result) {
        const criarTicket = await Ticket.createTicketInicio(corpoTexto, dataLimite, sub, tce, pa, eProfessor)
        if (criarTicket.result) {
          res.status(200).json(criarTicket.message);
        } else {
          res.status(500).json(criarTicket.message);
        }
      } else {
        res.status(500).json(checkIfTicket.message);
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async newTicketAcompanhamento(req, res) {
    try {
      const {
        corpoTexto, sub, eProfessor, dataLimite,
      } = req.body;
      const rae = req['files'].rae;

      if (corpoTexto === '' || corpoTexto === ' ' || corpoTexto === undefined) {
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

      if (dataLimite === '' || dataLimite === ' ' || dataLimite === undefined) {
        res.status(400).json('data_limite inválido');
        return;
      }

      const checkIfTicket = await Ticket.checkIfinAcompanhamento(sub); // sub

      if (checkIfTicket) {
        if (await Ticket.createTicketAcompanhamento(corpoTexto, sub, rae, eProfessor, dataLimite)) {
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
        corpoTexto, sub, eProfessor, dataLimite,
      } = req.body;

      const tre = req['files'].tre;

      if (corpoTexto === '' || corpoTexto === ' ' || corpoTexto === undefined) {
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

      if (dataLimite === '' || dataLimite === ' ' || dataLimite === undefined) {
        res.status(400).json('data_limite inválido');
        return;
      }

      const checkIfTicket = await Ticket.checkIfFim(sub); // sub

      if (checkIfTicket) {
        if (await Ticket.createTicketFim(corpoTexto, sub, tre, eProfessor, dataLimite)) {
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
