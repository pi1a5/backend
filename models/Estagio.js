/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const knex = require('../database/connection');

class Estagio {
  async findAll() {
    try {
      const result = await knex.select('*').table('estagio');
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao procurar estágio', status: 400 };
    }
  }

  async limpar() {
    try {
      await knex('documento').del();
      await knex('ticket').del();
      await knex('processo').del();
      return { response: 'Banco limpo!', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao limpar banco', status: 400 };
    }
  }
}

module.exports = new Estagio();
