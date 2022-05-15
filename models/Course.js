const knex = require("../database/connection");

class Course {
  async findAll() {
    try {
      var result = await knex.select('*').table("curso");
      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

module.exports = new Course();