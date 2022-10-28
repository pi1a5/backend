/* eslint-disable linebreak-style */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
// eslint-disable-next-line linebreak-style
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
