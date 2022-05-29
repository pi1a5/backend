const knex = require("../database/connection");

class User {

  async saveIdToken(idToken) {
    try {
      await knex.update({ idToken: idToken }).table("usuario");
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async saveIdCursoProntuario(id_curso, prontuario, sub) {
    try {
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
      var all_prontuario = await knex.select("prontuario").table("usuario").whereNot({id: id.id})
      var prontuario = await knex.update({ id_curso: id_curso, prontuario: prontuario }).table("usuario").where({ sub: sub});
      
      var result = all_prontuario.filter(p => p.prontuario != prontuario.prontuario)

      console.log(result)
      // for (var i in all_prontuario){
      //   if (all_prontuario[i].prontuario == prontuario.prontuario){
      //     console.log
      //     return false
      //   }
      // }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async register(name, email, picture, idToken, sub) {
    try {
      await knex.insert({ id_curso: null, nome: name, email: email, foto: picture, idToken: idToken, sub: sub }).table("usuario");
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async findByEmail(email) {
    try {
      var result = await knex.select(['email', 'nome', 'foto']).table("usuario").where({ email: email });

      if (result.length > 0) {
        return result[0];
      } else {
        return undefined;
      }
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async findBySub(sub) {
    try {
      var result = await knex.select(['email', 'nome', 'foto']).table("usuario").where({ sub: sub });

      if (result.length > 0) {
        return result[0];
      } else {
        return undefined;
      }

    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async findByToken(idToken) {
    try {
      var result = await knex.select(['email', 'nome', 'foto']).table("usuario").where({ idToken: idToken });

      if (result.length > 0) {
        return result[0];
      } else {
        return undefined;
      }

    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async findAll() {
    try {
      var result = await knex.select('*').table("usuario").orderBy('id', 'asc');
      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async checkAmount(sub) {
    try {
      var id = await knex.select(['id']).table('usuario').where({ sub: sub }).first();
      var id_curso = await knex.select(['id_curso']).table('usuario').where({ sub: sub }).first();
      var colegas = await knex.distinct().select('id', 'nome').table('usuario').whereNot('email', 'like', '%@aluno.ifsp.edu.br%').where({'id_curso': id_curso.id_curso})
      for (var k in colegas){
        var data = await knex.distinct().select('id_usuario_aluno').table('ticket').where({'id_usuario_orientador': colegas[k].id})
        if(data.length > 0){
          var count = 0;
          for (var y in data){
            var processo = await knex.select('pe.situação').from('processo_estagio AS pe').leftJoin('ticket AS t', 't.id_processo_estagio', 'pe.id').where({'t.id_usuario_aluno': data[y].id_usuario_aluno})
            if(processo[0].situação != false){
              count += 1
            }
          }
          colegas[k].quantidade = count;
        } else{
          count = 0;
          colegas[k].quantidade = count;
        }

      }
      return colegas.sort(function(a, b) {
        return parseFloat(b.quantidade) - parseFloat(a.quantidade);
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }


  // async findById(id) {
  //   try {
  //     var result = await knex.select(['id', 'email', 'name', 'role']).table("users").where({ id: id });

  //     if (result.length > 0) {
  //       return result[0];
  //     } else {
  //       return undefined;
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     return undefined;
  //   }
  // }

  // async findEmail(email) {
  //   try {
  //     var result = await knex.select("*").from("users").where({ email: email });
  //     if (result.length > 0) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     return false;
  //   }
  // }

}

module.exports = new User();
