const User = require('../models/User');

class UserController {

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
        const resp = await User.register(name, email, picture);
        if (resp) {
          // Usuário existe
          res.status(200).json(resp);
        } else {
          res.status(500).json('Erro ao salvar no banco de dados');
        }
      }

    } catch (error) {
      res.status(500).json(error);
    }
  }



}

module.exports = new UserController();