/* eslint-disable no-await-in-loop */
/* eslint-disable semi */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable object-shorthand */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const knex = require('../database/connection');

class Estagio {
  async findAll() {
    try {
      const result = await knex.select('*').table('estagio');
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao procurar estágio', status: 400 };
    }
  }

  async limpar() {
    try {
      await knex('documento').del();
      await knex('ticket').del();
      await knex('processo').del();
      return { response: 'Banco limpo!', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao limpar banco', status: 400 };
    }
  }

  async newEstagio(idProcesso, sub) {
    try {
      const dataCriado = new Date();
      const processo = {};
      const id = await knex.select(['id'])
        .table('usuario')
        .where({ sub });
      if (id.length === 0) return { response: 'Usuário não encontrado', status: 404 };

      const processoNome = await knex.select('nome')
        .table('processo')
        .where({ id: idProcesso });
      if (processoNome.length === 0) return { response: 'Processo não encontrado', status: 404 };

      processo.nome = processoNome[0].nome;

      const processoEtapas = await knex.select('*')
        .table('etapa')
        .where({ idprocesso: idProcesso });
      if (processoEtapas.length === 0) return { response: 'Processo não encontrado', status: 404 };
      processo.etapas = processoEtapas;
      processo.etapas[0].atual = true;

      for (const i in processoEtapas) {
        const idEtapa = processoEtapas[i].id;
        const processoDocumentos = await knex.select('td.nome', 'td.sigla', 'td.template')
          .from('etapa AS e')
          .leftJoin('etapa_tipodocumento AS et', 'et.idetapa', 'e.id')
          .leftJoin('tipodocumento AS td', 'td.id', 'et.idtipodocumento')
          .where({ 'e.id': idEtapa });
        processo.etapas[i].documentos = processoDocumentos;
      }

      console.log(typeof processo);

      await knex.insert({ idaluno: id[0].id, criado: dataCriado, processo: processo }).table('estagio');

      return { response: 'Estágio Criado com Sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao criar estágio', status: 400 };
    }
  }
}

module.exports = new Estagio();
