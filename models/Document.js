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
}

module.exports = new Document();