/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const knex = require('../database/connection');
const Aws = require('./Aws');

class Document {
  async findAll() {
    try {
      const result = await knex.select('*').table('documento');
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar documentos', status: 400 };
    }
  }

  async newDocument(arquivo, tipo, eProfessor, idTicket) {
    const {
      nome, sigla, template,
    } = req.body;
    const data = {
      nome: nome,
      sigla: sigla,
      template: template,
    };
    const val = Validate(data);
    if (val !== true) return res.status(400).json(val);

    const document = await Document.newDocumentType(nome, sigla, template);
    res.status(document.status).json(document.response);
  }

  async newDocumentType(nome, sigla, template) {
    try {
      await knex.insert({
        nome, sigla, template,
      }).table('tipodocumento');
      return { response: 'Tipo de documento criado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao criar tipo de documento', status: 400 };
    }
  }

  async delete(file, sub) {
    try {
      const deletar = await Aws.deleteFile(file.substring(file.indexOf('.com/') + 5), sub);
      return { response: deletar.response, status: deletar.status };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao criar tipo de documento', status: 400 };
    }
  }
}

module.exports = new Document();
