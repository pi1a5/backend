const knex = require("../database/connection");

class Ticket {
  async findAll() {
    try {
      var result = await knex.select('*').table("ticket");
      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async checkIfHasTicket(sub){
    try{
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
      var result = await knex.select(['feedback']).table('ticket').where({ id_usuario_aluno: id.id });
      if (result.length > 0) {
        return result;
      } else {
        return undefined;
      }
    } catch(error){
      console.log(error);
      return false;
    }
  }
}

module.exports = new Ticket();