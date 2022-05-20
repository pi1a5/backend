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
      var result = await knex.select('*').from('ticket AS t').leftJoin('usuario AS u', 'u.id', 't.id_usuario_aluno').where({"t.id_usuario_aluno": id.id})
      
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
        var result = await knex.select(['eAceito']).table('ticket').where({ id_usuario_aluno: id.id });
        console.log(result);
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

  async createTicketInicio(corpo_texto, data_limite, sub, doc1, doc2, eProfessor){
    try{
      var data_criado = new Date().toISOString().split('T')[0];
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();

      var id_processo_estagio = await knex.returning('id').insert({id_tipo_estagios: 0, situação: null, data_criado: data_criado, data_fechado: null}).table('processo_estagio')
      console.log(id_processo_estagio);
      if (id_processo_estagio){
        if (await knex.insert({id_usuario_aluno: id.id, corpo_texto: corpo_texto, data_criado: data_criado, data_fechado: null, data_limite: data_limite, feedback: null, id_processo_estagio: id_processo.id, id_usuario_orientador: null}).table("ticket")){
          var id_ticket = await knex.select(['id']).table('ticket').where({feedback: null, id_usuario_aluno: id.id}).first()
          console.log(id_ticket)
          await knex.insert({ id_ticket: id_ticket.id, arquivo: doc1, tipo: "TCE", eProfessor: eProfessor}).table("documento");
          await knex.insert({ id_ticket: id_ticket.id, arquivo: doc2, tipo: "PA", eProfessor: eProfessor}).table("documento");
          return true;  
        }
      }
    } catch(error){
      console.log(error);
      return false;
    }
  }

  async getJoinWithoutSupervisor(){
    try{
      var result = await knex.select('*').from('ticket AS t').leftJoin('usuario AS u', 'u.id', 't.id_usuario_aluno').where({'t.feedback': null})
      return result;
    } catch(error){
      console.log(error);
      return false;
    }
  }

  async getJoinWithSupervisorOpen(sub){
    try{
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
      var result = await knex.select('*').from('ticket AS t').leftJoin('usuario AS u', 'u.id', 't.id_usuario_aluno').where({"t.id_usuario_aluno": id.id, "t.feedback": null})
      return result;
    } catch(error){
      console.log(error);
      return false;
    }
  }

  async getJoinWithSupervisorClosed(sub){
    try{
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
      var result = await knex.select('*').from('ticket AS t').leftJoin('usuario AS u', 'u.id', 't.id_usuario_aluno').where({"t.id_usuario_aluno": id.id}).whereNotNull("t.feedback")
      return result;
    } catch(error){
      console.log(error);
      return false;
    }
  }
}

module.exports = new Ticket();