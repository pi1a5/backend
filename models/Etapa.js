/* eslint-disable eqeqeq */
/* eslint-disable arrow-parens */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable object-shorthand */
/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const knex = require('../database/connection');

class Etapa {
  async findAll() {
    try {
      const result = await knex.select('*').table('etapa');
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao procurar etapa', status: 400 };
    }
  }
}

module.exports = new Etapa();
