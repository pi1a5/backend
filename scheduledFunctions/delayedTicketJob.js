/* eslint-disable linebreak-style */
/* eslint-disable guard-for-in */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

const CronJob = require('node-cron');
const knex = require('../database/connection');

exports.initScheduledJobs = () => {
  const scheduledJobFunction = CronJob.schedule('* * 1 * * *', async () => {
    try {
      const estagios = await knex.select('e.id', 'e.processo', 'f.valor', 's.nome', knex.raw('json_agg(t.datacriado) as tickets'))
        .from('estagio AS e')
        .leftJoin('ticket AS t', 't.idestagio', 'e.id')
        .leftJoin('status AS s', 's.id', 'e.idstatus')
        .leftJoin('frequencia AS f', 'f.id', 'e.idfrequencia')
        .where({ 's.nome': 'Atrasado', 'e.etapaunica': false })
        .orWhere({ 's.nome': 'Em Dia', 'e.etapaunica': false })
        .whereNot({ 's.nome': 'Aberto' })
        .groupBy('e.id')
        .groupBy('s.nome')
        .groupBy('f.valor');
      if (estagios.length === 0) return { response: null, status: 200 };
      const dataAtual = new Date();
      console.log(estagios);

      for (const i in estagios) {
        const indexTicketAtual = estagios[i].tickets.length;
        const datavencimentoticket = new Date(estagios[i].tickets[indexTicketAtual - 1]);
        for (const j in estagios[0].processo.etapas) {
          if (estagios[0].processo.etapas[j].atual === true) {
            const prazo = estagios[0].processo.etapas[j].prazo;
            datavencimentoticket.setDate(datavencimentoticket.getDate() + prazo);
            break;
          }
        }
        datavencimentoticket.setMonth(datavencimentoticket.getMonth() + estagios[i].valor);
        console.log(estagios[i]);
        console.log(datavencimentoticket);
        if (estagios[i].nome === 'Em Dia') {
          if (dataAtual > datavencimentoticket) {
            await knex('estagio').update({ idstatus: 5 }).where({ id: estagios[0].id });
          }
        } else {
          datavencimentoticket.setDate(datavencimentoticket.getDate() + 10);
          if (dataAtual > datavencimentoticket) {
            // await knex('estagio').update({ idstatus: 5 }).where({ id: estagios[0].id });
          }
        }
      }

      return { response: estagios, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao deletar orientador', status: 400 };
    }
  });

  scheduledJobFunction.start();
};
