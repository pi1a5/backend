/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */
/* eslint-disable block-scoped-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
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
      const result = await knex.select(['id', 'mensagem', 'resposta', 'datacriado', 'datafechado', 'limite', 'aceito'])
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
      const result = await knex.select(['t.id', 't.mensagem', 't.resposta', 't.datacriado', 't.datafechado', 't.limite', 't.aceito'])
        .from('ticket AS t')
        .leftJoin('estagio AS e', 'e.id', 't.idestagio')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .where({ 'c.area': area[0].area, 't.resposta': null, 'e.idorientador': null })
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
        .where({ sub });
      if (id.length === 0) return { response: 'Usuário não encontrado', status: 404 };
      const result = await knex.select(['t.id', 't.mensagem', 't.resposta', 't.datacriado', 't.datafechado', 't.limite', 't.aceito'])
        .from('ticket AS t')
        .leftJoin('estagio AS e', 'e.id', 't.idestagio')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .where({ 't.resposta': null, 'e.idorientador': id.id })
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
        .where({ sub });
      if (id.length === 0) return { response: 'Usuário não encontrado', status: 404 };
      const result = await knex.select(['t.id', 't.mensagem', 't.resposta', 't.datacriado', 't.datafechado', 't.limite', 't.aceito'])
        .from('ticket AS t')
        .leftJoin('estagio AS e', 'e.id', 't.idestagio')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .where({ 'e.idorientador': id.id })
        .whereNotNull('t.resposta')
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

  async create(sub, mensagem, documentos, limite) {
    try {
      const criado = new Date();
      const id = await knex.select(['id'])
        .table('usuario')
        .where({ sub });
      if (id.length === 0) return { response: 'Usuário não encontrado', status: 404 };
      const idEstagio = await knex.select(['id'])
        .table('estagio')
        .where({ idaluno: id[0].id });
      if (idEstagio.length === 0) return { response: 'Usuário não encontrado', status: 404 };
      const idTicket = await knex.returning('id')
        .insert({
          idestagio: idEstagio[0].id, mensagem: mensagem, datacriado: criado, limite: limite,
        }).table('ticket');

      for (const i in documentos) {
        await knex.insert({ idticket: idTicket[0].id, arquivo: documentos[i].arquivo, nome: documentos[i].nome })
          .table('documento');
      }
      return { response: 'Ticket criado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao criar tickets', status: 404 };
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

  async updateLatest(idTicket, ticket) {
    try {
      if ('nome' in etapa && 'prazo' in etapa) {
        idprocesso = await knex.returning('idprocesso').update({ nome: etapa.nome, prazo: etapa.prazo }).table('etapa').where({ id: idetapa });
      } else if ('nome' in etapa) {
        idprocesso = await knex.returning('idprocesso').update({ nome: etapa.nome }).table('etapa').where({ id: idetapa });
      } else if ('prazo' in etapa) {
        idprocesso = await knex.returning('idprocesso').update({ prazo: etapa.prazo }).table('etapa').where({ id: idetapa });
      }
    } catch (error) {
      return { response: 'Erro ao atualizar ticket', status: 404 };
    }
  }

  async deleteLatest(idTicket) {
    try {
      await knex.del().table('ticket').where({ id: idTicket })
      return { response: 'Ticket deletado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao deletar ticket', status: 404 };
    }
  }
}

module.exports = new Ticket();
