const knex = require("../database/connection");

class Course {
  async findById(id){
    try{
      var result = await knex.select(['sigla']).table("curso").where({ id: id });
      if (result.length > 0) {
        return result[0];
      } else {
        return undefined;
      }
    } catch(error){
      console.log(error);
      return false;
    }
  }

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