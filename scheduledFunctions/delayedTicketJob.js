/* eslint-disable max-len */
/* eslint-disable linebreak-style */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-continue */
/* eslint-disable arrow-parens */
/* eslint-disable guard-for-in */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

const CronJob = require('node-cron');
const knex = require('../database/connection');
const Mailer = require('../modules/mailer');

class Jobs {
  async updateTraineeshipsStatus() {
    const scheduledJobFunction = CronJob.schedule('* * 1 * * *', async () => {
      try {
        console.log('entrou');
        const estagios = await knex.select('e.id', 'e.processo', 'f.valor', 's.nome', knex.raw('json_agg(t.datafechado) as tickets'))
          .from('estagio AS e')
          .leftJoin('ticket AS t', 't.idestagio', 'e.id')
          .leftJoin('status AS s', 's.id', 'e.idstatus')
          .leftJoin('frequencia AS f', 'f.id', 'e.idfrequencia')
          .where({ 's.nome': 'Atrasado', 'e.etapaunica': false })
          .orWhere({ 's.nome': 'Em Dia', 'e.etapaunica': false })
          .orWhere({ 's.nome': 'Sem Ticket', 'e.etapaunica': false })
          .whereNot({ 's.nome': 'Aberto' })
          .groupBy('e.id')
          .groupBy('s.nome')
          .groupBy('f.valor');
        if (estagios.length === 0) return { response: null, status: 200 };
        const dataAtual = new Date();

        for (const i in estagios) {
          const indexTicketAtual = estagios[i].tickets.length;
          if (estagios[i].tickets[indexTicketAtual - 1] === null) {
            continue;
          }
          const datavencimentoticket = new Date(estagios[i].tickets[indexTicketAtual - 1]);
          let prazo = estagios[i].processo.etapas.filter(x => x.atual === true);
          prazo = prazo[0].prazo;
          datavencimentoticket.setMonth(datavencimentoticket.getMonth() + estagios[i].valor);
          datavencimentoticket.setDate(0);
          console.log(datavencimentoticket);
          if (estagios[i].nome === 'Em Dia') {
            if (dataAtual > datavencimentoticket) {
              await knex('estagio').update({ idstatus: 8 }).where({ id: estagios[i].id });
            }
          } else if (estagios[i].nome === 'Sem Ticket') {
            datavencimentoticket.setDate(datavencimentoticket.getDate() + prazo);
            console.log(datavencimentoticket);
            if (dataAtual > datavencimentoticket) {
              await knex('estagio').update({ idstatus: 5 }).where({ id: estagios[i].id });
            }
          }
        }

        return { response: estagios, status: 200 };
      } catch (error) {
        console.log(error);
        return { response: 'Erro ao rodar job', status: 400 };
      }
    });

    scheduledJobFunction.start();
  }

  async sendEmailToSupervisors() {
    const scheduledJobFunction2 = CronJob.schedule('* * 1 * * *', async () => {
      try {
        const total = {};
        const orientadores = await knex('usuario').select('*')
          .where({ idtipousuario: 2 });
        const estagios = await knex.select('e.idorientador', 'e.idaluno')
          .from('estagio AS e')
          .leftJoin('ticket AS t', 't.idestagio', 'e.id')
          .where({ 't.resposta': null })
          .whereNotNull('e.idorientador');

        for (const i in orientadores) {
          if (!estagios.some(x => x.idorientador === orientadores[i].id)) {
            continue;
          }
          total[orientadores[i].email] = { quantidade: estagios.filter(x => x.idorientador === orientadores[i].id).length, nome: orientadores[i].nome };
        }
        if (Object.keys(total).length !== 0) {
          await Mailer.ticketSentNotification(total);
        }
        return { response: 'Tudo certo', status: 200 };
      } catch (error) {
        console.log(error);
        return { response: 'Erro ao rodar job', status: 400 };
      }
    });

    scheduledJobFunction2.start();
  }
}

module.exports = new Jobs();
