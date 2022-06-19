/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const knex = require('../database/connection');

class Course {
  async findById(id) {
    try {
      const result = await knex.select(['sigla']).table('curso').where({ id });
      if (result.length > 0) {
        return result[0];
      }
      return undefined;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async findAll() {
    try {
      const result = await knex.select('*').table('curso');
      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

module.exports = new Course();
