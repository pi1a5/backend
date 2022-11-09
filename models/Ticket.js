/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable linebreak-style */
/* eslint-disable arrow-parens */
/* eslint-disable no-lonely-if */
/* eslint-disable dot-notation */
/* eslint-disable prefer-const */
/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */
/* eslint-disable block-scoped-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const { index } = require('../controllers/HomeController');
const knex = require('../database/connection');
const Aws = require('./Aws');
const Documento = require('./Document');

class Ticket {
  async new(corpoTexto, sub, files, diastrabalhados) {
    try {
      const dataCriado = new Date();
      const estagioid = await knex.select(['e.id', 'e.idaluno', 'e.idorientador', 's.nome'])
        .from('estagio AS e')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .leftJoin('status AS s', 's.id', 'e.idstatus')
        .where({ 'u.sub': sub });
      const processo = await knex('estagio').select('processo').where({ id: estagioid[0].id });
      let etapaAtual = {};
      let envolvidos = {};

      for (const i in processo[0].processo.etapas) {
        if (processo[0].processo.etapas[i].atual === true) {
          etapaAtual['nome'] = processo[0].processo.nome;
          etapaAtual['etapa'] = processo[0].processo.etapas[i];
          break;
        }
      }
      if (estagioid[0].nome === 'Sem Ticket') {
        await knex('estagio').update({ idstatus: 4 }).where({ id: estagioid[0].id });
      }

      const orientador = await knex('usuario').select('*')
        .where({ id: estagioid[0].idorientador });

      if (orientador.length === 0) {
        envolvidos['orientador'] = null;
      } else {
        envolvidos['orientador'] = orientador;
      }

      envolvidos['aluno'] = await knex('usuario').select('*')
        .where({ id: estagioid[0].idaluno });

      const ticketid = await knex('ticket').returning('id').insert({
        mensagem: corpoTexto, idestagio: estagioid[0].id, datacriado: dataCriado, etapa: etapaAtual, envolvidos: envolvidos, diastrabalhados: diastrabalhados,
      });
      const documentos = [];

      if (files !== null) {
        for (const file in files) {
          documentos.push({ idticket: ticketid[0].id, arquivo: await Aws.uploadFile(files[file], sub), nome: file });
        }
        await knex('documento').insert(documentos);
      }

      return { response: 'Ticket criado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao criar tickets', status: 404 };
    }
  }

  async getAll() {
    try {
      const result = await knex.select('*').table('ticket');
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao resgatar tickets', status: 404 };
    }
  }

  async getPending(sub) {
    try {
      const result = await knex.select('t.*', knex.raw('json_agg(d.*) as documentos'))
        .from('ticket AS t')
        .leftJoin('estagio AS e', 'e.id', 't.idestagio')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .leftJoin('documento AS d', 'd.idticket', 't.id')
        .where({ 'u.sub': sub, 't.resposta': null })
        .orderBy('t.id', 'desc')
        .groupBy('t.id');

      if (result.length !== 0) {
        return { response: result, status: 200 };
      }
      return { response: null, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao resgatar tickets', status: 404 };
    }
  }

  async getClosed(sub) {
    try {
      const result = await knex.select('t.*', knex.raw('json_agg(d.*) as documentos'))
        .from('ticket AS t')
        .leftJoin('estagio AS e', 'e.id', 't.idestagio')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .leftJoin('documento AS d', 'd.idticket', 't.id')
        .where({ 'u.sub': sub })
        .whereNotNull('t.resposta')
        .orderBy('t.id', 'desc')
        .groupBy('t.id');

      if (result.length !== 0) {
        return { response: result, status: 200 };
      }
      return { response: null, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao resgatar tickets', status: 404 };
    }
  }

  async getWithoutSupervisor(sub) {
    try {
      const area = await knex.select('c.idarea')
        .from('curso AS c')
        .leftJoin('usuario AS u', 'u.idcurso', 'c.id')
        .where({ 'u.sub': sub });
      if (area.length === 0) return { response: 'Usuario não tem area', status: 404 };
      const tickets = await knex.select('t.*', 's.nome AS status', 'e.etapaunica', knex.raw('json_agg(d.*) as documentos'), knex.raw('json_agg(DISTINCT u.*) as usuario'), knex.raw('json_agg(DISTINCT c.nome) as curso'))
        .from('ticket AS t')
        .leftJoin('estagio AS e', 'e.id', 't.idestagio')
        .leftJoin('documento AS d', 'd.idticket', 't.id')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .leftJoin('status AS s', 's.id', 'e.idstatus')
        .where({ 'e.idstatus': 1, 't.resposta': null, 'c.idarea': area[0].idarea, 'e.idorientador': null })
        .orderBy('t.id', 'asc')
        .groupBy('s.nome')
        .groupBy('e.etapaunica')
        .groupBy('t.id');
      if (tickets.length === 0) return { response: null, status: 200 };

      return { response: tickets, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao resgatar tickets', status: 404 };
    }
  }

  async getWithSupervisor(sub) {
    try {
      const id = await knex('usuario').select('id').where({ sub: sub });
      if (id.length === 0) return { response: 'Usuario não tem encontrado', status: 404 };
      const tickets = await knex.select('t.*', knex.raw("e.processo -> 'etapas' -> 0 -> 'atual' AS inicio"), knex.raw('json_agg(d.*) as documentos'), knex.raw('json_agg(DISTINCT u.*) as usuario'), knex.raw('json_agg(DISTINCT c.nome) as curso'))
        .from('ticket AS t')
        .leftJoin('estagio AS e', 'e.id', 't.idestagio')
        .leftJoin('documento AS d', 'd.idticket', 't.id')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .where({ 'e.idorientador': id[0].id, 't.resposta': null })
        .orderBy('t.id', 'asc')
        .groupBy('e.processo')
        .groupBy('t.id');
        console.log(tickets)
      if (tickets.length === 0) return { response: null, status: 200 };

      return { response: tickets, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao resgatar tickets abertos com orientador', status: 404 };
    }
  }

  async getForm(sub) {
    try {
      let form = {};
      const id = await knex.select(['id'])
        .table('usuario')
        .where({ sub });
      if (id.length === 0) return { response: 'Usuário não encontrado', status: 404 };
      const processo = await knex.select(['processo'])
        .table('estagio')
        .where({ idaluno: id[0].id });
      if (processo.length === 0) return { response: 'Usuário sem processo', status: 404 };

      for (const i in processo[0].processo.etapas) {
        if (processo[0].processo.etapas[i].atual === true) {
          form = processo[0].processo.etapas[i];
          break;
        }
      }
      return { response: form, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao resgatar arquivos', status: 400 };
    }
  }

  async getPdfUrl(id) {
    try {
      const url = await knex.select('*').table('documento').where({ idticket: id });

      return { response: url, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao resgatar arquivos', status: 400 };
    }
  }

  async updateFeedback(sub, idTicket, feedback, aceito, idfrequencia, obrigatorio) {
    try {
      const datafechado = new Date();
      const estagio = await knex.select('e.cargahoraria', 'e.id', 'e.idaluno', 'e.idfrequencia', 'e.processo', 'e.obrigatorio', 'f.valor AS frequencia', 's.nome AS status', 'e.etapaunica')
        .from('estagio AS e')
        .leftJoin('ticket AS t', 't.idestagio', 'e.id')
        .leftJoin('frequencia AS f', 'f.id', 'e.idfrequencia')
        .leftJoin('status AS s', 's.id', 'e.idstatus')
        .where({ 't.id': idTicket })
        .groupBy('f.valor')
        .groupBy('s.nome')
        .groupBy('e.id');

      await knex.transaction(async (trx) => {
        switch (estagio[0].status) {
          case 'Aberto':
            await this.updateFeedbackStatusOpen(estagio, datafechado, aceito, sub, idfrequencia, obrigatorio);
            break;
          case 'Atrasado':
          case 'Sem Resposta':
            await this.updateFeedbackStatusLateOrWithoutTicket(estagio, datafechado, aceito, idTicket, idfrequencia, obrigatorio);
            break;
          default:
            break;
        }
        await knex('ticket').update({ resposta: feedback, datafechado: datafechado, aceito: aceito })
          .where({ id: idTicket });
        await trx.commit;
      });

      return { response: 'Atualizado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao atualizar feedback do ticket', status: 404 };
    }
  }

  async updateFeedbackStatusOpen(estagio, datafechado, aceito, sub, idfrequencia, obrigatorio) {
    if (estagio[0].etapaunica) {
      await this.handleOpenSingleStepInternship(estagio, sub, aceito, datafechado);
    } else {
      await this.handleOpenThreeStepInternship(estagio, sub, aceito, datafechado, idfrequencia, obrigatorio);
    }
  }

  async handleOpenSingleStepInternship(estagio, sub, aceito, datafechado) {
    const idorientador = await knex('usuario').select('id')
      .where({ sub: sub });
    if (aceito === true) {
      const cargaCurso = await knex.select('c.carga')
        .from('curso AS c')
        .leftJoin('usuario AS u', 'u.idcurso', 'c.id')
        .where({ 'u.id': estagio[0].idaluno });
      await knex('usuario').update('cargatotal', cargaCurso[0].carga)
        .where({ id: estagio[0].idaluno });
      await knex('estagio').update({ idorientador: idorientador[0].id, idstatus: 2, fechado: datafechado })
        .where({ id: estagio[0].id });
    } else {
      await knex('estagio').update({ idorientador: idorientador[0].id, idstatus: 8 })
        .where({ id: estagio[0].id });
    }
  }

  async handleOpenThreeStepInternship(estagio, sub, aceito, idfrequencia, obrigatorio) {
    const idorientador = await knex('usuario').select('id')
      .where({ sub: sub });
    if (aceito === true) {
      estagio[0].processo.etapas[0].atual = false;
      estagio[0].processo.etapas[1].atual = true;
      await knex('estagio').update({
        idorientador: idorientador[0].id, idstatus: 8, processo: estagio[0].processo, idfrequencia: idfrequencia, obrigatorio: obrigatorio,
      })
        .where({ id: estagio[0].id });
    } else {
      await knex('estagio').update({ idorientador: idorientador[0].id, idstatus: 8 })
        .where({ id: estagio[0].id });
    }
  }

  async updateFeedbackStatusLateOrWithoutTicket(estagio, datafechado, aceito, idTicket, idfrequencia, obrigatorio) {
    if (estagio[0].etapaunica) {
      if (aceito === true) {
        const cargaCurso = await knex.select('c.carga')
          .from('curso AS c')
          .leftJoin('usuario AS u', 'u.idcurso', 'c.id')
          .where({ 'u.id': estagio[0].idaluno });
        await knex('usuario').update('cargatotal', cargaCurso[0].carga)
          .where({ id: estagio[0].idaluno });
        await knex('estagio').update({ idstatus: 2, fechado: datafechado })
          .where({ id: estagio[0].id });
      } else {
        await knex('estagio').update({ idstatus: 8 })
          .where({ id: estagio[0].id });
      }
    } else {
      const indexAtual = estagio[0].processo.etapas.findIndex(x => x.atual === true);
      const ticketsEstagio = await knex('estagio AS e').select(knex.raw('json_agg(t.*) as tickets'))
        .leftJoin('ticket AS t', 't.idestagio', 'e.id')
        .where({ 'e.id': estagio[0].id });
      if (aceito === true) {
        if (estagio[0].processo.etapas[indexAtual].loop === true) { // se etapa for loop
          if (estagio[0].obrigatorio === 'Obrigatório') {
            if (estagio[0].status === 'Atrasado') {
              const indexTicketAtual = ticketsEstagio[0].tickets.length;
              const datavencimentoticket = new Date(ticketsEstagio[0].tickets[indexTicketAtual - 2].datacriado);
              let prazo = estagio[0].processo.etapas.filter(x => x.atual === true);
              prazo = prazo[0].prazo;
              datavencimentoticket.setMonth(datavencimentoticket.getMonth() + estagio[0].frequencia);
              datavencimentoticket.setDate(datavencimentoticket.getDate() + prazo);
              datavencimentoticket.setDate(datavencimentoticket.getDate() + 10);
              const dataComparar = new Date(ticketsEstagio[0].tickets[indexTicketAtual - 1].datacriado);
              if (dataComparar > datavencimentoticket) {
                const diastrabalhados = await knex('ticket').select('diastrabalhados')
                  .where({ id: idTicket });
                const horasAdicionadas = -(estagio[0].cargahoraria * diastrabalhados[0].diastrabalhados);
                console.log(horasAdicionadas)
                const cargaTotal = await knex('usuario').returning('cargatotal').increment('cargatotal', horasAdicionadas)
                  .where({ id: estagio[0].idaluno });
                if (cargaTotal < 0) {
                  await knex('usuario').update('cargatotal', 0)
                    .where({ id: estagio[0].idaluno });
                }
                await knex('ticket').update({ horasadicionadas: horasAdicionadas, datafechado: datafechado })
                  .where({ id: idTicket });
                await knex('estagio').update({ processo: estagio[0].processo, idstatus: 7 })
                  .where({ id: estagio[0].id });
              } else {
                const diastrabalhados = await knex('ticket').select('diastrabalhados')
                  .where({ id: idTicket });
                const carga = await knex('usuario').returning('cargatotal').increment('cargatotal', estagio[0].cargahoraria * diastrabalhados[0].diastrabalhados)
                  .where({ id: estagio[0].idaluno });
                await knex('ticket').update({ horasadicionadas: estagio[0].cargahoraria * diastrabalhados[0].diastrabalhados, datafechado: datafechado })
                  .where({ id: idTicket });
                const cargaCurso = await knex.select('c.carga')
                  .from('curso AS c')
                  .leftJoin('usuario AS u', 'u.idcurso', 'c.id')
                  .where({ 'u.id': estagio[0].idaluno });
                if (carga[0].cargatotal >= cargaCurso[0].carga) { // se tiver finalizado loop
                  estagio[0].processo.etapas[indexAtual].atual = false;
                  estagio[0].processo.etapas[indexAtual + 1].atual = true;
                  await knex('estagio').update({ processo: estagio[0].processo, idstatus: 8 })
                    .where({ id: estagio[0].id });
                } else {
                  await knex('estagio').update({ idstatus: 7 })
                    .where({ id: estagio[0].id });
                }
              }
            } else {
              const diastrabalhados = await knex('ticket').select('diastrabalhados')
                .where({ id: idTicket });
              const carga = await knex('usuario').returning('cargatotal').increment('cargatotal', estagio[0].cargahoraria * diastrabalhados[0].diastrabalhados)
                .where({ id: estagio[0].idaluno });
              await knex('ticket').update({ horasadicionadas: estagio[0].cargahoraria * diastrabalhados[0].diastrabalhados, datafechado: datafechado })
                .where({ id: idTicket });
              const cargaCurso = await knex.select('c.carga')
                .from('curso AS c')
                .leftJoin('usuario AS u', 'u.idcurso', 'c.id')
                .where({ 'u.id': estagio[0].idaluno });
              if (carga[0].cargatotal >= cargaCurso[0].carga) { // se tiver finalizado loop
                estagio[0].processo.etapas[indexAtual].atual = false;
                estagio[0].processo.etapas[indexAtual + 1].atual = true;
                await knex('estagio').update({ processo: estagio[0].processo, idstatus: 8 })
                  .where({ id: estagio[0].id });
              } else {
                await knex('estagio').update({ idstatus: 7 })
                  .where({ id: estagio[0].id });
              }
            }
          } else {
            await knex('estagio').update({ idstatus: 7 })
              .where({ id: estagio[0].id });
          }
        } else {
          const indexAtual = estagio[0].processo.etapas.findIndex(x => x.atual === true);
          if (indexAtual === 0) {
            estagio[0].processo.etapas[0].atual = false;
            estagio[0].processo.etapas[1].atual = true;
            await knex('estagio').update({
              idstatus: 8, processo: estagio[0].processo, idfrequencia: idfrequencia, obrigatorio: obrigatorio,
            })
              .where({ id: estagio[0].id });
          } else {
            estagio[0].processo.etapas[indexAtual].atual = false;
            await knex('estagio').update({ fechado: datafechado, idstatus: 2 })
              .where({ id: estagio[0].id });
          }
        }
      } else {
        await knex('estagio').update({ idstatus: 8 })
          .where({ id: estagio[0].id });
      }
    }
  }

  async updateLatest(idTicket, ticket) {
    try {
      const ticketAtual = await knex.select('mensagem')
        .table('ticket')
        .where({ id: idTicket });
      if (ticketAtual.length === 0) return { response: 'Ticket não encontrado', status: 404 };

      if (ticketAtual[0].mensagem !== ticket.mensagem) {
        await knex.update({ mensagem: ticket.mensagem })
          .table('ticket')
          .where({ id: idTicket });
      }

      const documentos = await knex.select('id', 'arquivo')
        .table('documento')
        .where({ idticket: idTicket });
      if (documentos.length === 0) return { response: 'Documentos não encontrado', status: 404 };

      for (const i in documentos) {
        for (const j in ticket.documentos) {
          if (documentos[i].id === ticket.documentos[j].id) {
            if (documentos[i].arquivo !== ticket.documentos[j].arquivo) {
              await knex.update({ arquivo: ticket.documentos[j].arquivo })
                .table('documento')
                .where({ id: ticket.documentos[j].id });
              break;
            }
          }
        }
      }
      return { response: 'Ticket atualizado com sucesso', status: 200 };
    } catch (error) {
      return { response: 'Erro ao atualizar ticket', status: 404 };
    }
  }

  async deletePending(idTicket, sub) {
    try {
      await knex.transaction(async (trx) => {
        const documentos = await knex('documento').select('arquivo')
          .where({ idticket: idTicket });
        await knex.del().table('ticket').where({ id: idTicket });
        for (const i in documentos) {
          await Documento.delete(documentos[i].arquivo, sub);
        }
        await trx.commit;
      });

      return { response: 'Ticket deletado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao deletar ticket', status: 404 };
    }
  }
}

module.exports = new Ticket();
