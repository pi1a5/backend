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
      const idCurso = await knex.select('idcurso')
        .table('usuario')
        .where({ sub: sub });
      if (idCurso.length === 0) return { response: 'Curso do usuário não encontrado', status: 404 };

      const processos = await knex.select('*')
        .table('processo')
        .where({ idCurso: idCurso[0].idcurso });
      if (processos.length === 0) return { response: 'Curso não contém processos', status: 404 };

      for (const i in processos) {
        const etapas = Etapa.findAllByIdProcesso(processos[i].id); // adicionar as etapas ao json
        if (etapas.status === 400) return { response: etapas.response, status: etapas.status };
        processos[i].etapas = etapas.response;
      }

      return { response: processos, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao procurar processos', status: 400 };
    }
  }

  async newProcesso(sub, processo) {
    try {
      const idCurso = await knex.select('idcurso', 'nome')
        .table('usuario')
        .where({ sub: sub });
      if (idCurso.length === 0) return { response: 'Curso do usuário não encontrado', status: 404 };

      const idProcesso = await knex.returning('id').insert({
        idcurso: idCurso[0].idcurso, nome: processo.nome, criador: idCurso[0].nome, modificador: null,
      }).table('processo');
      if (idCurso.length === 0) return { response: 'Erro ao criar processo', status: 404 };

      for (const i in processo.etapas) {
        const idEtapa = await knex.returning('id').insert({
          idprocesso: idProcesso[0].id, nome: processo.etapas[i].nome, prazo: processo.etapas[i].prazo, ultima: processo.etapas[i].ultima,
        }).table('etapa');
        if (idEtapa.length === 0) return { response: 'Erro ao criar Etapa', status: 404 };

        for (const j in processo.etapas[i].documentos) {
          await knex.insert({
            idetapa: idEtapa[0].id, idtipodocumento: processo.etapas[i].documentos[j],
          });
        }
      }

      return { response: 'Processo criado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao criar processo', status: 400 };
    }
  }
}

module.exports = new Processo();
