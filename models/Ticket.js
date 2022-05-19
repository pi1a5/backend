const knex = require("../database/connection");

class Ticket {
  async findAll() {
    try {
      var result = await knex.select('*').table("ticket");
      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async findAllbyUserId(sub) {
    try {
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
      var result = await knex.select(['id', 'id_usuario_aluno', 'corpo_texto', 'data_criado', 'data_fechado', 'data_limite','feedback', 'id_processo_estagio', 'id_usuario_orientador', 'eAceito']).table('ticket').where({ id_usuario_aluno: id.id });
      
      if (result.length > 0) {
        return result;
      } else {
        return undefined;
      }

    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async checkIfHasTicket(sub){
    try{
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
      var result = await knex.select(['feedback']).table('ticket').where({ id_usuario_aluno: id.id });
      if (result.length > 0) {
        for(var k in result){
          if (result[k].feedback == null){
            return false;
          }
        }
        return true;
      } else {
        return true;
      }
    } catch(error){
      console.log(error);
      return false;
    }
  }

  async checkIfinAcompanhamento(sub){
      try{
        var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
        var result = await knex.select(['feedback']).table('ticket').where({ id_usuario_aluno: id.id });
        if (result.length > 0) {
            for(var k in result){
                if (result[k].eAceito){
                  return true;
                }
            }
        } else {
            return false;
        }
      } catch(error){
        console.log(error);
        return false;
      }
  }

  async createTicket(corpo_texto, data_limite, sub){
    try{
      var data_criado = new Date().toISOString().split('T')[0];
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
      await knex.insert({id_usuario_aluno: id.id, corpo_texto: corpo_texto, data_criado: data_criado, data_fechado: null, data_limite: data_limite, feedback: null, id_processo_estagio: null, id_usuario_orientador: null}).table("ticket");
      return true;
    } catch(error){
      console.log(error);
      return false;
    }
  }
}

module.exports = new Ticket();