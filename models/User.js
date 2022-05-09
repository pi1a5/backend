const knex = require("../database/connection");

class User {

  async register(name, email, picture) {
    try {
      // Exemplo dos campos
      //await knex.insert({ id_curso: 0, nome: name, email: email, foto: picture, sub: '0' }).table("usuario");
      await knex.insert({ nome: name, email: email, foto: picture, sub: '0' }).table("usuario");
    } catch (error) {
      console.log(error);
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

  async findAll() {
    try {
      var result = await knex.select('*').table("usuario");
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