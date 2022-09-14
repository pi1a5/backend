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
  result = [];
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

      const processos = await knex.raw("SELECT json_agg( json_build_object( 'nome', p.nome, 'id', p.id, 'etapas', etapas ) ORDER BY p.id ASC) processos FROM processo p LEFT JOIN ( SELECT idprocesso, json_agg( json_build_object( 'id', e.id, 'nome', e.nome, 'prazo', e.prazo, 'documentos', etapatipodocumento ) ORDER BY e.id ASC) etapas FROM etapa e LEFT JOIN ( SELECT idetapa, json_agg( tipodocumento ) etapatipodocumento FROM etapa_tipodocumento et LEFT JOIN ( SELECT id, json_agg(td.*) tipodocumento FROM tipodocumento td group by id ) td on et.idtipodocumento = td.id group by idetapa ) et on e.id = et.idetapa group by idprocesso ) e on p.id = e.idprocesso WHERE p.idcurso = " + idCurso[0].idcurso + ";");
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
      const processoCriado = {};

      await knex.transaction(async function (t) {
        const idProcesso = await knex.returning('*').insert({
          idcurso: idCurso[0].idcurso, nome: processo.nome, criador: idCurso[0].nome, modificador: null,
        }).table('processo');
        if (idCurso.length === 0) return { response: 'Erro ao criar processo', status: 404 };
        processoCriado.processo = idProcesso[0];
        for (const k in processo.etapas) {
          etapas[k] = {
            nome: processo.etapas[k].nome, prazo: processo.etapas[k].prazo, idprocesso: idProcesso[0].id,
          };
        }

        const ids = await knex('etapa').returning('*').insert(etapas);
        processoCriado.processo.etapas = ids;
        let count = 0;
        for (const k in processo.etapas) {
          for (const b in processo.etapas[k].documentos) {
            documentos[count] = { idetapa: ids[k].id, idtipodocumento: processo.etapas[k].documentos[b].id };
            count += 1;
          }
        }

        const documento = await knex.returning('*').insert(documentos)
          .table('etapa_tipodocumento');
        for (const m in processoCriado.processo.etapas) {
          processoCriado.processo.etapas[m].documentos = [];
          for (const l in documento) {
            if (documento[l].idetapa === processoCriado.processo.etapas[m].id) {
              console.log(documento[l]);
              processoCriado.processo.etapas[m].documentos.push(documento[l]);
            }
          }
        }
        console.log(processoCriado)

        await t.commit;
      });

      return { response: processoCriado, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao criar processo', status: 400 };
    }
  }

  async update(sub, processoAntigo, processoNovo) {
    try {
      this.compareObjects(processoAntigo, processoNovo, 'processo');
      console.timeEnd("jorge");
      const content = this.result;
      this.result = [];

      // const resusult = [];

      // for (const i in content) { // para cada elemento atualizavel
      //   if (!resusult.some((item) => item.table === content[i].table)) { // caso tabela não esteja na lista
      //     resusult.push({ table: content[i].table, ids: [content[i].id], updates: [content[i].update] }); // add tabela na lista
      //   } else { // tabela já está na lista
      //     for (const j in resusult) { // procurando a tabela na lista
      //       if (resusult[j].table === content[i].table) { // achou a tabela na lista
      //         resusult[j].ids.push(content[i].id);
      //         resusult[j].updates.push(content[i].update);
      //       }
      //     }
      //   }
      // }

      // console.log('resultados');

      // for (const k in resusult) {
      //   console.log(resusult[k]);
      //   await knex(resusult[k].table).update(["nome", "prazo"], ["jorge", 10]).whereIn('id', resusult[k].ids);
      // }

      await knex.transaction(async (trx) => {
        content.map(async (tuple) => knex(tuple.table)
          .where('id', tuple.id)
          .update(tuple.update)
          .transacting(trx),
        );
        await trx.commit;
      });

      const docNovos = [];
      const docAntigos = [];

      for (const l in processoNovo.etapas) {
        for (const m in processoNovo.etapas[l].documentos){
          docNovos.push(processoNovo.etapas[l].documentos[m])
        }
        for (const n in processoAntigo.etapas[l].documentos){
          docAntigos.push(processoAntigo.etapas[l].documentos[n])
        }
      }

      if (JSON.stringify(docNovos) !== JSON.stringify(docAntigos)) { // caso tenha diferença nos documentos 
        const idEtapa = [];
        const idEtapaIdDocumento = [];
        for (const i in processoAntigo.etapas) {
          if (JSON.stringify(processoAntigo.etapas[i].documentos) !== JSON.stringify(processoNovo.etapas[i].documentos)) {
            idEtapa.push(processoAntigo.etapas[i].id)
          }
        }
        console.log(idEtapa);
        await knex('etapa_tipodocumento').del().whereIn('idetapa', idEtapa);
        for (const j in processoNovo.etapas) {
          if (!idEtapa.includes(processoNovo.etapas[j].id)) {
            continue;
          }
          for (const k in processoNovo.etapas[j].documentos){
            idEtapaIdDocumento.push({ idetapa: processoNovo.etapas[j].id, idtipodocumento: processoNovo.etapas[j].documentos[k].id})
          }
        }
        await knex('etapa_tipodocumento').insert(idEtapaIdDocumento);
      }

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
    console.time("jorge");
    for (const key in obj1) {
      if (typeof obj1[key] === 'object') {
        if (key === 'documentos') {
          continue;
        }
        if (!isNaN(key)) {
          this.compareObjects(obj1[key], obj2[key], mainKey);
        } else{
          this.compareObjects(obj1[key], obj2[key], key);
        }
      } else {
        if (key === 'id') {
          continue;
        }
        console.log(obj1[key], obj2[key]);
        if (obj1[key] !== obj2[key]) {
          if (mainKey === 'etapas') {
            this.result.push({ table: 'etapa', id: obj1.id, update: { [key]: obj2[key] } });
          } else {
            this.result.push({ table: mainKey, id: obj1.id, update: { [key]: obj2[key] } });
          }
        }
      }
    }
  }
}

module.exports = new Processo();
