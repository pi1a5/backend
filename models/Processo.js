/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable object-shorthand */
/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const knex = require('../database/connection');

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

  async findAllByCourse(sub) {
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
        const etapas = this.getEtapas(processos[i].id);
      }
      const result = await knex.select('*').table('processo');
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao procurar processo', status: 400 };
    }
  }
}

module.exports = new Processo();
