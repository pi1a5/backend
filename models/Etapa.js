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

  async update(sub, idetapa, etapa) {
    try {
      let idprocesso = 0;
      const nome = await knex.select('nome')
        .table('usuario')
        .where({ sub })
      if (nome.length === 0) return { response: 'Nome não encontrado', status: 404 };

      if ('nome' in etapa && 'prazo' in etapa) {
        idprocesso = await knex.returning('idprocesso').update({ nome: etapa.nome, prazo: etapa.prazo }).table('etapa').where({ id: idetapa });
      } else if ('nome' in etapa) {
        idprocesso = await knex.returning('idprocesso').update({ nome: etapa.nome }).table('etapa').where({ id: idetapa });
      } else if ('prazo' in etapa) {
        idprocesso = await knex.returning('idprocesso').update({ prazo: etapa.prazo }).table('etapa').where({ id: idetapa });
      }

      await knex.update({ 'modificador': nome[0].nome} )
        .table('processo')
        .where({ 'id': idprocesso[0].idprocesso });

      return { response: 'Etapa atualizada com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao atualizar etapa', status: 400 };
    }
  }
}

module.exports = new Etapa();
