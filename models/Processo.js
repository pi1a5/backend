/* eslint-disable linebreak-style */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-continue */
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
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const knex = require('../database/connection');

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

  async findAllByArea(sub) { // para visualização na hora de selecionar um processo
    try {
      const result = {};
      const idArea = await knex.select('c.idarea', 'u.email')
        .from('curso AS c')
        .leftJoin('usuario AS u', 'u.idcurso', 'c.id')
        .where({ 'u.sub': sub });
      if (idArea.length === 0) return { response: 'Curso do usuário não encontrado', status: 404 };

      const processos = await knex.raw("SELECT json_agg( json_build_object('nome', p.nome, 'modificador', p.modificador, 'id', p.id, 'etapas', etapas) ORDER BY p.id ASC ) processos FROM processo p LEFT JOIN ( SELECT idprocesso, json_agg( json_build_object( 'id', e.id, 'loop', e.loop, 'nome', e.nome, 'prazo', e.prazo, 'documentos', etapatipodocumento ) ORDER BY e.id ASC ) etapas FROM etapa e LEFT JOIN ( SELECT idetapa, json_agg(tipodocumento) etapatipodocumento FROM etapa_tipodocumento et LEFT JOIN ( SELECT td.id, json_build_object( 'id', td.id, 'nome', td.nome, 'template', td.template, 'sigla', td.sigla ) tipodocumento FROM tipodocumento td group by td.id ) td on et.idtipodocumento = td.id group by idetapa ) et on e.id = et.idetapa group by idprocesso ) e on p.id = e.idprocesso LEFT JOIN curso c on c.id = p.idcurso WHERE c.idarea =" + idArea[0].idarea);
      result.processos = processos.rows[0].processos;

      if (idArea[0].email.includes('@aluno.ifsp') !== true) {
        const tiposDocumento = await knex.select('*')
          .table('tipodocumento')
          .orderBy('nome');
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
      const idCurso = await knex.select('idcurso', 'nome', 'email')
        .table('usuario')
        .where({ sub: sub });
      if (idCurso.length === 0) return { response: 'Curso do usuário não encontrado', status: 404 };
      const processoCriado = {};

      await knex.transaction(async function (t) {
        const idProcesso = await knex.returning('*').insert({
          idcurso: idCurso[0].idcurso, nome: processo.nome, criador: idCurso[0].nome, modificador: idCurso[0].email,
        }).table('processo');
        if (idCurso.length === 0) return { response: 'Erro ao criar processo', status: 404 };
        processoCriado.processo = idProcesso[0];
        for (const k in processo.etapas) {
          etapas[k] = {
            nome: processo.etapas[k].nome, prazo: processo.etapas[k].prazo, idprocesso: idProcesso[0].id, loop: processo.etapas[k].loop,
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
              documento[l].id = documento[l].idtipodocumento;
              processoCriado.processo.etapas[m].documentos.push(documento[l]);
            }
          }
        }

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
      const content = this.result;
      this.result = [];

      await knex.transaction(async (trx) => {
        content.map(async (tuple) => knex(tuple.table)
          .where('id', tuple.id)
          .update(tuple.update)
          .transacting(trx));
        await trx.commit;
      });

      const docNovos = [];
      const docAntigos = [];

      for (const l in processoNovo.etapas) {
        for (const m in processoNovo.etapas[l].documentos) {
          docNovos.push(processoNovo.etapas[l].documentos[m]);
        }
        for (const n in processoAntigo.etapas[l].documentos) {
          docAntigos.push(processoAntigo.etapas[l].documentos[n]);
        }
      }

      if (JSON.stringify(docNovos) !== JSON.stringify(docAntigos)) { // caso tenha diferença nos documentos
        const idEtapa = [];
        const idEtapaIdDocumento = [];
        for (const i in processoAntigo.etapas) {
          if (JSON.stringify(processoAntigo.etapas[i].documentos) !== JSON.stringify(processoNovo.etapas[i].documentos)) {
            idEtapa.push(processoAntigo.etapas[i].id);
          }
        }
        console.log(idEtapa);
        await knex('etapa_tipodocumento').del().whereIn('idetapa', idEtapa);
        for (const j in processoNovo.etapas) {
          if (!idEtapa.includes(processoNovo.etapas[j].id)) {
            continue;
          }
          for (const k in processoNovo.etapas[j].documentos) {
            idEtapaIdDocumento.push({ idetapa: processoNovo.etapas[j].id, idtipodocumento: processoNovo.etapas[j].documentos[k].id });
          }
        }
        await knex('etapa_tipodocumento').insert(idEtapaIdDocumento);
      }
      const nomeModificador = await knex('usuario').select('email')
        .where({ sub: sub })
      await knex('processo').update({ modificador: nomeModificador[0].email })
        .where({ id: processoAntigo.id });

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

  async getAllBySupervisor(sub) {
    try {
      const idorientador = await knex('usuario').select('id')
        .where({ sub: sub });
      const estagios = await knex.raw("SELECT json_agg( json_build_object( 'id', e.id, 'perfil', e.obrigatorio, 'idaluno', e.idaluno, 'idorientador', e.idorientador, 'criado', TO_CHAR(e.criado, 'DD/MM/YYYY'), 'fechado', TO_CHAR(e.fechado, 'DD/MM/YYYY'), 'cargahoraria', e.cargahoraria, 'processo', e.processo -> 'nome', 'tickets', tickets, 'aluno', aluno, 'status', statusEstagio ) ORDER BY e.id ASC ) processos FROM estagio e LEFT JOIN ( SELECT idestagio, json_agg( json_build_object( 'id', t.id, 'idestagio', t.idestagio, 'mensagem', t.mensagem, 'resposta', t.resposta, 'diastrabalhados', t.diastrabalhados, 'horasadicionadas', t.horasadicionadas, 'datacriado', TO_CHAR(t.datacriado, 'DD/MM/YYYY'), 'datafechado', TO_CHAR(t.datafechado, 'DD/MM/YYYY'), 'aceito', t.aceito, 'etapa', json_build_object( 'nome', t.etapa -> 'etapa' -> 'nome', 'etapa', json_build_object('loop', t.etapa -> 'etapa' -> 'loop') ), 'envolvidos', t.envolvidos, 'documentos', documentos ) ORDER BY t.id ASC ) tickets FROM ticket t LEFT JOIN ( SELECT idticket, json_agg( json_build_object('arquivo', d.arquivo, 'nome', d.nome) ORDER BY d.nome ASC ) documentos FROM documento d GROUP BY idticket ) d on t.id = d.idticket GROUP BY idestagio ) t on e.id = t.idestagio LEFT JOIN ( SELECT ua.id, json_build_object( 'nome', ua.nome, 'email', ua.email, 'foto', ua.foto, 'sub', ua.sub, 'prontuario', ua.prontuario, 'cargatotal', ua.cargatotal, 'curso', curso ) aluno FROM usuario ua LEFT JOIN ( SELECT c.id, json_build_object('nome', c.nome, 'carga', c.carga) curso FROM curso c ) c on ua.idcurso = c.id ) ua on e.idaluno = ua.id LEFT JOIN ( SELECT s.id, json_build_object( 'nome', s.nome ) statusEstagio FROM status s ) s on e.idstatus = s.id WHERE e.idorientador = " + idorientador[0].id + ';');
      if (estagios.rows === 0) return { response: null, status: 200 };

      return { response: estagios.rows[0], status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao pegar processos por supervisor', status: 400 };
    }
  }

  async compareObjects(obj1, obj2, mainKey) {
    for (const key in obj1) {
      if (typeof obj1[key] === 'object') {
        if (key === 'documentos') {
          continue;
        }
        if (!isNaN(key)) {
          this.compareObjects(obj1[key], obj2[key], mainKey);
        } else {
          this.compareObjects(obj1[key], obj2[key], key);
        }
      } else {
        if (!obj2.hasOwnProperty(key)) {
          continue;
        }
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
