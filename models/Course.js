/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const knex = require('../database/connection');

class Course {
  result = [];
  remover = [];
  adicionar = [];
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
      const modalidades = await knex.select('m.id', 'm.nome', knex.raw('json_agg(c.*) as curso'))
        .from('modalidade AS m')
        .leftJoin('curso AS c', 'c.idmodalidade', 'm.id')
        .groupBy('m.id')
        .orderBy('m.nome');

      return { response: modalidades, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar cursos', status: 400 };
    }
  }

  async getAreasWithCourses() {
    try {
      const response = {};
      response['areas'] = await knex.select('a.nome', 'a.id', knex.raw("json_agg(c.*) as curso"))
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
        for (const i in area.curso) {
          cursosnovos[i] = { nome: area.curso[i].nome, carga: area.curso[i].carga, idmodalidade: area.curso[i].modalidade.id, idarea: areacriada[0].id }
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

  async update(areaantiga, areanova) {
    try {
      for (const i in areanova.curso) {
        if (areanova.curso[i].hasOwnProperty('modalidade')) {
          console.log("aa")
          console.log(areanova.curso[i].modalidade)
          console.log(areanova.curso[i].idmodalidade)
          delete areanova.curso[i].modalidade;
        }
      }
      this.compareObjects(areaantiga, areanova, 'area');
      const content = this.result;
      const removeContent = this.remover;
      const addContent = this.adicionar;
      this.remover = [];
      this.result = [];
      this.adicionar = [];

      await knex.transaction(async (trx) => {
        if (content.length !== 0 ) {
          content.map(async (tuple) => knex(tuple.table)
            .where('id', tuple.id)
            .update(tuple.update)
            .transacting(trx),
          );
        }
        if (removeContent.length !== 0) {
          await knex('curso').del().whereIn('id', removeContent)
        }
        if (addContent.length !== 0) {
          
          await knex('curso').insert(addContent);
        }
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

  async compareObjects(oldObject, newObject, table) {
    for (const key in oldObject) {
      if (typeof oldObject[key] === 'object') { // se for nested
        this.compareNestedObjects(oldObject, newObject, table, key);
      } else {
        this.compareNormalObjects(oldObject, newObject, table, key)
      }
    }
  }

  async compareNestedObjects(oldObject, newObject, table, key) {
    if (!isNaN(key)) { // se for array
      if (key === '0') { // caso seja primeiro element do array
        if (JSON.stringify(oldObject) === JSON.stringify(newObject)){ // caso não tenha diferença
          return;
        } else { // caso sejam diferentes
          for (const index in oldObject) { // para cada elemento no objeto antigo
            if (newObject.filter((item) => item.id === oldObject[index].id).length !== 0) { // checar se ele ainda existe no novo
              if (JSON.stringify(newObject).indexOf(JSON.stringify(oldObject[index])) !== -1) { // se existir, ver se tem diferença
                continue;
              } else{
                let indexOf = newObject.map(object => object.id).indexOf(oldObject[index].id)
                this.compareObjects(oldObject[index], newObject[indexOf], table);
              }
            } else{
              // this.remover.push({ id: oldObject[index].id, table: table})
              console.log('aaa')
              this.remover.push(oldObject[index].id)
            }
          }
          for (const index2 in newObject) { // para cada elemento no objeto novo
            if (oldObject.filter((item) => item.id === newObject[index2].id).length === 0) { // checar se existe algum novo
              delete newObject[index2]['id']
              this.adicionar.push(newObject[index2])
            } else {
              continue;
            }
          }
        }
      } else {
        return; ''
      }
    } else{ // se não for array
      this.compareObjects(oldObject[key], newObject[key], key);
    }
  }

  async compareNormalObjects(oldObject, newObject, table, key) {
    console.log(newObject);
    console.log(oldObject);
    if (!newObject.hasOwnProperty(key)) { // se a nova 
      return;
    }
    if (key === 'id') {
      return;
    }
    if (oldObject[key] !== newObject[key]) {
      this.result.push({ table: table, id: oldObject.id, update: { [key]: newObject[key] } });
    }
  }
}

module.exports = new Course();
