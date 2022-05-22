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
      var result = await knex.select('*', 't.id').from('ticket AS t').leftJoin('usuario AS u', 'u.id', 't.id_usuario_aluno').where({"t.id_usuario_aluno": id.id}).orderBy('t.id', 'asc');
      
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

  async checkIfHasStarted(sub){
    try{
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
      var result = await knex.select(['t.id','t.feedback', 't.eAceito', 'pe.id_tipo_estagios']).from('ticket AS t').leftJoin('processo_estagio as pe', 'pe.id', 't.id_processo_estagio').where({ 't.id_usuario_aluno': id.id }).orderBy('id', 'asc');
      var tamanho = result.length;
      if (tamanho > 0) {
        if (tamanho == 1){
          if (result[0].feedback != null && result[0].eAceito == false){
            return true;
          } else{
            return false;
          }
        } else{
          console.log(result[tamanho - 1].id_tipo_estagios, result[tamanho - 1].feedback, result[tamanho - 1].eAceito)
          if(result[tamanho - 1].id_tipo_estagios = 0 && result[tamanho - 1].feedback != null && result[tamanho - 1].eAceito == false){ // false n funfa?
            return true;
          } else {
            return false;
          }
        }
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
        console.log(id)
        var result = await knex.select(['t.id', 't.eAceito','pe.id_tipo_estagios']).from('processo_estagio AS pe').leftJoin('ticket AS t', 't.id_processo_estagio', 'pe.id').where({'t.id_usuario_aluno': id.id}).orderBy('t.id', 'asc');
        console.log(result)
        var tamanho = result.length
        console.log("a")
        console.log(tamanho)
        if (tamanho > 0){
          console.log("a")
          if (tamanho == 1){
            console.log("a")
            if (result[0].eAceito == true){
              return true;
            } else{
              return false;
            }
          }
        } else{
          if (result[tamanho - 1].id_tipo_estagios == 0){
            return false
          } else{
            if (result[tamanho - 1].eAceito == true){
              return true
            } else{
              return false
            }
          }
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

      console.log(id)

      var id_existe = await knex.select(['id_processo_estagio']).table('ticket').where({id_usuario_aluno: id.id})
      console.log(id_existe)
      if(id_existe.length == 0){
        var id_processo_estagio = await knex.returning('id AS id_processo_estagio').insert({id_tipo_estagios: 0, situação: null, data_criado: data_criado, data_fechado: null}).table('processo_estagio')
      } else{
        var id_processo_estagio = id_existe;
      }

      if (id_processo_estagio){
        if (await knex.insert({id_usuario_aluno: id.id, corpo_texto: corpo_texto, data_criado: data_criado, data_fechado: null, data_limite: data_limite, feedback: null, id_processo_estagio: id_processo_estagio[0].id_processo_estagio, id_usuario_orientador: null}).table("ticket")){
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

  async createTicketAcompanhamento(corpo_texto, sub, doc, eProfessor){
    try{
      var data_criado = new Date().toISOString().split('T')[0];
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();

      var id_processo_estagio = await knex.select('t.id_processo_estagio', 't.id_usuario_orientador').from('ticket AS t').leftJoin('processo_estagio AS pe', 'pe.id', 't.id_processo_estagio').whereNotNull('t.feedback')
      if (id_processo_estagio){
        if (await knex.insert({id_usuario_aluno: id.id, corpo_texto: corpo_texto, data_criado: data_criado, data_fechado: null, data_limite: null, feedback: null, id_processo_estagio: id_processo_estagio[0].id_processo_estagio, id_usuario_orientador: id_processo_estagio[0].id_usuario_orientador}).table("ticket")){
          var id_ticket = await knex.select(['id']).table('ticket').where({feedback: null, id_usuario_aluno: id.id}).first()
          console.log(id_ticket)
          await knex.insert({ id_ticket: id_ticket.id, arquivo: doc, tipo: "PAE", eProfessor: eProfessor}).table("documento");
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
      var result = await knex.select('*', 't.id').from('ticket AS t').leftJoin('usuario AS u', 'u.id', 't.id_usuario_aluno').where({'t.feedback': null}).orderBy('t.data_limite', 'asc');
      return result;
    } catch(error){
      console.log(error);
      return false;
    }
  }

  async getJoinWithSupervisorOpen(sub){
    try{
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
      var result = await knex.select('*', 't.id').from('ticket AS t').leftJoin('usuario AS u', 'u.id', 't.id_usuario_aluno').where({"t.id_usuario_orientador": id.id, "t.feedback": null}).orderBy('t.id', 'asc');
      return result;
    } catch(error){
      console.log(error);
      return false;
    }
  }

  async getJoinWithSupervisorClosed(sub){
    try{
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
      var result = await knex.select('*', 't.id').from('ticket AS t').leftJoin('usuario AS u', 'u.id', 't.id_usuario_aluno').where({"t.id_usuario_orientador": id.id}).whereNotNull("t.feedback").orderBy('t.data_fechado', 'asc');
      return result;
    } catch(error){
      console.log(error);
      return false;
    }
  }

  async updateFeedback(sub, id_ticket, feedback, eAceito){
    try{
      var data_fechado = new Date().toISOString().split('T')[0];
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
      await knex.update({feedback: feedback, eAceito: eAceito, id_usuario_orientador: id.id, data_fechado: data_fechado}).table('ticket').where({id: id_ticket});
      return true;
    } catch(error){
      console.log(error);
      return [];
    }
  }
}

module.exports = new Ticket();