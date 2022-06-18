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

  async findByTicketId(id_ticket) {
    try {
      const result = await knex.select(['id', 'arquivo', 'tipo']).table('documento').where({ id_ticket });
      return result;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async newDocument(arquivo, tipo, eProfessor, id_ticket) {
    try {
      await knex.insert({
        id_ticket, arquivo, tipo, eProfessor,
      }).table('documento');
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

module.exports = new Document();
