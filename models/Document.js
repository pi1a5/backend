const knex = require("../database/connection");

class Document {
  async findAll() {
    try {
      var result = await knex.select('*').table("documento");
      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async findByTicketId(id_ticket){
    try{
      var result = await knex.select(['id', 'arquivo', 'tipo']).table('documento').where({id_ticket: id_ticket})
      return result;
    } catch(error){
      console.log(error);
      return false;
    }

  }
}

module.exports = new Document();