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

  async update(areaantiga, areanova) {
    try {
      this.compareObjects(areaantiga, areanova, 'area');
      const content = this.result;
      const removeContent = this.remover;
      const addContent = this.adicionar;
      this.remover = [];
      this.result = [];
      this.adicionar = [];

      console.log(content)
      console.log(removeContent)
      console.log(addContent)

      await knex.transaction(async (trx) => {
        content.map(async (tuple) => knex(tuple.table)
          .where('id', tuple.id)
          .update(tuple.update)
          .transacting(trx),
        );
        await trx.commit;
      });

      await knex.transaction(async (trx) => {
        removeContent.map(async (tuple) => knex(tuple.table)
          .where('id', tuple.id)
          .del()
          .transacting(trx),
        );
        await trx.commit;
      });
      console.log('asddas')

      await knex.transaction(async (trx) => {
        addContent.map(async (tuple) => knex('curso')
          .insert({ nome: tuple.nome, carga: tuple.carga, idarea: tuple.idarea, idmodalidade: tuple.idmodalidade})
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

  async compareObjects(obj1, obj2, mainKey) { // obj1 = antiga obj2 = nova
    for (const key in obj1) {
      if (typeof obj1[key] === 'object') { // se for nested
        if (key === 'documentos') { 
          continue;
        }
        if (!isNaN(key)) { // se for array
          if (key === '0') { // caso seja primeiro element do array
            if (JSON.stringify(obj1) === JSON.stringify(obj2)){ // caso não tenha diferença
              continue;
            } else { // caso sejam diferentes
              for (const index in obj1) { // para cada elemento no objeto antigo
                if (obj2.filter((item) => item.id === obj1[index].id).length !== 0) { // checar se ele ainda existe no novo
                  if (JSON.stringify(obj2).indexOf(JSON.stringify(obj1[index])) !== -1) { // se existir, ver se tem diferença
                    continue;
                  } else{
                    let indexOf = obj2.map(object => object.id).indexOf(obj1[index].id)
                    this.compareObjects(obj1[index], obj2[indexOf], mainKey);
                  }
                } else{
                  this.remover.push({ id: obj1[index].id, table: mainKey})
                }
              }
              for (const index2 in obj2) { // para cada elemento no objeto novo
                if (obj1.filter((item) => item.id === obj2[index2].id).length === 0) { // checar se existe algum novo
                  console.log(obj2[index2])
                  delete obj2[index2]['id']
                  console.log(obj2[index2])
                  this.adicionar.push(obj2[index2])
                } else {
                  continue;
                }
              }
            }
          }
        } else{ // se não for array
          this.compareObjects(obj1[key], obj2[key], key);
        }
      } else {
        if (!obj2.hasOwnProperty(key)) { // se a nova 
          continue;
        }
        if (key === 'id') {
          continue;
        }
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
