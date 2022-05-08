const User = require('../models/User');

class UserController {

  async auth(req, res) {
    try {
      const { token } = req.body;

      if (token === '' || token === ' ' || token === undefined) {
        res.status(400).json('Token inválido')
        return
      }

      // Verifica se user existe no google
      const payload = await User.verifyToken(token);

      res.status(200).json(payload); // Retirar 

      // if (payload) {
      //   const { email } = payload;

      //   // Verifica se está cadastrado no banco de dados
      //   const user = await User.findByEmail(email);

      //   if (user) {
      //     // Usuário existe
      //     res.status(200).json(user);
      //   } else {
      //     // Salvar no BD
      //     const resp = await User.register(payload);
      //     if (resp) {
      //       // Usuário salvo e consultar usuário
      //       const user = await User.findByEmail(email);
      //       if (user) {
      //         // Usuário existe
      //         res.status(200).json(user);
      //       } else {
      //         res.status(404).json('Usuário não encontrado');
      //       }
      //     } else {
      //       res.status(500).json('Erro ao salvar no banco de dados');
      //     }
      //   }

      // } else {
      //   res.status(500).json(payload);
      // }

    } catch (error) {
      res.status(500).json(error);
    }
  }



}

module.exports = new UserController();