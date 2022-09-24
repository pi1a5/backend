/* eslint-disable linebreak-style */
/* eslint-disable prefer-destructuring */
/* eslint-disable object-shorthand */
/* eslint-disable prefer-const */
/* eslint-disable no-await-in-loop */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const knex = require('../database/connection');

class User {
  async register(name, email, picture, token, sub) {
    try {
      await knex.insert({
        idcurso: null, nome: name, email, foto: picture, token, sub,
      }).table('usuario');
      return { response: 'Usuário cadastrado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao cadastrar usuário', status: 404 };
    }
  }

  async saveIdCursoProntuario(idCurso, prontuario, sub) {
    try {
      const user = await this.findBySub(sub);
      if (user.status !== 200) return { response: user.response, status: user.status };

      const check = await this.checarProntuario(prontuario, sub);
      if (check.status !== 200) return { response: check.response, status: check.status };

      await knex.update({ idcurso: idCurso, prontuario: prontuario }).table('usuario').where({ sub });
      return { response: user.response, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao atualizar base', status: 404 };
    }
  }

  async saveIdToken(token, sub) {
    try {
      const user = await this.findBySub(sub);

      if (user.status !== 200) return { response: user.response, status: user.status };

      await knex.update({ token })
        .table('usuario')
        .where({ sub });
      return { response: user.response, status: user.status };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao realizar update', status: 400 };
    }
  }

  async checarProntuario(prontuario, sub) {
    const id = await knex.select(['id'])
      .table('usuario')
      .where({ sub })
      .first();
    const allProntuario = await knex.select('prontuario').table('usuario').whereNot({ id: id.id });
    for (const i in allProntuario) {
      if (allProntuario[i].prontuario === prontuario) {
        return { response: 'Prontuário já existente', status: 400 };
      }
    }
    return { response: true, status: 200 };
  }

  async findByEmail(email) {
    try {
      const result = await knex.select(['email', 'nome', 'foto'])
        .table('usuario')
        .where({ email });

      if (result.length > 0) {
        return result;
      }
      return undefined;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async findBySub(sub) {
    try {
      const user = await knex.select(['id', 'email', 'nome', 'foto', 'idcurso', 'prontuario'])
        .table('usuario')
        .where({ sub });

      if (user.length === 0) return { response: 'Erro ao encontrar com sub', status: 404 };
      if (user === undefined) return ({ response: 'Erro ao encontrar com sub', status: 400 });

      return { response: user[0], status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar pelo sub', status: 400 };
    }
  }

  async findByToken(idToken) {
    try {
      const result = await knex.select(['email', 'nome', 'foto'])
        .table('usuario')
        .where({ idToken });

      if (result.length > 0) {
        return result[0];
      }
      return undefined;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async findAll() {
    try {
      const result = await knex.select('*')
        .table('usuario')
        .orderBy('id', 'asc');
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar usuários', status: 400 };
    }
  }

  async checkAmount(sub) {
    try {
      const total = [];
      const area = await knex.select(['area'])
        .from('curso AS c')
        .leftJoin('usuario AS u', 'u.idcurso', 'c.id')
        .where({ sub: sub} );
      if (area.length === 0) return { response: 'Curso do usuário não encontrado', status: 404 };
      const colegas = await knex.distinct().select('u.id', 'u.nome')
        .from('usuario AS u')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .whereNot('u.email', 'like', '%@aluno.ifsp.edu.br%')
        .where({ 'c.area': area[0].area });
      if (colegas.length === 0) return { response: 'Nenhum orientador encontrado', status: 404 };

      const colegasids = [];

      for (const i in colegas) {
        colegasids.push(colegas[i].id);
      }


      const data = await knex.distinct().select('idaluno', 'idorientador')
        .table('estagio')
        .whereIn('idorientador', colegasids)
        .where('fechado', null);

      for (const i in colegas) {
        total.push({ quantidade: data.filter(function(d) { return d.idorientador === colegas[i].id;}).length, nome: colegas[i].nome  })
      }
      console.log(total);
      console.log(data);

      return { response: total, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar os processos dos outros orientadores', status: 400 };
    }
  }

  async getAlunoProfile(sub) {
    try {
      const result = {};
      let countAceito = 0;
      let countRecusado = 0;
      const user = await this.findBySub(sub);

      if (user.status !== 200) return { response: user.response, status: user.status };
      const curso = await knex.select(['nome'])
        .table('curso')
        .where({ id: user.response.idcurso });
      if (curso.length === 0) return { response: 'Curso do usuário não encontrado', status: 404 };
      user.response.curso = curso[0].nome;
      result.user = user.response;

      const estagio = await knex.select(['id', 'criado', 'idorientador'])
        .table('estagio')
        .where({ idaluno: user.response.id });
      if (estagio.length === 0 || estagio[0].idorientador === null) {
        result.estagio = [];
        result.orientador = [];
        return { response: result, status: 404 };
      }

      const tickets = await knex.select(['aceito'])
        .table('ticket')
        .where({ idestagio: estagio[0].id });

      if (tickets.length === 0) return { response: 'Tickets do usuário não encontrado', status: 404 };

      for (const i in tickets) {
        if (tickets[i].aceito === true) {
          countAceito += 1;
        } else if (tickets[i].aceito === false) {
          countRecusado += 1;
        }
      }

      estagio[0].ticketsTotal = tickets.length;

      console.log(estagio[0]);
      estagio[0].ticketsAceitos = countAceito;
      estagio[0].ticketsRecusados = countRecusado;

      result.estagio = estagio[0];

      const cursoOrientador = await knex.select(['nome'])
        .table('curso')
        .where({ id: estagio[0].idorientador });
      if (cursoOrientador.length === 0) return { response: 'Curso do orientador não encontrado', status: 404 };
      const orientador = await knex.select('nome', 'email')
        .table('usuario')
        .where({ id: estagio[0].idorientador });
      if (orientador.length === 0) return { response: 'Orientador não encontrado', status: 404 };
      orientador[0].curso = cursoOrientador[0].nome;

      result.orientador = orientador[0];

      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao coletar informações do usuário', status: 400 };
    }
  }
}

module.exports = new User();
