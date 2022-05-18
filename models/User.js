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

  async saveIdCurso(id_curso, sub) {
    try {
      await knex.update({ id_curso: id_curso }).table("usuario").where({ sub: sub});
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
