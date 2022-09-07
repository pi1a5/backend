/* eslint-disable consistent-return */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
/* eslint-disable prefer-template */
/* eslint-disable dot-notation */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable object-shorthand */
/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const knex = require('../database/connection');
const Etapa = require('./Etapa');

class Processo {
  async findAll() {
    try {
      const result = await knex.select('*').table('processo');
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao procurar processo', status: 400 };
    }
  }

  async findAllByCourse(sub) { // para visualização na hora de selecionar um processo
    try {
      const result = {};
      const idCurso = await knex.select('idcurso', 'email')
        .table('usuario')
        .where({ sub: sub });
      if (idCurso.length === 0) return { response: 'Curso do usuário não encontrado', status: 404 };

      const processos = await knex.raw("SELECT json_agg( json_build_object( 'nome', p.nome, 'id', p.id, 'etapas', etapas ) ) processos FROM processo p LEFT JOIN ( SELECT idprocesso, json_agg( json_build_object( 'id', e.id, 'nome', e.nome, 'prazo', e.prazo, 'documentos', etapatipodocumento ) ) etapas FROM etapa e LEFT JOIN ( SELECT idetapa, json_agg( tipodocumento ) etapatipodocumento FROM etapa_tipodocumento et LEFT JOIN ( SELECT id, json_agg(td.*) tipodocumento FROM tipodocumento td group by id ) td on et.idtipodocumento = td.id group by idetapa ) et on e.id = et.idetapa group by idprocesso ) e on p.id = e.idprocesso WHERE p.idcurso = " + idCurso[0].idcurso + ";");
      if (processos.rows.length === 0) return { response: 'Curso não contém processos', status: 200 };
      console.log(processos.rows[0].processos[0].etapas[0]);
      result.processos = processos.rows[0].processos;

      if (idCurso[0].email.includes('@aluno.ifsp') !== true) {
        const tiposDocumento = await knex.select('*')
          .table('tipodocumento');
        result.documentos = tiposDocumento;
      }

      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao procurar processos', status: 500 };
    }
  }

  async newProcesso(sub, processo) {
    try {
      const etapas = [{}];
      const documentos = [{}];
      const idCurso = await knex.select('idcurso', 'nome')
        .table('usuario')
        .where({ sub: sub });
      if (idCurso.length === 0) return { response: 'Curso do usuário não encontrado', status: 404 };

      await knex.transaction(async function (t) {
        const idProcesso = await knex.returning('id').insert({
          idcurso: idCurso[0].idcurso, nome: processo.nome, criador: idCurso[0].nome, modificador: null,
        }).table('processo');
        if (idCurso.length === 0) return { response: 'Erro ao criar processo', status: 404 };

        for (const k in processo.etapas) {
          etapas[k] = {
            nome: processo.etapas[k].nome, prazo: processo.etapas[k].prazo, idprocesso: idProcesso[0].id,
          };
        }

        const ids = await knex('etapa').returning('id').insert(etapas);
        let count = 0;
        for (const k in processo.etapas) {
          for (const b in processo.etapas[k].documentos) {
            documentos[count] = { idetapa: ids[k].id, idtipodocumento: processo.etapas[k].documentos[b].id };
            count += 1;
          }
        }

        await knex.insert(documentos)
          .table('etapa_tipodocumento');
        await t.commit;
      });

      return { response: 'Processo criado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao criar processo', status: 400 };
    }
  }

  async update(sub, processo) {
    try {
      await knex.update({ nome: processo.nome }).table('processo').where({ id: processo.id }); 

      for (const i in processo.etapas) {
        delete processo.etapas[i]['nome'];
        delete processo.etapas[i]
      }e

      await knex.update()


      const etapaAtual = await knex.select('nome', 'prazo', 'idprocesso')
        .table('etapa')
        .where({ id: idEtapa });
      if (etapaAtual.length === 0) return { response: 'Etapa não encontrada', status: 404 };
      const nome = await knex.select('nome')
        .table('usuario')
        .where({ sub });
      if (nome.length === 0) return { response: 'Nome não encontrado', status: 404 };

      if (etapaAtual[0].nome !== etapa.nome) {
        await knex.update({ nome: etapa.nome })
          .table('etapa')
          .where({ id: idEtapa });
      }
      if (etapaAtual[0].prazo !== etapa.prazo) {
        await knex.update({ prazo: etapa.prazo })
          .table('etapa')
          .where({ id: idEtapa });
      }

      const documentos = await knex.select('idtipodocumento')
        .table('etapa_tipodocumento')
        .where({ idetapa: idEtapa });
      if (documentos.length === 0) return { response: 'Documentos não encontrados', status: 404 };

      for (const j in documentos) {
        if (!etapa.documentos.some(item => item.id === documentos[j].idtipodocumento)) {
          await knex.del()
            .table('etapa_tipodocumento')
            .where({ idetapa: idEtapa, idtipodocumento: documentos[j].idtipodocumento });
        }
      }

      for (const i in etapa.documentos) {
        if (!documentos.some(item => item.idtipodocumento === etapa.documentos[i].id)) {
          await knex.insert({ idetapa: idEtapa, idtipodocumento: etapa.documentos[i].id })
            .table('etapa_tipodocumento')
            .where({ idetapa: idEtapa, idtipodocumento: etapa.documentos[i].id });
        }
      }

      await knex.update({ modificador: nome[0].nome })
        .table('processo')
        .where({ id: etapaAtual[0].idprocesso });

      return { response: 'Etapa atualizada com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao atualizar etapa', status: 400 };
    }
  }

  async delete(idprocesso) {
    try {
      await knex.del().table('processo').where({ id: idprocesso });

      return { response: 'Processo deletado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao deletar processo', status: 400 };
    }
  }

  async limpar() {
    try {
      await knex('processo').del();
      return { response: 'Banco limpo!', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao limpar banco', status: 400 };
    }
  }

  async test(documentos) {
    try {
      await knex.insert(documentos)
        .table('documento');
      return { response: 'inserido com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao limpar banco', status: 400 };
    }
  }
}

module.exports = new Processo();
