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

  async update(sub, processoAntigo, processoNovo) {
    try {
      const content = this.compareObjects(processoAntigo, processoNovo, 'processo');

      await knex.transaction(async (trx) => {
        content.map(async (tuple) => knex(tuple.table)
          .where('id', tuple.id)
          .update(tuple.update)
          .transacting(trx),
        );
        await trx.commit;
      });

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

  async compareObjects(obj1, obj2, mainKey) {
    const result = [{}];

    for (const key in obj1) {
      if (typeof obj1[key] === 'object') {
        this.compareObjects(obj1[key], obj2[key], key);
      } else {
        console.log(obj1[key], obj2[key]);
        result.push({ table: mainKey, id: obj1['id'], [key]: obj2[key] });
        console.log(result);
      }

    // const result = obj1.map((x) => {
    //   console.log(x);
    // });
    }
  }
}

module.exports = new Processo();
