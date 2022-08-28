/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const knex = require('../database/connection');

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
    try {
      await knex.insert({
        idTicket, arquivo, tipo, eProfessor,
      }).table('documento');
      return { response: 'Documento criado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao criar documentos', status: 400 };
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
}

module.exports = new Document();
