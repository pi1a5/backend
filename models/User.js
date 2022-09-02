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
      const user = await knex.select(['email', 'nome', 'foto', 'idcurso', 'prontuario'])
        .table('usuario')
        .where({ sub })
        .first();

      if (user.length === 0) return { response: 'Erro ao encontrar com sub', status: 404 };
      if (user === undefined) return ({ response: 'Erro ao encontrar com sub', status: 400 });

      return { response: user, status: 200 };
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

  // fazer depois

  async checkAmount(sub) {
    try {
      const idCurso = await knex.select(['idcurso'])
        .table('usuario')
        .where({ sub });
      if (idCurso.length === 0) return { response: 'Curso do usuário não encontrado', status: 404 };
      const colegas = await knex.distinct().select('id', 'nome')
        .table('usuario')
        .whereNot('email', 'like', '%@aluno.ifsp.edu.br%')
        .where({ idcurso: idCurso[0].idcurso });
      if (colegas.length === 0) return { response: 'Nenhum orientador encontrado', status: 404 };

      for (const k in colegas) {
        const data = await knex.distinct().select('idaluno')
          .table('estagio')
          .where({ idorientador: colegas[k].id });
        if (data.length > 0) {
          let count = 0;
          for (const y in data) {
            const processo = await knex.select('fechado')
              .table('estagio')
              .where(data[y].idaluno);
            if (processo[0].fechado !== false) {
              count += 1;
            }
          }
          colegas[k].quantidade = count;
        } else {
          let count = 0;
          colegas[k].quantidade = count;
        }
      }
      return colegas.sort((a, b) => parseFloat(b.quantidade) - parseFloat(a.quantidade));
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar os processos dos outros orientadores', status: 400 };
    }
  }

  async getAlunoProfile(sub) {
    try {
      const result = {};
      const user = this.findBySub(sub);
      if (user.status !== 200) return { response: user.response, status: user.status };
      const curso = await knex.select(['nome'])
        .table('curso')
        .where({ id: user[0].idcurso });
      if (curso.length === 0) return { response: 'Curso do usuário não encontrado', status: 404 };
      user[0].curso = curso[0].nome;
      result.user = user[0];

      const estagio = await knex.select(['id', 'criado', 'idorientador'])
        .table('estagio')
        .where({ idaluno: user[0].id })
      if (estagio.length === 0) {
        result.estagio = [];
        result.orientador = [];
        return { response: result, status: 404 };
      }

      const cursoOrientador = await knex.select(['nome'])
      .table('curso')
      .where({ id: estagio[0].idorientador });
      if (cursoOrientador.length === 0) return { response: 'Curso do usuário não encontrado', status: 404 };

      const orientador = await knex.select('nome', 'email', )

      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar usuários', status: 400 };
    }
  }
}

module.exports = new User();
