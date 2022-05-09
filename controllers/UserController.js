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

  async newUser(req, res) {
    try {
      const { name, email, picture } = req.body;

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

      // Verifica se está cadastrado no banco de dados
      const user = await User.findByEmail(email);

      if (user) {
        // Usuário existe
        res.status(200).json(user);
      } else {
        // Salvar no BD
        await User.register(name, email, picture);
        const user = await User.findByEmail(email);
        res.status(201).json(user);
      }

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