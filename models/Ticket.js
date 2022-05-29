const knex = require("../database/connection");
const Aws = require("./Aws");

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

  async getAllbyUserId(sub) {
    try {
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
      var result = await knex.select(['t.id', 't.id_usuario_aluno', 't.corpo_texto', 't.data_criado', 't.data_fechado', 't.feedback', 't.id_processo_estagio', 't.id_usuario_orientador', 't.eAceito', 't.tipo_estagios', 'u.nome', 'u.email', 'u.foto', 'u.sub', 'u.idToken', 'pe.id_tipo_estagios', 'pe.situação']).from('ticket AS t').leftJoin('usuario AS u', 'u.id', 't.id_usuario_aluno').leftJoin('processo_estagio AS pe', 'pe.id', 't.id_processo_estagio').leftJoin('tipo_estagios AS te', 'te.id', 'pe.id_tipo_estagios').where({"t.id_usuario_aluno": id.id}).orderBy('t.id', 'desc');      
      if (result.length > 0) { // se retornar 1 ticket ou mais
        for (var i in result){
          result[i]['arquivos'] = await this.getPdfUrl(result[i].id)
        }
        return result;
      } else {
        return undefined;
      }

    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getJoinWithoutSupervisor(sub){
    try{
      var curso = await knex.select(['id_curso']).table('usuario').where({sub: sub}).first();
      console.log(curso);
      var result = await knex.select('t.id', 't.id_usuario_aluno', 't.corpo_texto', 't.data_criado', 't.data_fechado', 't.data_limite', 't.feedback', 't.id_processo_estagio', 't.id_usuario_orientador', 'u.id_curso', 'u.nome', 'u.email', 'u.foto', 'u.sub', 'u.idToken', 'pe.id_tipo_estagios', 'pe.situação', 'te.tipo', 'te.icon').from('ticket AS t').leftJoin('usuario AS u', 'u.id', 't.id_usuario_aluno').leftJoin('processo_estagio AS pe', 'pe.id', 't.id_processo_estagio').leftJoin('tipo_estagios AS te', 'te.id', 'pe.id_tipo_estagios').where({'t.feedback': null, 't.id_usuario_orientador': null, 'u.id_curso': curso.id_curso}).orderBy('t.data_limite', 'desc').groupBy('t.id', 'u.id', 'pe.id', 'te.id');
      for (var i in result){
        result[i]['arquivos'] = await this.getPdfUrl(result[i].id)
      }
      return result;
    } catch(error){
      console.log(error);
      return false;
    }
  }

  async getJoinWithSupervisorOpen(sub){
    try{
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
      var result = await knex.select('t.id', 't.id_usuario_aluno', 't.corpo_texto', 't.data_criado', 't.data_fechado', knex.raw('ARRAY_AGG(d.arquivo) AS arquivo'), knex.raw('ARRAY_AGG(d."eProfessor") AS professor'), 't.data_limite', 't.feedback', 't.id_processo_estagio', 't.id_usuario_orientador', 'u.id_curso', 'u.nome', 'u.email', 'u.foto', 'u.sub', 'u.idToken', 'pe.id_tipo_estagios', 'pe.situação', 'te.tipo', 'te.icon').from('ticket AS t').leftJoin('usuario AS u', 'u.id', 't.id_usuario_aluno').leftJoin('processo_estagio AS pe', 'pe.id', 't.id_processo_estagio').leftJoin('tipo_estagios AS te', 'te.id', 'pe.id_tipo_estagios').leftJoin('documento AS d', 'd.id_ticket', 't.id').where({"t.id_usuario_orientador": id.id, "t.feedback": null}).orderBy('t.data_limite', 'desc').groupBy('t.id', 'u.id', 'pe.id', 'te.id');
      return result;
    } catch(error){
      console.log(error);
      return false;
    }
  }

  async getJoinWithSupervisorClosed(sub){
    try{
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
      var result = await knex.select('t.id', 't.id_usuario_aluno', 't.corpo_texto', 't.data_criado', 't.data_fechado', knex.raw('ARRAY_AGG(d) AS arquivo'), knex.raw('ARRAY_AGG(d."eProfessor") AS professor'), 't.data_limite', 't.feedback', 't.id_processo_estagio', 't.id_usuario_orientador', 'u.id_curso', 'u.nome', 'u.email', 'u.foto', 'u.sub', 'u.idToken', 'pe.id_tipo_estagios', 'pe.situação', 'te.tipo', 'te.icon').from('ticket AS t').leftJoin('usuario AS u', 'u.id', 't.id_usuario_aluno').leftJoin('processo_estagio AS pe', 'pe.id', 't.id_processo_estagio').leftJoin('tipo_estagios AS te', 'te.id', 'pe.id_tipo_estagios').leftJoin('documento AS d', 'd.id_ticket', 't.id').where({"t.id_usuario_orientador": id.id}).whereNotNull("t.feedback").orderBy('t.data_fechado', 'desc').groupBy('t.id', 'u.id', 'pe.id', 'te.id');
      return result;
    } catch(error){
      console.log(error);
      return false;
    }
  }

  async getPdfUrl(id){
    try {
      console.log(id)
      var url = await knex.select('*').table('documento').where({'id_ticket': id})

      console.log(url)
      if(url){
        return url;
      } else{
        return false;
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
      if (tamanho > 0) { // se retornar 1 ticket ou mais
        if (tamanho == 1){ // se fora apenas um ticket
          if (result[0].feedback != null && result[0].eAceito == false){ // se o ticket foi recusado
            return true;
          } else{
            return false;
          }
        } else{ // se retornar mais do que um
          if(result[tamanho - 1].id_tipo_estagios == 0 && result[tamanho - 1].feedback != null && result[tamanho - 1].eAceito == false){ // se o ultimo ticket desse usuário for sobre início de estágio e for recusado
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
        var result = await knex.select(['t.id', 't.eAceito','pe.id_tipo_estagios', 't.feedback']).from('processo_estagio AS pe').leftJoin('ticket AS t', 't.id_processo_estagio', 'pe.id').where({'t.id_usuario_aluno': id.id}).orderBy('t.id', 'asc');
        var tamanho = result.length
        if (tamanho > 0){ // se retornar 1 ticket ou mais
          if (tamanho == 1){ // se for apenas 1 ticket
            if (result[0].eAceito == true){ // se o ticket (inicio) for aceito
              return true;
            } else{
              return false;
            }
          } else{ // se retornar mais de 1 ticket
            if (result[tamanho - 1].id_tipo_estagios == 0){ // se o utlimo ticket for do tipo inicio
              return false
            } else if(result[tamanho - 1].id_tipo_estagios == 1 && result[tamanho - 1].feedback != null){ // se o utlimo ticket for do tipo acompanhamento e tiver feedback
              return true
            } else{
              return false
            }
          }
        } else{
          return false
        }
      } catch(error){
        console.log(error);
        return false;
      }
    }

    async checkIfFim(sub){
      try{
        var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
        console.log(id)
        var result = await knex.select(['t.id', 't.eAceito','pe.id_tipo_estagios', 't.feedback']).from('processo_estagio AS pe').leftJoin('ticket AS t', 't.id_processo_estagio', 'pe.id').where({'t.id_usuario_aluno': id.id, 't.tipo_estagios': 'Acompanhamento'}).orderBy('t.id', 'asc');
        if (result){ // se retornar ticket de acompanhamento
          var tamanho = result.length;
          if(result[tamanho - 1].feedback != null && result[tamanho - 1].eAceito == true){ // se o ultimo ticket foi aceito
            return true
          } else{
            return false
          }
        } else{
          return false
        }
      } catch(error){
        console.log(error);
        return false;
      }
    }

    async checkFinalizou(sub){
      try {
        var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
        var situacao = await knex.select('situação').from('processo_estagio AS pe').leftJoin('ticket AS t', 't.id_processo_estagio', 'pe.id').where({'t.id_usuario_aluno': id.id}).first();
        console.log(situacao)
        if(situacao){
          if(situacao.situação){
            return true;
          } else{
            return false;
          } 
        }{
          return true;
        }
      } catch(error){
        console.log(error);
        return [];
      }
    }

  async createTicketInicio(corpo_texto, data_limite, sub, doc1, doc2, eProfessor){
    try{
      var data_criado = new Date().toISOString().split('T')[0];
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();

      var id_existe = await knex.select(['id_processo_estagio']).table('ticket').where({id_usuario_aluno: id.id})
      if(id_existe.length == 0){ // se usuario não tem processo
        var id_processo_estagio = await knex.returning('id AS id_processo_estagio').insert({id_tipo_estagios: 0, situação: true, data_criado: data_criado, data_fechado: null}).table('processo_estagio')
      } else{
        var id_processo_estagio = id_existe;
      }

      if (id_processo_estagio){
        if (await knex.insert({id_usuario_aluno: id.id, corpo_texto: corpo_texto, data_criado: data_criado, data_fechado: null, data_limite: data_limite, feedback: null, id_processo_estagio: id_processo_estagio[0].id_processo_estagio, id_usuario_orientador: null, tipo_estagios: 'Início de Estágio'}).table("ticket")){
          var id_ticket = await knex.select(['id']).table('ticket').where({feedback: null, id_usuario_aluno: id.id}).first()

          var key1 = await Aws.uploadFile(doc1, sub)
          var key2 = await Aws.uploadFile(doc2, sub)

          await knex.insert({ id_ticket: id_ticket.id, arquivo: key1, tipo: "TCE", eProfessor: eProfessor}).table("documento");
          await knex.insert({ id_ticket: id_ticket.id, arquivo: key2, tipo: "PA", eProfessor: eProfessor}).table("documento");
          return true;  
        }
      }
    } catch(error){
      console.log(error);
      return false;
    }
  }

  async createTicketAcompanhamento(corpo_texto, sub, doc, eProfessor, data_limite){
    try{
      var data_criado = new Date().toISOString().split('T')[0];
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();

      var id_processo_estagio = await knex.select('t.id_processo_estagio', 't.id_usuario_orientador').from('ticket AS t').leftJoin('processo_estagio AS pe', 'pe.id', 't.id_processo_estagio').whereNotNull('t.feedback')
      if (id_processo_estagio){
        if (await knex.insert({id_usuario_aluno: id.id, corpo_texto: corpo_texto, data_criado: data_criado, data_fechado: null, data_limite: data_limite, feedback: null, id_processo_estagio: id_processo_estagio[0].id_processo_estagio, id_usuario_orientador: id_processo_estagio[0].id_usuario_orientador, tipo_estagios: 'Acompanhamento'}).table("ticket")){
          var id_ticket = await knex.select(['id']).table('ticket').where({feedback: null, id_usuario_aluno: id.id}).first()

          console.log(doc)

          var key = await Aws.uploadFile(doc, sub)

          await knex.insert({ id_ticket: id_ticket.id, arquivo: key, tipo: "RAE", eProfessor: eProfessor}).table("documento");
          return true;  
        }
      }
    } catch(error){
      console.log(error);
      return false;
    }
  }

  async createTicketFim(corpo_texto, sub, doc, eProfessor, data_limite){
    try{
      var data_criado = new Date().toISOString().split('T')[0];
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();

      var id_processo_estagio = await knex.select('t.id_processo_estagio', 't.id_usuario_orientador').from('ticket AS t').leftJoin('processo_estagio AS pe', 'pe.id', 't.id_processo_estagio').whereNotNull('t.feedback')
      if (id_processo_estagio){
        if (await knex.insert({id_usuario_aluno: id.id, corpo_texto: corpo_texto, data_criado: data_criado, data_fechado: null, data_limite: data_limite, feedback: null, id_processo_estagio: id_processo_estagio[0].id_processo_estagio, id_usuario_orientador: id_processo_estagio[0].id_usuario_orientador, tipo_estagios: 'Finalização de Estágio'}).table("ticket")){
          var id_ticket = await knex.select(['id']).table('ticket').where({feedback: null, id_usuario_aluno: id.id}).first()
          
          var key = await Aws.uploadFile(doc, sub)

          await knex.insert({ id_ticket: id_ticket.id, arquivo: key, tipo: "TRE", eProfessor: eProfessor}).table("documento");
          return true;  
        }
      }
    } catch(error){
      console.log(error);
      return false;
    }
  }

  async updateFeedback(sub, id_ticket, feedback, eAceito){
    try{
      var data_fechado = new Date().toISOString().split('T')[0];
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
      if(eAceito == true){
        var id_tipo_estagios = await knex.select(['pe.id_tipo_estagios', 'pe.id','t.tipo_estagios']).from('processo_estagio AS pe').leftJoin('ticket AS t', 't.id_processo_estagio', 'pe.id').where({ 't.id': id_ticket}).first();
        if (id_tipo_estagios.id_tipo_estagios == 0){
          await knex.update({id_tipo_estagios: 1}).table('processo_estagio').where({id: id_tipo_estagios.id})
        } else if(id_tipo_estagios.id_tipo_estagios == 1){
          if(id_tipo_estagios.tipo_estagios == 'Finalização de Estágio'){
            await knex.update({id_tipo_estagios: 2, situação: false}).table('processo_estagio').where({id: id_tipo_estagios.id})
          }
        }
      }
      await knex.update({feedback: feedback, eAceito: eAceito, id_usuario_orientador: id.id, data_fechado: data_fechado}).table('ticket').where({id: id_ticket});
      return true;
    } catch(error){
      console.log(error);
      return [];
    }
  }
}

module.exports = new Ticket();



