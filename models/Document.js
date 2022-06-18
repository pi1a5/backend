/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const knex = require('../database/connection');

class Document {
  async findAll() {
    try {
      const result = await knex.select('*').table('documento');
      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async findByTicketId(idTicket) {
    try {
      const result = await knex.select(['id', 'arquivo', 'tipo']).table('documento').where({ idTicket });
      return result;
    } catch (error) {
      console.log(error);
      return false;
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
