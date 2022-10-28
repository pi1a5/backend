/* eslint-disable linebreak-style */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
class SessionController {
  async googleOauthHandler(req, res) {
    const code = req.query.code;
  }
}

module.exports = new SessionController();
