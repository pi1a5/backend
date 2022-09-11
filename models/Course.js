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
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar cursos', status: 400 };
    }
  }

  async newCourse(nome, descricao, imagem, area, tipo) {
    try {
      await knex.insert({
        nome, descricao, imagem, area, tipo,
      }).table('curso');
      return { response: 'Curso criado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao criar curso', status: 400 };
    }
  }
}

module.exports = new Course();
