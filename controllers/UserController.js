/* eslint-disable linebreak-style */
/* eslint-disable object-shorthand */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
const User = require('../models/User');
const Validate = require('../modules/validate');

class UserController {
  async login(req, res) {
    try {
      const {
        name, email, picture, token, sub,
      } = req.body;
      const data = {
        nome: name, email: email, foto: picture, token: token, sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const response = await User.login(name, email, picture, token, sub);
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

      const result = await User.saveIdCursoProntuario(idCurso, prontuario, sub);
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async updateName(req, res) {
    try {
      const {
        sub, nome,
      } = req.body;
      const data = {
        sub: sub,
        nome: nome,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const result = await User.updateName(sub, nome);
      res.status(result.status).json(result.response);
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

  async getUserProfile(req, res) {
    try {
      const {
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const users = await User.getUserProfile(sub);
      res.status(users.status).json(users.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getUserSupervisor(req, res) {
    try {
      const {
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const users = await User.getUserSupervisor(sub);
      res.status(users.status).json(users.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getUserInternshipData(req, res) {
    try {
      const {
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const users = await User.getUserInternshipData(sub);
      res.status(users.status).json(users.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getSupervisorsByArea(req, res) {
    try {
      const {
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const users = await User.getSupervisorsByArea(sub);
      res.status(users.status).json(users.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getSupervisors(req, res) {
    try {
      const users = await User.getSupervisors();
      res.status(users.status).json(users.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async deleteSupervisor(req, res) {
    try {
      const {
        id,
      } = req.body;
      const data = {
        id: id,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const users = await User.deleteSupervisor(id);
      res.status(users.status).json(users.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getStatus(req, res) {
    try {
      const {
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const users = await User.getStatus(sub);
      res.status(users.status).json(users.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async teste(req, res) {
    try {
      const response = await User.teste();
      res.status(response.status).json(response.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async createRandomStudent(req, res) {
    try {
      const response = await User.createRandomStudent();
      res.status(response.status).json(response.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async createRandomSupervisorForStudent(req, res) {
    try {
      const {
        id,
      } = req.body;
      const data = {
        id: id,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const response = await User.createRandomSupervisorForStudent(id);
      res.status(response.status).json(response.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async createTicketForRandomStudent(req, res) {
    try {
      const {
        id,
      } = req.body;
      const data = {
        id: id,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const response = await User.createTicketForRandomStudent(id);
      res.status(response.status).json(response.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async delayStudentTicket(req, res) {
    try {
      const {
        id,
      } = req.body;
      const data = {
        id: id,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const response = await User.delayStudentTicket(id);
      res.status(response.status).json(response.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async populateCoursesWithStudentsAndSupervisors(req, res) {
    try {
      const response = await User.populateCoursesWithStudentsAndSupervisors();
      res.status(response.status).json(response.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getFakeStudents(req, res) {
    try {
      const response = await User.getFakeStudents();
      res.status(response.status).json(response.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new UserController();
