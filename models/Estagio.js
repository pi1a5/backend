/* eslint-disable no-await-in-loop */
/* eslint-disable semi */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable object-shorthand */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const knex = require('../database/connection');
const Ticket = require('./Ticket');

class Estagio {
  async findAll() {
    try {
      const result = await knex.select('*').table('estagio');
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao procurar estágios', status: 400 };
    }
  }

  async limpar() {
    try {
      await knex.del().table('estagio');
      return { response: 'Estágios deletados com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao limpar estágios', status: 400 };
    }
  }

  async checkIfHas(sub) {
    try {
      const result = await knex.select('e.processo')
        .from('estagio AS e')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .where({ 'u.sub': sub })

      if (result.length === 0) {
        return { response: null, status: 200 };
      } else {
        return { response: result[0].processo, status: 200 };
      }
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao procurar estágio', status: 400 };
    }
  }

  async newEstagio(idProcesso, sub, cargaHoraria) {
    try {
      const dataCriado = new Date();
      const id = await knex.select(['id'])
        .table('usuario')
        .where({ sub });
      if (id.length === 0) return { response: 'Usuário não encontrado', status: 404 };

      const processo = await knex.raw("SELECT json_agg( json_build_object( 'nome', p.nome, 'id', p.id, 'etapas', etapas ) ORDER BY p.id ASC) processos FROM processo p LEFT JOIN ( SELECT idprocesso, json_agg( json_build_object( 'id', e.id, 'nome', e.nome, 'loop', e.loop, 'prazo', e.prazo, 'documentos', etapatipodocumento ) ORDER BY e.id ASC) etapas FROM etapa e LEFT JOIN ( SELECT idetapa, json_agg( tipodocumento ) etapatipodocumento FROM etapa_tipodocumento et LEFT JOIN ( SELECT id, json_agg(td.*) tipodocumento FROM tipodocumento td group by id ) td on et.idtipodocumento = td.id group by idetapa ) et on e.id = et.idetapa group by idprocesso ) e on p.id = e.idprocesso WHERE p.id = " + idProcesso + ";");
      for (const i in processo.rows[0].processos[0].etapas) {
        if (i == 0) {
          processo.rows[0].processos[0].etapas[i]["atual"] = true
        } else{
          processo.rows[0].processos[0].etapas[i]["atual"] = false;
        }
      }
      
      let etapaUnica = false;
      if (processo.rows[0].processos[0].etapas.length === 1) {
        etapaUnica = true;
      }

      await knex.insert({ idaluno: id[0].id, criado: dataCriado, processo: processo.rows[0].processos[0], cargahoraria: cargaHoraria, idstatus: 1 , etapaunica: etapaUnica}).table('estagio');

      return { response: 'Estágio Criado com Sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao criar estágio', status: 400 };
    }
  }

  async ended(sub) {
    try {
      const result = await knex.select('e.fechado')
        .from('estagio AS e')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .where({ 'u.sub': sub })
        .where({ 'idstatus': 2 });
      if (result.length === 0) return { response: null, status: 200 };
      return { response: result[0].fechado, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao checar se estágio foi finalizado', status: 400 };
    }
  }

  async transfer(idestagio, idorientador) {
    try {
      await knex('estagio').update({ idorientador: idorientador })
        .where({ id: idestagio })
      
      return { response: 'Estágio transferido com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encerrar estágio', status: 400 };
    }
  }
}

module.exports = new Estagio();
