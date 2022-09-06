/* eslint-disable eqeqeq */
/* eslint-disable arrow-parens */
/* eslint-disable no-await-in-loop */
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

  async update(sub, idEtapa, etapa) {
    try {
      const etapaAtual = await knex.select('nome', 'prazo', 'idprocesso')
        .table('etapa')
        .where({ id: idEtapa });
      if (etapaAtual.length === 0) return { response: 'Etapa não encontrada', status: 404 };
      const nome = await knex.select('nome')
        .table('usuario')
        .where({ sub });
      if (nome.length === 0) return { response: 'Nome não encontrado', status: 404 };

      if (etapaAtual[0].nome !== etapa.nome) {
        await knex.update({ nome: etapa.nome })
          .table('etapa')
          .where({ id: idEtapa });
      }
      if (etapaAtual[0].prazo !== etapa.prazo) {
        await knex.update({ prazo: etapa.prazo })
          .table('etapa')
          .where({ id: idEtapa });
      }

      const documentos = await knex.select('idtipodocumento')
        .table('etapa_tipodocumento')
        .where({ idetapa: idEtapa });
      if (documentos.length === 0) return { response: 'Documentos não encontrados', status: 404 };

      for (const j in documentos) {
        if (!etapa.documentos.some(item => item.id === documentos[j].idtipodocumento)) {
          await knex.del()
            .table('etapa_tipodocumento')
            .where({ idetapa: idEtapa, idtipodocumento: documentos[j].idtipodocumento });
        }
      }

      for (const i in etapa.documentos) {
        if (!documentos.some(item => item.idtipodocumento === etapa.documentos[i].id)) {
          await knex.insert({ idetapa: idEtapa, idtipodocumento: etapa.documentos[i].id })
            .table('etapa_tipodocumento')
            .where({ idetapa: idEtapa, idtipodocumento: etapa.documentos[i].id });
        }
      }

      await knex.update({ modificador: nome[0].nome })
        .table('processo')
        .where({ id: etapaAtual[0].idprocesso });

      return { response: 'Etapa atualizada com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao atualizar etapa', status: 400 };
    }
  }
}

module.exports = new Etapa();
