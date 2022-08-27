/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const knex = require('../database/connection');

class Document {
  async findAll() {
    try {
      const result = await knex.select('*').table('documento');
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar documentos', status: 200 };
    }
  }

  async newDocument(arquivo, tipo, eProfessor, idTicket) {
    try {
      await knex.insert({
        idTicket, arquivo, tipo, eProfessor,
      }).table('documento');
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

module.exports = new Document();
