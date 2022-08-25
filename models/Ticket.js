/* eslint-disable linebreak-style */
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

class Ticket {
  async getAll() {
    try {
      const result = await knex.select('*').table('ticket');
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao resgatar tickets', status: 404 };
    }
  }

  async getAllbyUserId(sub) {
    try {
      const id = await knex.select(['id'])
        .table('usuario')
        .where({ sub });
      if (id.length === 0) return { response: 'Usuário não encontrado', status: 404 };
      const estagio = await knex.select(['id'])
        .table('estagio')
        .where({ idaluno: id[0].id });
      if (estagio.length === 0) return { response: 'Usuário não tem estágio', status: 404 };
      const result = await knex.select(['id', 'mensagem', 'resposta', 'datacriado', 'datafechado', 'datalimite', 'aceito'])
        .table('ticket')
        .where({ idestagio: estagio[0].id })
        .orderBy('id', 'desc');
      if (result.length === 0) return { response: 'Usuário não tem ticket', status: 404 };

      for (const i in result) {
        const arquivos = await this.getPdfUrl(result[i].id);
        if (arquivos.status !== 200) return { response: arquivos.status, status: arquivos.status };
        result[i].arquivos = arquivos.response;
      }
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao resgatar tickets', status: 404 };
    }
  }

  async getJoinWithoutSupervisor(sub) {
    try {
      const ids = await knex.select(['idcurso', 'id'])
        .table('usuario')
        .where({ sub });
      if (ids.length === 0) return { response: 'Usuário não encontrado', status: 404 };
      const area = await knex.select(['area'])
        .from('curso AS c')
        .leftJoin('usuario AS u', 'u.idcurso', 'c.id')
        .where({ 'u.idcurso': ids[0].idcurso, 'u.id': ids[0].id });
      if (area.length === 0) return { response: 'Area não encontrada', status: 404 };
      const result = await knex.select(['t.id', 't.mensagem', 't.resposta', 't.datacriado', 't.datafechado', 't.datalimite', 't.aceito'])
        .from('ticket AS t')
        .leftJoin('estagio AS e', 'e.id', 't.idestagio')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .where({ 'c.area': area[0].area, 't.feedback': null, 'e.idorientador': null })
        .orderBy('t.id', 'desc');
      if (result.length === 0) return { response: 'Usuário não tem ticket', status: 404 };

      for (const i in result) {
        const arquivos = await this.getPdfUrl(result[i].id);
        if (arquivos.status !== 200) return { response: arquivos.status, status: arquivos.status };
        result[i].arquivos = arquivos.response;
      }
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao resgatar tickets', status: 404 };
    }
  }

  async getJoinWithSupervisorOpen(sub) {
    try {
      const id = await knex.select(['id'])
        .table('usuario')
        .where({ sub }).first();
      if (id.length === 0) return { response: 'Usuário não encontrado', status: 404 };
      const result = await knex.select(['t.id', 't.mensagem', 't.resposta', 't.datacriado', 't.datafechado', 't.datalimite', 't.aceito'])
        .from('ticket AS t')
        .leftJoin('estagio AS e', 'e.id', 't.idestagio')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .where({ 't.feedback': null, 'e.idorientador': id.id })
        .orderBy('t.id', 'desc');
      if (result.length === 0) return { response: 'Usuário não tem ticket', status: 404 };
      for (const i in result) {
        const arquivos = await this.getPdfUrl(result[i].id);
        if (arquivos.status !== 200) return { response: arquivos.status, status: arquivos.status };
        result[i].arquivos = arquivos.response;
      }
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao resgatar tickets', status: 404 };
    }
  }

  async getJoinWithSupervisorClosed(sub) {
    try {
      const id = await knex.select(['id'])
        .table('usuario')
        .where({ sub }).first();
      if (id.length === 0) return { response: 'Usuário não encontrado', status: 404 };
      const result = await knex.select(['t.id', 't.mensagem', 't.resposta', 't.datacriado', 't.datafechado', 't.datalimite', 't.aceito'])
        .from('ticket AS t')
        .leftJoin('estagio AS e', 'e.id', 't.idestagio')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .where({ 'e.idorientador': id.id })
        .whereNotNull('t.feedback')
        .orderBy('t.id', 'desc');
      if (result.length === 0) return { response: 'Usuário não tem ticket', status: 404 };

      for (const i in result) {
        const arquivos = await this.getPdfUrl(result[i].id);
        if (arquivos.status !== 200) return { response: arquivos.status, status: arquivos.status };
        result[i].arquivos = arquivos.response;
      }
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return false;
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

  async checkIfHasStarted(sub) {
    try {
      const id = await knex.select(['id']).table('usuario').where({ sub }).first();
      const result = await knex.select(['t.id', 't.feedback', 't.eAceito', 'pe.id_tipo_estagios'])
        .from('ticket AS t')
        .leftJoin('processo_estagio as pe', 'pe.id', 't.id_processo_estagio').where({ 't.id_usuario_aluno': id.id })
        .orderBy('id', 'asc');

      const tamanho = result.length;

      if (tamanho > 0) { // se retornar 1 ticket ou mais
        if (tamanho === 1) { // se fora apenas um ticket
          if (result[0].feedback != null && result[0].eAceito === false) { // se o ticket foi recusado
            return { result: true, message: 'ok' };
          }
          return { result: false, message: 'erro1' };
        } // se retornar mais do que um
        if (result[tamanho - 1].id_tipo_estagios === 0 && result[tamanho - 1].feedback != null && result[tamanho - 1].eAceito === false) { // se o ultimo ticket desse usuário for sobre início de estágio e for recusado
          return { result: true, message: 'ok' };
        }
        return { result: false, message: 'erro2' };
      }
      return { result: true, message: 'ok' };
    } catch (error) {
      console.log(error);
      return { result: false, message: 'erro3' };
    }
  }

  async checkIfinAcompanhamento(sub) {
    try {
      const id = await knex.select(['id'])
        .table('usuario')
        .where({ sub }).first();

      const result = await knex.select(['t.id', 't.eAceito', 'pe.id_tipo_estagios', 't.feedback'])
        .from('processo_estagio AS pe')
        .leftJoin('ticket AS t', 't.id_processo_estagio', 'pe.id')
        .where({ 't.id_usuario_aluno': id.id })
        .orderBy('t.id', 'asc');

      const tamanho = result.length;
      if (tamanho > 0) { // se retornar 1 ticket ou mais
        if (tamanho === 1) { // se for apenas 1 ticket
          if (result[0].eAceito === true) { // se o ticket (inicio) for aceito
            return true;
          }
          return false;
        } // se retornar mais de 1 ticket
        if (result[tamanho - 1].id_tipo_estagios === 0) { // se o utlimo ticket for do tipo inicio
          return false;
        } if (result[tamanho - 1].id_tipo_estagios === 1 && result[tamanho - 1].feedback != null) { // se o utlimo ticket for do tipo acompanhamento e tiver feedback
          return true;
        }
        return false;
      }
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async checkIfFim(sub) {
    try {
      const id = await knex.select(['id'])
        .table('usuario')
        .where({ sub })
        .first();

      console.log(id);
      const result = await knex.select(['t.id', 't.eAceito', 'pe.id_tipo_estagios', 't.feedback'])
        .from('processo_estagio AS pe')
        .leftJoin('ticket AS t', 't.id_processo_estagio', 'pe.id')
        .where({ 't.id_usuario_aluno': id.id, 't.tipo_estagios': 'Acompanhamento' })
        .orderBy('t.id', 'asc');

      if (result) { // se retornar ticket de acompanhamento
        const tamanho = result.length;
        if (result[tamanho - 1].feedback != null && result[tamanho - 1].eAceito === true) { // se o ultimo ticket foi aceito
          return true;
        }
        return false;
      }
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async checkFinalizou(sub) {
    try {
      const id = await knex.select(['id'])
        .table('usuario')
        .where({ sub }).first();

      const situacao = await knex.select('situação')
        .from('processo_estagio AS pe')
        .leftJoin('ticket AS t', 't.id_processo_estagio', 'pe.id')
        .where({ 't.id_usuario_aluno': id.id })
        .first();

      console.log(situacao);
      if (situacao) {
        if (situacao.situação) {
          return true;
        }
        return false;
      // eslint-disable-next-line no-else-return
      } else {
        return true;
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async createTicketInicio(corpoTexto, dataLimite, sub, doc1, doc2, eProfessor) {
    try {
      const dataCriado = new Date();
      const id = await knex.select(['id'])
        .table('usuario')
        .where({ sub }).first();

      const idExiste = await knex.select(['id_processo_estagio'])
        .table('ticket')
        .where({ id_usuario_aluno: id.id });

      if (idExiste.length === 0) { // se usuario não tem processo
        var idProcessoEstagio = await knex.returning('id AS id_processo_estagio').insert({
          id_tipo_estagios: 0, situação: true, data_criado: dataCriado, data_fechado: null,
        }).table('processo_estagio');
        console.log('b');
      } else if (idExiste.length > 0) {
        var idProcessoEstagio = idExiste;
        console.log('c');
      } else {
        var idProcessoEstagio = false;
        console.log('d');
      }

      if (idProcessoEstagio) {
        if (await knex.insert({
          id_usuario_aluno: id.id, corpo_texto: corpoTexto, data_criado: dataCriado, data_fechado: null, data_limite: dataLimite, feedback: null, id_processo_estagio: idProcessoEstagio[0].id_processo_estagio, id_usuario_orientador: null, tipo_estagios: 'Início de Estágio',
        }).table('ticket')) {
          const idTicket = await knex.select(['id']).table('ticket').where({ feedback: null, id_usuario_aluno: id.id }).first();

          const key1 = await Aws.uploadFile(doc1, sub);
          const key2 = await Aws.uploadFile(doc2, sub);

          await knex.insert({
            id_ticket: idTicket.id, arquivo: key1, tipo: 'Termo de Compromisso de Estágio', eProfessor,
          }).table('documento');
          await knex.insert({
            id_ticket: idTicket.id, arquivo: key2, tipo: 'Plano de Atividades', eProfessor,
          }).table('documento');
          return { result: true, message: 'Ticket criado com sucesso' };
        }
      } else {
        return { result: false, message: 'Usuário já tem processo' };
      }
    } catch (error) {
      console.log(error);
      return { result: false, message: 'Erro na criação do ticket' };
    }
    return false;
  }

  async createTicketAcompanhamento(corpoTexto, sub, doc, eProfessor, dataLimite) {
    try {
      const dataCriado = new Date();
      const id = await knex.select(['id']).table('usuario').where({ sub }).first();

      const idProcessoEstagio = await knex.select('t.id_processo_estagio', 't.id_usuario_orientador').from('ticket AS t').leftJoin('processo_estagio AS pe', 'pe.id', 't.id_processo_estagio').whereNotNull('t.feedback');
      if (idProcessoEstagio) {
        if (await knex.insert({
          id_usuario_aluno: id.id, corpo_texto: corpoTexto, data_criado: dataCriado, data_fechado: null, data_limite: dataLimite, feedback: null, id_processo_estagio: idProcessoEstagio[0].id_processo_estagio, id_usuario_orientador: idProcessoEstagio[0].id_usuario_orientador, tipo_estagios: 'Acompanhamento',
        }).table('ticket')) {
          const idTicket = await knex.select(['id']).table('ticket').where({ feedback: null, id_usuario_aluno: id.id }).first();

          console.log(doc);

          const key = await Aws.uploadFile(doc, sub);

          await knex.insert({
            id_ticket: idTicket.id, arquivo: key, tipo: 'Relatório de Atividades de Estágio', eProfessor,
          }).table('documento');
          return true;
        }
      }
    } catch (error) {
      console.log(error);
      return false;
    }
    return false;
  }

  async createTicketFim(corpoTexto, sub, doc, eProfessor, dataLimite) {
    try {
      const dataCriado = new Date();
      const id = await knex.select(['id']).table('usuario').where({ sub }).first();

      const idProcessoEstagio = await knex.select('t.id_processo_estagio', 't.id_usuario_orientador').from('ticket AS t').leftJoin('processo_estagio AS pe', 'pe.id', 't.id_processo_estagio').whereNotNull('t.feedback');
      if (idProcessoEstagio) {
        if (await knex.insert({
          id_usuario_aluno: id.id, corpo_texto: corpoTexto, data_criado: dataCriado, data_fechado: null, data_limite: dataLimite, feedback: null, id_processo_estagio: idProcessoEstagio[0].id_processo_estagio, id_usuario_orientador: idProcessoEstagio[0].id_usuario_orientador, tipo_estagios: 'Finalização de Estágio',
        }).table('ticket')) {
          const idTicket = await knex.select(['id']).table('ticket').where({ feedback: null, id_usuario_aluno: id.id }).first();

          const key = await Aws.uploadFile(doc, sub);

          await knex.insert({
            id_ticket: idTicket.id, arquivo: key, tipo: 'Termo de Realização de Estágio', eProfessor,
          }).table('documento');
          return true;
        }
      }
    } catch (error) {
      console.log(error);
      return false;
    }
    return false;
  }

  async updateFeedback(sub, idTicket, feedback, eAceito) {
    try {
      const dataFechado = new Date();
      const id = await knex.select(['id']).table('usuario').where({ sub }).first();
      if (eAceito === true) {
        const idTipoEstagios = await knex.select(['pe.id_tipo_estagios', 'pe.id', 't.tipo_estagios']).from('processo_estagio AS pe').leftJoin('ticket AS t', 't.id_processo_estagio', 'pe.id').where({ 't.id': idTicket })
          .first();
        if (idTipoEstagios.id_tipo_estagios === 0) {
          await knex.update({ id_tipo_estagios: 1 }).table('processo_estagio').where({ id: idTipoEstagios.id });
        } else if (idTipoEstagios.id_tipo_estagios === 1) {
          if (idTipoEstagios.tipo_estagios === 'Finalização de Estágio') {
            await knex.update({ id_tipo_estagios: 2, situação: false }).table('processo_estagio').where({ id: idTipoEstagios.id });
          }
        }
      }
      await knex.update({
        feedback, eAceito, id_usuario_orientador: id.id, data_fechado: dataFechado,
      }).table('ticket').where({ id: idTicket });
      return true;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

module.exports = new Ticket();
