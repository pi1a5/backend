const { OAuth2Client } = require('google-auth-library');
const knex = require("../database/connection");

class User {

  users = []

  async register(name, email, picture) {
    try {
      // Exemplo dos campos
      //await knex.insert({ email, curso: 'ADS', name, picture }).table("users");
      this.users.push({name, email, picture});
      console.log(this.users)
      return {name, email, picture};
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async findByEmail(email) {
    try {
      // Exemplo dos campos
      //var result = await knex.select(['id', 'email', 'curso', 'name', 'picture']).table("users").where({ email: email });
      const result = this.users.filter(u => u.email === email)

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

  users() {
    return this.users;
  }

}

module.exports = new User();