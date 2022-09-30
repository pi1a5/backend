/* eslint-disable object-shorthand */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
const Course = require('../models/Course');
const Validate = require('../modules/validate');

class CouserController {
  async courses(req, res) {
    try {
      const course = await Course.findAll();
      res.status(course.status).json(course.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async createNewCourse(req, res) {
    try {
      const {
        nome, descricao, imagem, area, tipo,
      } = req.body;
      const data = {
        nome: nome,
        descricao: descricao,
        imagem: imagem,
        area: area,
        tipo: tipo,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const course = await Course.newCourse(nome, descricao, imagem, area, tipo);
      res.status(course.status).json(course.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getAreasWithCourses(req, res) {
    try {
      const course = await Course.getAreasWithCourses();
      res.status(course.status).json(course.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async createArea(req, res) {
    try {
      const {
        nome, 
      } = req.body;
      const data = {
        nome: nome,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const course = await Course.createArea(nome);
      res.status(course.status).json(course.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async deleteArea(req, res) {
    try {
      const {
        idarea, 
      } = req.body;
      const data = {
        idarea: idarea,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const course = await Course.deleteArea(idarea);
      res.status(course.status).json(course.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async editArea(req, res) {
    try {
      const {
        idarea, nome 
      } = req.body;
      const data = {
        idarea: idarea,
        nome: nome,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const course = await Course.editArea(idarea, nome);
      res.status(course.status).json(course.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new CouserController();
