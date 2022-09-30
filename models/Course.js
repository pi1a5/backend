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

  async getAreasWithCourses() {
    try {
      const response = await knex.select('a.nome', 'a.id', knex.raw("json_agg(c.*) as cursos"))
        .from('area AS a')
        .leftJoin('curso AS c', 'c.idarea', 'a.id')
        .groupBy('a.nome', 'a.id')


      return { response: response, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao resgatar cursos', status: 400 };
    }
  }

  async createArea(nome) {
    try {
      await knex('area').insert({ nome: nome });

      return { response: "Área criada com sucesso", status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao criar área', status: 400 };
    }
  }

  async deleteArea(idarea) {
    try {
      await knex('area').del().where({ id: idarea });

      return { response: "Área deletada com sucesso", status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao deletar área', status: 400 };
    }
  }

  async editArea(idarea, nome) {
    try {
      await knex('area').update({ nome: nome }).where({ id: idarea });

      return { response: "Área editada com sucesso", status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao editar área', status: 400 };
    }
  }
}

module.exports = new Course();
