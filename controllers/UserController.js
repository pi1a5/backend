/* eslint-disable object-shorthand */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
const User = require('../models/User');
const Validate = require('../modules/validate');

class UserController {
  async login(req, res) {
    try {
      const {
        idToken, sub,
      } = req.body;
      const data = {
        idTokenBack: idToken, subBack: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const response = await User.saveIdToken(idToken, sub);
      res.status(response.status).json(response.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async newUser(req, res) {
    try {
      const {
        name, email, picture, token, sub,
      } = req.body;
      const data = {
        nome: name, email: email, foto: picture, token: token, subBack: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const response = await User.register(name, email, picture, token, sub);

      res.status(response.status).json(response.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async setCourseProntuario(req, res) {
    try {
      const {
        idCurso, prontuario, sub,
      } = req.body;
      const data = {
        curso: idCurso, prontuario: prontuario, sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const response = await User.saveIdCursoProntuario(idCurso, prontuario, sub);
      res.status(response.status).json(response.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async user(req, res) {
    try {
      const {
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const user = await User.findBySub(sub);
      res.status(user.status).json(user.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async users(req, res) {
    try {
      const users = await User.findAll();
      res.status(users.status).json(users.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async checkOrientadoresAmount(req, res) {
    try {
      const {
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const users = await User.checkAmount(sub);
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new UserController();
