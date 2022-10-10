/* eslint-disable linebreak-style */
/* eslint-disable prefer-destructuring */
/* eslint-disable object-shorthand */
/* eslint-disable prefer-const */
/* eslint-disable no-await-in-loop */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const { EC2MetadataCredentials } = require('aws-sdk');
const knex = require('../database/connection');

class User {
  async new(name, email, picture, token, sub) {
    try {
      let orientador = false;

      if (email.indexOf('@aluno.ifsp.edu.br') !== -1 || email === 'teste.aluno.g5.pi2a6@gmail.com') {
        orientador = false;
      } else if (email.indexOf('@ifsp.edu.br') !== -1 || email === 'pl1a5.grupo5@gmail.com' || email === 'teste.orientador.g5.pi2a6@gmail.com' || email === 'adm.g5.pi2a6@gmail.com') {
        orientador = true;
      } else {
        return { response: 'Email inválido', status: 400 };
      }


      const user = await knex.returning('*').insert({
        idcurso: null, nome: name, email, foto: picture, token: token, sub: sub, orientador: orientador
      }).table('usuario');
      console.log(user);
      return { response: user[0], status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao cadastrar usuário', status: 404 };
    }
  }

  async findBySub(sub) {
    try {
      const user = await knex('usuario').select('*')
        .where({ sub: sub });
      if (user.length === 0) return {response: 'Erro ao encontrar usuario', status: 404};

      return { response: user[0], status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao atualizar base', status: 404 };
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

  async saveIdCursoProntuario(idCurso, prontuario, sub) {
    try {
      const checar = await knex.select('*')
        .table('usuario')
        .where({prontuario: prontuario})
      if (checar.length !== 0) return { response: 'Prontuário já existente', status: 400 }
      await knex('usuario').update({ idcurso: idCurso, prontuario: prontuario})
        .where({ sub: sub });
      return { response: 'Curso e prontuário registrados com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao atualizar idcurso prontuario', status: 404 };
    }
  }

  async login(name, email, picture, token, sub) {
    try {
      const user = await knex.select(['id', 'email', 'nome', 'foto', 'idcurso', 'prontuario'])
        .table('usuario')
        .where({ sub });
      if (user.length === 0) return await this.new(name, email, picture, token, sub);

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
      const area = await knex.select(['idarea'])
        .from('curso AS c')
        .leftJoin('usuario AS u', 'u.idcurso', 'c.id')
        .where({ sub: sub} );
      if (area.length === 0) return { response: 'Curso do usuário não encontrado', status: 404 };
      const colegas = await knex.distinct().select('u.id', 'u.nome')
        .from('usuario AS u')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .whereNot('u.email', 'like', '%@aluno.ifsp.edu.br%')
        .where({ 'c.idarea': area[0].idarea });
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

  async getSupervisorsByArea(sub) {
    try {
      const area = await knex.select('c.idarea')
      .from('curso AS c')
      .leftJoin('usuario AS u', 'u.idcurso', 'c.id')
      .where({ 'u.sub': sub })
      const result = await knex.select('u.*', 'c.nome AS curso')
        .from('usuario AS u')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .where({ 'c.idarea': area[0].idarea })
        .where('u.email', 'like', '%@ifsp.edu.br%')
        .orderBy('u.id', 'asc');
      if (result.length === 0) return { response: null, status: 200 };
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar usuários', status: 400 };
    }
  }

  async getSupervisors() {
    try {
      const result = await knex('usuario').select('*')
        .where({ orientador: true })
        .orderBy('nome', 'asc');
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar usuários', status: 400 };
    }
  }
}

module.exports = new User();
