/* eslint-disable linebreak-style */
/* eslint-disable class-methods-use-this */
class HomeController {
  async index(req, res) {
    res.send('Conectou-se com a API');
  }
}

module.exports = new HomeController();
