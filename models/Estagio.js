const knex = require("../database/connection");

class Estagio {
  async findAll() {
    try {
      var result = await knex.select('*').table("Processo_Estagio");
      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

module.exports = new Estagio();