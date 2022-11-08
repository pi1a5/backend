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
      const tickets = await knex.select('t.*', knex.raw('json_agg(d.*) as documentos'), knex.raw('json_agg(DISTINCT u.*) as usuario'), knex.raw('json_agg(DISTINCT c.nome) as curso'))
        .from('ticket AS t')
        .leftJoin('estagio AS e', 'e.id', 't.idestagio')
        .leftJoin('documento AS d', 'd.idticket', 't.id')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .where({ 'e.idorientador': id[0].id, 't.resposta': null })
        .orderBy('t.id', 'asc')
        .groupBy('t.id');
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

  async updateFeedback(sub, idTicket, feedback, aceito, idfrequencia) {
    try {
      const datafechado = new Date();
      const estagio = await knex.select('e.cargahoraria', 'e.id', 'e.idaluno', 'e.idfrequencia', 'f.valor AS frequencia', 's.nome AS status', 'e.etapaunica')
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
            await this.updateFeedbackStatusOpen(estagio, datafechado, aceito, sub, idfrequencia);
            break;
          case 'Atrasado':
          case 'Sem Resposta':
            await this.updateFeedbackStatusLateOrWithoutTicket(estagio, datafechado, aceito, idTicket);
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

  async updateFeedbackStatusOpen(estagio, datafechado, aceito, sub, idfrequencia) {
    if (estagio[0].etapaunica) {
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
    } else {
      const idorientador = await knex('usuario').select('id')
        .where({ sub: sub });
      if (aceito === true) {
        const processoAtual = await knex('estagio').select('processo')
          .where({ id: estagio[0].id });
        processoAtual[0].processo.etapas[0].atual = false;
        processoAtual[0].processo.etapas[1].atual = true;
        await knex('estagio').update({
          idorientador: idorientador[0].id, idstatus: 8, processo: processoAtual[0].processo, idfrequencia: idfrequencia,
        })
          .where({ id: estagio[0].id });
      } else {
        await knex('estagio').update({ idorientador: idorientador[0].id, idstatus: 8 })
          .where({ id: estagio[0].id });
      }
    }
  }

  async updateFeedbackStatusLateOrWithoutTicket(estagio, datafechado, aceito, idTicket) {
    if (aceito === true) {
      const processoAtual = await knex('estagio').select('processo')
        .where({ id: estagio[0].id });
      const indexAtual = processoAtual[0].processo.etapas.findIndex(x => x.atual === true);
      if (processoAtual[0].processo.etapas[indexAtual].loop === true) { // se etapa for loop
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
          processoAtual[0].processo.etapas[indexAtual].atual = false;
          processoAtual[0].processo.etapas[indexAtual + 1].atual = true;
          await knex('estagio').update({ processo: processoAtual[0].processo, idstatus: 8 })
            .where({ id: estagio[0].id });
        } else {
          await knex('estagio').update({ idstatus: 7 })
            .where({ id: estagio[0].id });
        }
      } else {
        const indexAtual = processoAtual[0].processo.etapas.findIndex(x => x.atual === true);
        processoAtual[0].processo.etapas[indexAtual].atual = false;
        await knex('estagio').update({ fechado: datafechado, idstatus: 2 })
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
