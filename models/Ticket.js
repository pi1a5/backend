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
  async findAll() {
    try {
      const result = await knex.select('*').table('ticket');
      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getAllbyUserId(sub) {
    try {
      const id = await knex.select(['id']).table('usuario').where({ sub }).first();
      const result = await knex.select(['t.id', 't.id_usuario_aluno', 't.corpo_texto', 't.data_criado', 't.data_fechado', 't.data_limite', 't.feedback', 't.id_processo_estagio', 't.id_usuario_orientador', 't.eAceito', 't.tipo_estagios', 'u.nome', 'u.email', 'u.foto', 'u.sub', 'u.idToken', 'u.prontuario', 'pe.id_tipo_estagios', 'pe.situação']).from('ticket AS t').leftJoin('usuario AS u', 'u.id', 't.id_usuario_aluno').leftJoin('processo_estagio AS pe', 'pe.id', 't.id_processo_estagio')
        .leftJoin('tipo_estagios AS te', 'te.id', 'pe.id_tipo_estagios')
        .where({ 't.id_usuario_aluno': id.id })
        .orderBy('t.id', 'desc');
      if (result.length > 0) { // se retornar 1 ticket ou mais
        for (const i in result) {
          result[i].arquivos = await this.getPdfUrl(result[i].id);
        }
        return result;
      }
      return undefined;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getJoinWithoutSupervisor(sub) {
    try {
      const curso = await knex.select(['id_curso']).table('usuario').where({ sub }).first();
      console.log(curso);
      const result = await knex.select('t.id', 't.id_usuario_aluno', 't.corpo_texto', 't.data_criado', 't.data_fechado', 't.data_limite', 't.feedback', 't.id_processo_estagio', 't.id_usuario_orientador', 't.eAceito', 't.tipo_estagios', 'u.id_curso', 'u.nome', 'u.email', 'u.foto', 'u.sub', 'u.idToken', 'u.prontuario', 'pe.id_tipo_estagios', 'pe.situação', 'te.icon').from('ticket AS t').leftJoin('usuario AS u', 'u.id', 't.id_usuario_aluno').leftJoin('processo_estagio AS pe', 'pe.id', 't.id_processo_estagio')
        .leftJoin('tipo_estagios AS te', 'te.id', 'pe.id_tipo_estagios')
        .where({ 't.feedback': null, 't.id_usuario_orientador': null, 'u.id_curso': curso.id_curso })
        .orderBy('t.data_limite', 'asc');
      for (const i in result) {
        result[i].arquivos = await this.getPdfUrl(result[i].id);
      }
      return result;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getJoinWithSupervisorOpen(sub) {
    try {
      const id = await knex.select(['id']).table('usuario').where({ sub }).first();
      const result = await knex.select('t.id', 't.id_usuario_aluno', 't.corpo_texto', 't.data_criado', 't.data_fechado', 't.data_limite', 't.feedback', 't.id_processo_estagio', 't.id_usuario_orientador', 't.eAceito', 't.tipo_estagios', 'u.id_curso', 'u.nome', 'u.email', 'u.foto', 'u.sub', 'u.idToken', 'u.prontuario', 'pe.id_tipo_estagios', 'pe.situação', 'te.icon').from('ticket AS t').leftJoin('usuario AS u', 'u.id', 't.id_usuario_aluno').leftJoin('processo_estagio AS pe', 'pe.id', 't.id_processo_estagio')
        .leftJoin('tipo_estagios AS te', 'te.id', 'pe.id_tipo_estagios')
        .where({ 't.id_usuario_orientador': id.id, 't.feedback': null })
        .orderBy('t.data_limite', 'asc');
      for (const i in result) {
        result[i].arquivos = await this.getPdfUrl(result[i].id);
      }
      return result;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getJoinWithSupervisorClosed(sub) {
    try {
      const id = await knex.select(['id']).table('usuario').where({ sub }).first();
      const result = await knex.select('t.id', 't.id_usuario_aluno', 't.corpo_texto', 't.data_criado', 't.data_fechado', 't.data_limite', 't.feedback', 't.id_processo_estagio', 't.id_usuario_orientador', 't.eAceito', 't.tipo_estagios', 'u.id_curso', 'u.nome', 'u.email', 'u.foto', 'u.sub', 'u.idToken', 'u.prontuario', 'pe.id_tipo_estagios', 'pe.situação', 'te.icon').from('ticket AS t').leftJoin('usuario AS u', 'u.id', 't.id_usuario_aluno').leftJoin('processo_estagio AS pe', 'pe.id', 't.id_processo_estagio')
        .leftJoin('tipo_estagios AS te', 'te.id', 'pe.id_tipo_estagios')
        .where({ 't.id_usuario_orientador': id.id })
        .whereNotNull('t.feedback')
        .orderBy('t.data_fechado', 'desc');
      for (const i in result) {
        result[i].arquivos = await this.getPdfUrl(result[i].id);
      }
      return result;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getPdfUrl(id) {
    try {
      console.log(id);
      const url = await knex.select('*').table('documento').where({ id_ticket: id });

      console.log(url);
      if (url) {
        return url;
      }
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async checkIfHasStarted(sub) {
    try {
      const id = await knex.select(['id']).table('usuario').where({ sub }).first();
      const result = await knex.select(['t.id', 't.feedback', 't.eAceito', 'pe.id_tipo_estagios']).from('ticket AS t').leftJoin('processo_estagio as pe', 'pe.id', 't.id_processo_estagio').where({ 't.id_usuario_aluno': id.id })
        .orderBy('id', 'asc');
      const tamanho = result.length;

      console.log(tamanho);

      if (tamanho > 0) { // se retornar 1 ticket ou mais
        if (tamanho === 1) { // se fora apenas um ticket
          if (result[0].feedback != null && result[0].eAceito === false) { // se o ticket foi recusado
            return {result: true, message: "ok"};
          }
          return {result: false, message: "erro1"};
        } // se retornar mais do que um
        if (result[tamanho - 1].id_tipo_estagios === 0 && result[tamanho - 1].feedback != null && result[tamanho - 1].eAceito === false) { // se o ultimo ticket desse usuário for sobre início de estágio e for recusado
          return {result: true, message: "ok"};
        }
        return {result: false, message: "erro2"};
      } else{
        return {result: true, message: "ok"};
      }
    } catch (error) {
      console.log(error);
      return {result: false, message: "erro3"};
    }
  }

  async checkIfinAcompanhamento(sub) {
    try {
      const id = await knex.select(['id']).table('usuario').where({ sub }).first();
      const result = await knex.select(['t.id', 't.eAceito', 'pe.id_tipo_estagios', 't.feedback']).from('processo_estagio AS pe').leftJoin('ticket AS t', 't.id_processo_estagio', 'pe.id').where({ 't.id_usuario_aluno': id.id })
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
      const id = await knex.select(['id']).table('usuario').where({ sub }).first();
      console.log(id);
      const result = await knex.select(['t.id', 't.eAceito', 'pe.id_tipo_estagios', 't.feedback']).from('processo_estagio AS pe').leftJoin('ticket AS t', 't.id_processo_estagio', 'pe.id').where({ 't.id_usuario_aluno': id.id, 't.tipo_estagios': 'Acompanhamento' })
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
      const id = await knex.select(['id']).table('usuario').where({ sub }).first();
      const situacao = await knex.select('situação').from('processo_estagio AS pe').leftJoin('ticket AS t', 't.id_processo_estagio', 'pe.id').where({ 't.id_usuario_aluno': id.id })
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
      const id = await knex.select(['id']).table('usuario').where({ sub }).first();
      const idExiste = await knex.select(['id_processo_estagio']).table('ticket').where({ id_usuario_aluno: id.id });
      const idProcessoEstagio = false;
      
      if (idExiste.length === 0) { // se usuario não tem processo
        idProcessoEstagio = await knex.returning('id AS id_processo_estagio').insert({
          id_tipo_estagios: 0, situação: true, data_criado: dataCriado, data_fechado: null,
        }).table('processo_estagio');
      } else if (idExiste.length > 0) {
        idProcessoEstagio = idExiste;
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
          return {result: true, message: "Ticket criado com sucesso."};
        }
      } else {
        return {result: false, message: "Usuário já tem processo"};
      }
    } catch (error) {
      console.log(error);
      return {result: false, message: "Erro na criação do ticket"};
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
          id_usuario_aluno: id.id, corpoTexto, dataCriado, data_fechado: null, dataLimite, feedback: null, id_processo_estagio: idProcessoEstagio[0].id_processo_estagio, id_usuario_orientador: idProcessoEstagio[0].id_usuario_orientador, tipo_estagios: 'Acompanhamento',
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
          id_usuario_aluno: id.id, corpoTexto, dataCriado, data_fechado: null, dataLimite, feedback: null, id_processo_estagio: idProcessoEstagio[0].id_processo_estagio, id_usuario_orientador: idProcessoEstagio[0].id_usuario_orientador, tipo_estagios: 'Finalização de Estágio',
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
        feedback, eAceito, id_usuario_orientador: id.id, dataFechado,
      }).table('ticket').where({ id: idTicket });
      return true;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

module.exports = new Ticket();
