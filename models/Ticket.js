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
  async new(corpoTexto, sub, files){
    try {
      const dataCriado = new Date();
      const estagioid = await knex.select(['e.id'])
        .from('estagio AS e')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .where({ 'u.sub': sub })
      const processo = await knex('estagio').select('processo').where({ id: estagioid[0].id});
      let etapaAtual = {};

      for (const i in processo[0].processo.etapas) {
        if (processo[0].processo.etapas[i].atual === true) {
          etapaAtual['nome'] = processo[0].processo.nome;
          etapaAtual['etapa'] = processo[0].processo.etapas[i];
          break;
        }
      }

      const ticketid = await knex('ticket').returning('id').insert({ mensagem: corpoTexto, idestagio: estagioid[0].id , datacriado: dataCriado , etapa: etapaAtual});
      const documentos = [];

      for (const file in files) {
        documentos.push({ idticket: ticketid[0].id, arquivo: await Aws.uploadFile(files[file], sub), nome: file})
      }
      await knex('documento').insert(documentos);

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
        .where({ 'u.sub': sub, 't.resposta': null})
        .orderBy('t.id', 'desc')
        .groupBy('t.id');

      if (result.length !== 0) {
        return { response: result, status: 200 };
      } else {
        return { response: null, status: 200 };
      }
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
      } else {
        return { response: null, status: 200 };
      }
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
      const result = await knex.select(['id', 'mensagem', 'resposta', 'datacriado', 'datafechado', 'aceito'])
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

  async getWithoutSupervisor(sub) {
    try {
      const area = await knex.select('c.area')
        .from('curso AS c')
        .leftJoin('usuario AS u', 'u.idcurso', 'c.id')
        .where({ 'u.sub': sub });
      if (area.length === 0) return { response: "Usuario não tem area", status: 404 };
      const tickets = await knex.select('t.*', knex.raw('json_agg(d.*) as documentos'))
        .from('ticket AS t')
        .leftJoin('estagio AS e', 'e.id', 't.idestagio')
        .leftJoin('documento AS d', 'd.idticket', 't.id')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .where({'e.idorientador': null, 't.resposta': null, 'c.area': area[0].area})
        .orderBy('t.id', 'asc')
        .groupBy('t.id');
      if (tickets.length === 0) return { response: null, status: 404 };

      return { response: tickets, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao resgatar tickets', status: 404 };
    }
  }

  async getWithSupervisor(sub) {
    try {
      const id = await knex('usuario').select('id').where({ sub: sub });
      if (id.length === 0) return { response: "Usuario não tem area", status: 404 };
      const tickets = await knex.select('t.*', knex.raw('json_agg(d.*) as documentos'))
        .from('ticket AS t')
        .leftJoin('estagio AS e', 'e.id', 't.idestagio')
        .leftJoin('documento AS d', 'd.idticket', 't.id')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .where({ 'e.idorientador': id[0].id, 't.resposta': null })
        .orderBy('t.id', 'asc')
        .groupBy('t.id');
      if (tickets.length === 0) return { response: null, status: 404 };

      return { response: tickets, status: 200 };
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
      const result = await knex.select(['t.id', 't.mensagem', 't.resposta', 't.datacriado', 't.datafechado', 't.aceito'])
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

  async create(sub, mensagem, documentos) {
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
          idestagio: idEstagio[0].id, mensagem: mensagem, datacriado: criado,
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

  async deleteLatest(idTicket) {
    try {
      await knex.del().table('ticket').where({ id: idTicket });
      return { response: 'Ticket deletado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao deletar ticket', status: 404 };
    }
  }
}

module.exports = new Ticket();
