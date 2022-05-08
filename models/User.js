const { OAuth2Client } = require('google-auth-library');
const knex = require("../database/connection");

class User {

  client = new OAuth2Client('961754812465-2ovtm0ao3pdnrnk9letc5d8g5arifl9v.apps.googleusercontent.com');

  async verifyToken(token) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,
      });

      const { name, email, picture } = ticket.getPayload();

      return { name, email, picture };

    } catch (error) {
      console.log(error)
      return undefined;
    }
  }

  async register(name, email, picture) {
    try {
      // Exemplo dos campos
      await knex.insert({ email, curso: 'ADS', name, picture }).table("users");
      return 'Usuário cadastrado';
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async findByEmail(email) {
    try {
      // Exemplo dos campos
      var result = await knex.select(['id', 'email', 'curso', 'name', 'picture']).table("users").where({ email: email });

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

}

module.exports = new User();