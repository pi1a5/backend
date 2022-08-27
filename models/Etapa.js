/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable object-shorthand */
/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const knex = require('../database/connection');

class Etapa {
  async findAll() {
    try {
      const result = await knex.select('*').table('etapa');
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao procurar etapa', status: 400 };
    }
  }

  async findAllByIdProcesso(idProcesso) {
    try {
      const etapas = await knex.select('*')
        .table('etapa')
        .where({ idprocesso: idProcesso });
      if (etapas.length === 0) return { response: 'Etapas não encontradas', status: 404 };

      for (const i in etapas) {
        const documentos = this.findAllDocumentosByIdEtapa(etapas[i].id);
        if (documentos.status === 400) return { response: documentos.response, status: documentos.status };
        etapas[i].documentos = documentos;
      }

      return { response: etapas, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao procurar processo', status: 400 };
    }
  }

  async findAllDocumentosByIdEtapa(idEtapa) {
    try {
      const documentos = await knex.select('*')
        .table('tipodocumento')
        .where({ idetapa: idEtapa });

      return { response: documentos, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao procurar tipo de documentos', status: 400 };
    }
  }
}

module.exports = new Etapa();
