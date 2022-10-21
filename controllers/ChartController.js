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
    
            const users = await Chart.getInternshipsAmountByStatus(sub);
            res.status(users.status).json(users.response);
        } catch (error) {
            res.status(500).json(error);
        }
    }
}

module.exports = new ChartController();
