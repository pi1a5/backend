/* eslint-disable class-methods-use-this */
const User = require('../models/User');

class UserController {
  async index(req, res) {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async login(req, res) {
    try {
      const { idToken, sub } = req.body;

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return;
      }

      if (idToken === '' || idToken === ' ' || idToken === undefined) {
        res.status(400).json('Token inválido ');
        return;
      }

      // Verifica se está cadastrado no banco de dados
      const user = await User.findBySub(sub);

      if (user) {
        // Salva id token gerado na autenticação
        if (await User.saveIdToken(idToken, sub)) {
          res.status(200).json(user);
        } else {
          res.status(500).json('Erro ao salvar id token');
        }
      } else {
        res.status(404).json('Usuário não encontrado');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async newUser(req, res) {
    try {
      const {
        name, email, picture, idToken, sub,
      } = req.body;

      if (name === '' || name === ' ' || name === undefined) {
        res.status(400).json('Nome inválido');
        return;
      }

      if (email === '' || email === ' ' || email === undefined) {
        res.status(400).json('Email inválido');
        return;
      }

      if (picture === '' || picture === ' ' || picture === undefined) {
        res.status(400).json('Imagem inválida');
        return;
      }

      if (idToken === '' || idToken === ' ' || idToken === undefined) {
        res.status(400).json('Token inválido');
        return;
      }

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return;
      }

      // Salvar no BD
      if (await User.register(name, email, picture, idToken, sub)) {
        res.status(200).json('Usuário cadastrado');
      } else {
        res.status(500).json('Não foi possível cadastrar');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async setCourseProntuario(req, res) {
    try {
      const { idCurso, prontuario, sub } = req.body;

      if (idCurso === '' || idCurso === ' ' || idCurso === undefined) {
        res.status(400).json('Id inválido');
        return;
      }

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return;
      }

      if (prontuario === '' || prontuario === ' ' || prontuario === undefined) {
        res.status(400).json('prontuario inválido');
        return;
      }

      const user = await User.findBySub(sub);

      if (user) {
        if (await User.checarProntuario(prontuario, sub)) {
          if (await User.saveIdCursoProntuario(idCurso, prontuario, sub)) {
            res.status(200).json(user);
          } else {
            res.status(500).json('Erro ao salvar id curso');
          }
        } else {
          res.status(500).json('Prontuário já existente.');
        }
      } else {
        res.status(404).json('Usuário não encontrado');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async user(req, res) {
    try {
      const { sub } = req.body;
      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido');
        return;
      }

      const user = await User.findBySub(sub);

      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json('Usuário não encontrado');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async users(req, res) {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async checkOrientadoresAmount(req, res) {
    try {
      const { sub } = req.body;
      const users = await User.checkAmount(sub);
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new UserController();
