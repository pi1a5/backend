const User = require('../models/User');

class UserController {

  async index(req, res) {
    try {
      var users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async login(req, res) {
    try {
      const { idToken } = req.body;

      if (idToken === '' || idToken === ' ' || idToken === undefined) {
        res.status(400).json('Token inválido')
        return
      }

      // Verifica se está cadastrado no banco de dados
      const user = await User.findByToken(idToken);

      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json('Usuário não encontrado');
      }

    } catch (error) {
      res.status(500).json(error);
    }
  }

  async newUser(req, res) {
    try {
      const { name, email, picture, idToken, sub } = req.body;

      if (name === '' || name === ' ' || name === undefined) {
        res.status(400).json('Nome inválido')
        return
      }

      if (email === '' || email === ' ' || email === undefined) {
        res.status(400).json('Email inválido')
        return
      }

      if (picture === '' || picture === ' ' || picture === undefined) {
        res.status(400).json('Imagem inválida')
        return
      }

      if (idToken === '' || idToken === ' ' || idToken === undefined) {
        res.status(400).json('Token inválido')
        return
      }

      if (sub === '' || sub === ' ' || sub === undefined) {
        res.status(400).json('Sub inválido')
        return
      }

      // Salvar no BD
      const resp = await User.register(name, email, picture, idToken, sub);

      if (resp === 'ok') {
        res.status(201).json('Usuário cadastrado');
      } else {
        res.status(500).json('Não foi possível cadastrar');
      }

    } catch (error) {
      res.status(500).json(error);
    }
  }

  async user(req, res) {
    try {
      const { email } = req.body;

      if (email === '' || email === ' ' || email === undefined) {
        res.status(400).json('Email inválido')
        return
      }

      var user = await User.findByEmail(email);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async users(req, res) {
    try {
      var users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async test(req, res) {
    try {
      await User.test();
      res.status(200).json('Curso criado');
    } catch (error) {
      res.status(500).json(error);
    }
  }

}

module.exports = new UserController();