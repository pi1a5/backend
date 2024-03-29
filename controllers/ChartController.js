/* eslint-disable linebreak-style */
/* eslint-disable object-shorthand */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
const Chart = require('../models/Chart');
const Validate = require('../modules/validate');

class ChartController {
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

      const users = await Chart.checkAmount(sub);
      res.status(users.status).json(users.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getInternshipsAmountByStatus(req, res) {
    try {
      const {
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const status = await Chart.getInternshipsAmountByStatus(sub);
      res.status(status.status).json(status.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getInternshipsAmountByMonth(req, res) {
    try {
      const {
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const status = await Chart.getInternshipsAmountByMonth(sub);
      res.status(status.status).json(status.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getUserTicketAmountAndTotalHours(req, res) {
    try {
      const {
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const status = await Chart.getUserTicketAmountAndTotalHours(sub);
      res.status(status.status).json(status.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getInternshipsAmountByCourse(req, res) {
    try {
      const {
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const status = await Chart.getInternshipsAmountByCourse(sub);
      res.status(status.status).json(status.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getTicketsStatusByDate(req, res) {
    try {
      const {
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const tickets = await Chart.getTicketsStatusByDate(sub);
      res.status(tickets.status).json(tickets.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getCourseAverageWorkedHours(req, res) {
    try {
      const {
        sub,
      } = req.body;
      const data = {
        sub: sub,
      };
      const val = Validate(data);
      if (val !== true) return res.status(400).json(val);

      const horas = await Chart.getCourseAverageWorkedHours(sub);
      res.status(horas.status).json(horas.response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new ChartController();
