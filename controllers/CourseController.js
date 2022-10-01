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
        area, 
      } = req.body;
      const data = {
        area: area,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const course = await Course.createArea(area);
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


  async createCourse(req, res) {
    try {
      const {
        nome, cargatotal, idmodalidade,
      } = req.body;
      const data = {
        nome: nome,
        cargatotal: cargatotal,
        idmodalidade: idmodalidade
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const course = await Course.create(nome, cargatotal, idmodalidade);
      res.status(course.status).json(course.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async deleteCourse(req, res) {
    try {
      const {
        idcurso, 
      } = req.body;
      const data = {
        idcurso: idcurso,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const course = await Course.delete(idcurso);
      res.status(course.status).json(course.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async editArea(req, res) {
    try {
      const {
        areaantiga, areanova,
      } = req.body;
      const data = {
        areaantiga: areaantiga,
        areanova: areanova,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const course = await Course.edit(areaantiga, areanova);
      res.status(course.status).json(course.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getModalities(req, res) {
    try {
      const modalities = await Course.modalities();
      res.status(modalities.status).json(modalities.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new CouserController();
