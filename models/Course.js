/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const knex = require('../database/connection');

class Course {
  result = [];
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

  async getAreasWithCourses() {
    try {
      const response = {};
      response['areas'] = await knex.select('a.nome', 'a.id', knex.raw("json_agg(c.*) as cursos"))
        .from('area AS a')
        .leftJoin('curso AS c', 'c.idarea', 'a.id')
        .groupBy('a.nome', 'a.id')

      response['modalidades'] = await knex('modalidade').select('*');

      return { response: response, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao resgatar cursos', status: 400 };
    }
  }

  async createArea(area) {
    try {
      const areanova = {};
      const cursosnovos = [{}];
      
      await knex.transaction(async function (t) {
        const areacriada = await knex('area').returning('id').insert({ nome: area.nome });
        areanova.area = areacriada[0];
        for (const i in area.cursos) {
          cursosnovos[i] = { nome: area.cursos[i].nome, carga: area.cursos[i].cargaHoraria, idmodalidade: area.cursos[i].modalidade.id, idarea: areacriada[0].id }
        }
        const cursos = await knex('curso').returning('*').insert(cursosnovos);
        areanova.area.cursos = cursos;
        await t.commit;
      });
      return { response: areanova, status: 200 };
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


  async create(nome, cargatotal, idmodalidade) {
    try {
      await knex('area').insert({ nome: nome, cargatotal: cargatotal, idmodalidade: idmodalidade});

      return { response: "Curso criado com sucesso", status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao criar curso', status: 400 };
    }
  }

  async delete(idcurso) {
    try {
      await knex('curso').del().where({ id: idcurso });
      
      return { response: "Curso deletada com sucesso", status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao deletar curso', status: 400 };
    }
  }

  async edit(areaantiga, areanova) {
    try {
      this.compareObjects(areaantiga, areanova, 'area');
      const content = this.result;
      this.result = [];

      console.log(content);

      await knex.transaction(async (trx) => {
        content.map(async (tuple) => knex(tuple.table)
          .where('id', tuple.id)
          .update(tuple.update)
          .transacting(trx),
        );
        await trx.commit;
      });

      return { response: "Curso atualizado com sucesso", status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao atualizar curso', status: 400 };
    }
  }

  async modalities() {
    try {
      const modalidades = await knex('modalidade').select('*');
      
      return { response: modalidades, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao deletar curso', status: 400 };
    }
  }

  async compareObjects(obj1, obj2, mainKey) {
    for (const key in obj1) {
      if (typeof obj1[key] === 'object') {
        if (key === 'documentos') {
          continue;
        }
        if (!isNaN(key)) {
          this.compareObjects(obj1[key], obj2[key], mainKey);
        } else{
          this.compareObjects(obj1[key], obj2[key], key);
        }
      } else {
        if (!obj2.hasOwnProperty(key)) {
          continue;
        }
        if (key === 'id') {
          continue;
        }
        console.log(obj1[key], obj2[key]);
        if (obj1[key] !== obj2[key]) {
          if (mainKey === 'etapas') {
            this.result.push({ table: 'etapa', id: obj1.id, update: { [key]: obj2[key] } });
          } else {
            this.result.push({ table: mainKey, id: obj1.id, update: { [key]: obj2[key] } });
          }
        }
      }
    }
  }
}

module.exports = new Course();
