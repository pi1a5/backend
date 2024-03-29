/* eslint-disable no-param-reassign */
/* eslint-disable linebreak-style */
/* eslint-disable operator-assignment */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-continue */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable block-spacing */
/* eslint-disable func-names */
/* eslint-disable eqeqeq */
/* eslint-disable arrow-parens */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable object-shorthand */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const knex = require('../database/connection');

class Chart {
  async checkAmount(sub) {
    try {
      let total = [];
      const area = await knex.select(['idarea'])
        .from('curso AS c')
        .leftJoin('usuario AS u', 'u.idcurso', 'c.id')
        .where({ sub: sub });
      if (area.length === 0) return { response: 'Curso do usuário não encontrado', status: 404 };
      const colegas = await knex.distinct().select('u.id', 'u.nome')
        .from('usuario AS u')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .where({ idtipousuario: 2 })
        .where({ 'c.idarea': area[0].idarea });
      if (colegas.length === 0) return { response: 'Nenhum orientador encontrado', status: 404 };

      const colegasids = [];

      for (const i in colegas) {
        colegasids.push(colegas[i].id);
      }

      const data = await knex.distinct().select('idaluno', 'idorientador')
        .table('estagio')
        .whereIn('idorientador', colegasids)
        .whereNot('idstatus', 2);

      for (const i in colegas) {
        total.push({ quantidade: data.filter(function (d) { return d.idorientador === colegas[i].id;}).length, nome: colegas[i].nome });
      }
      total = total.sort((a, b) => parseFloat(b.quantidade) - parseFloat(a.quantidade));

      return { response: total, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar os processos dos outros orientadores', status: 400 };
    }
  }

  async getInternshipsAmountByStatus(sub) {
    try {
      const total = {};
      const estagios = await knex.select('s.nome')
        .from('status AS s')
        .leftJoin('estagio AS e', 'e.idstatus', 's.id')
        .leftJoin('usuario AS u', 'u.id', 'e.idorientador')
        .where({ 'u.sub': sub })
        .whereNot({ 's.nome': 'Aberto' });
      if (estagios.length === 0) return { response: null, status: 200 };
      const status = await knex.select('nome')
        .from('status')
        .whereNot({ nome: 'Aberto' });

      for (const i in status) {
        total[status[i].nome] = estagios.filter((obj) => obj.nome === status[i].nome).length;
      }
      return { response: total, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar os processos dos outros orientadores', status: 400 };
    }
  }

  async getInternshipsAmountByCourse(sub) {
    try {
      const total = {};
      const idarea = await knex.select('c.idarea')
        .from('curso AS c')
        .leftJoin('usuario AS u', 'u.idcurso', 'c.id')
        .where({ 'u.sub': sub });

      const estagios = await knex.select('c.nome', knex.raw('json_agg(e.id) as ids'))
        .from('estagio AS e')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .where({ 'c.idarea': idarea[0].idarea })
        .groupBy('c.nome');

      for (const i in estagios) {
        total[estagios[i].nome] = estagios[i].ids.length;
      }
      return { response: total, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar os processos dos outros orientadores', status: 400 };
    }
  }

  async getTicketsStatusByDate(sub) {
    try {
      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
      ];
      const total = {};
      const tickets = await knex.select('t.aceito', 't.datafechado')
        .from('ticket AS t')
        .leftJoin('estagio AS e', 'e.id', 't.idestagio')
        .leftJoin('usuario AS u', 'u.id', 'e.idorientador')
        .whereNotNull('t.datafechado')
        .where({ 'u.sub': sub });
      console.log(tickets);
      if (tickets.length === 0) return { response: null, status: 200 };
      for (const i in tickets) {
        let data = new Date(tickets[i].datafechado);
        const ano = data.getFullYear();
        if (total.hasOwnProperty(ano)) {
          data = meses[data.getMonth()];
          if (tickets[i].aceito === true) {
            total[ano][data].aceito = total[ano][data].aceito + 1;
          } else {
            total[ano][data].recusado = total[ano][data].recusado + 1;
          }
        } else {
          total[ano] = {};
          data = meses[data.getMonth()];
          for (const j in meses) {
            if (meses[j] === data) {
              if (tickets[i].aceito === true) {
                total[ano][meses[j]] = { aceito: 1, recusado: 0 };
              } else {
                total[ano][meses[j]] = { aceito: 0, recusado: 1 };
              }
            } else {
              total[ano][meses[j]] = { aceito: 0, recusado: 0 };
            }
          }
        }
      }
      return { response: total, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar os tickets por data', status: 400 };
    }
  }

  async getInternshipsAmountByMonth(sub) {
    try {
      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
      ];
      let total = {};
      const idarea = await knex.select('c.idarea')
        .from('curso AS c')
        .leftJoin('usuario AS u', 'u.idcurso', 'c.id')
        .where({ 'u.sub': sub });
      const estagios = await knex.select('e.criado', 'e.fechado')
        .from('estagio AS e')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .where({ 'c.idarea': idarea[0].idarea });

      for (const i in estagios) {
        const dataCriado = new Date(estagios[i].criado);
        const anoCriado = dataCriado.getFullYear();
        const mesCriado = dataCriado.getMonth();
        if (total.hasOwnProperty(anoCriado)) {
          total[anoCriado][meses[mesCriado]].criado = total[anoCriado][meses[mesCriado]].criado + 1;
          if (estagios[i].fechado !== null) {
            const dataFechado = new Date(estagios[i].criado);
            const anoFechado = dataFechado.getFullYear();
            const mesFechado = dataFechado.getMonth();
            if (total.hasOwnProperty(anoFechado)) {
              total[anoFechado][meses[mesFechado]].fechado = total[anoFechado][meses[mesFechado]].fechado + 1;
            } else {
              total[anoFechado] = {};
              total = await this.populateTotalYear(total, anoCriado, mesCriado, meses);
            }
          } else {
            continue;
          }
        } else {
          total[anoCriado] = {};
          total = await this.populateTotalYear(total, anoCriado, mesCriado, meses);
        }
      }
      return { response: total, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar a quantidade de estágios criados e fechados por mês', status: 400 };
    }
  }

  async populateTotalYear(total, ano, mes, meses) {
    for (const m in meses) {
      if (meses[m] === meses[mes]) {
        total[ano][meses[m]] = { criado: 1, fechado: 0 };
      } else {
        total[ano][meses[m]] = { criado: 0, fechado: 0 };
      }
    }
    return total;
  }

  async getUserTicketAmountAndTotalHours(sub) {
    try {
      const idarea = await knex.select('c.idarea')
        .from('curso AS c')
        .leftJoin('usuario AS u', 'u.idcurso', 'c.id')
        .where({ 'u.sub': sub });
      const usuarios = await knex.select('u.email', 'u.cargatotal', knex.raw('count(t.id) as count'))
        .from('usuario AS u')
        .leftJoin('estagio AS e', 'e.idaluno', 'u.id')
        .leftJoin('ticket AS t', 't.idestagio', 'e.id')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .where({ 'c.idarea': idarea[0].idarea })
        .where({ 'u.idtipousuario': 1 })
        .groupBy('u.email')
        .groupBy('u.cargatotal');

      return { response: usuarios, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar os tickets e as horas de estágio dos alunos', status: 400 };
    }
  }

  async getCourseAverageWorkedHours(sub) {
    try {
      const idarea = await knex.select('c.idarea')
        .from('curso AS c')
        .leftJoin('usuario AS u', 'u.idcurso', 'c.id')
        .where({ 'u.sub': sub });
      const horas = await knex.select('c.nome', knex.raw('AVG(u.cargatotal)'))
        .from('curso AS c')
        .leftJoin('usuario AS u', 'u.idcurso', 'c.id')
        .where({ 'c.idarea': idarea[0].idarea })
        .where({ 'u.idtipousuario': 1 })
        .groupBy('c.nome');

      return { response: horas, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar os tickets e as horas de estágio dos alunos', status: 400 };
    }
  }
}

module.exports = new Chart();
