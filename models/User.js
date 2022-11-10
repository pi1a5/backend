/* eslint-disable no-plusplus */
/* eslint-disable no-loop-func */
/* eslint-disable prefer-template */
/* eslint-disable arrow-parens */
/* eslint-disable no-useless-concat */
/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
/* eslint-disable dot-notation */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable max-len */
/* eslint-disable prefer-destructuring */
/* eslint-disable object-shorthand */
/* eslint-disable prefer-const */
/* eslint-disable no-await-in-loop */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const { EC2MetadataCredentials } = require('aws-sdk');
const { index } = require('../controllers/HomeController');
const knex = require('../database/connection');
const Estagio = require('./Estagio');
const Ticket = require('./Ticket');

class User {
  async new(name, email, picture, token, sub) {
    try {
      let tipousuario = 0;

      if (email.indexOf('@aluno.ifsp.edu.br') !== -1 || email === 'teste.aluno.g5.pi2a6@gmail.com') {
        tipousuario = 1;
      } else if (email.indexOf('@ifsp.edu.br') !== -1 || email === 'pl1a5.grupo5@gmail.com' || email === 'teste.orientador.g5.pi2a6@gmail.com' || email === 'professororientador.teste@gmail.com') {
        tipousuario = 2;
      } else if (email === 'adm.g5.pi2a6@gmail.com') {
        tipousuario = 3;
      } else {
        return { response: 'Email inválido', status: 400 };
      }

      const user = await knex.returning('*').insert({
        idcurso: null, nome: name, email, foto: picture, token: token, sub: sub, idtipousuario: tipousuario, cargatotal: 0,
      }).table('usuario');
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
      if (user.length === 0) return { response: 'Erro ao encontrar usuario', status: 404 };

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
        .where({ prontuario: prontuario });
      if (checar.length !== 0) return { response: 'Prontuário já existente', status: 400 };
      await knex('usuario').update({ idcurso: idCurso, prontuario: prontuario })
        .where({ sub: sub });
      return { response: 'Curso e prontuário registrados com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao atualizar idcurso prontuario', status: 404 };
    }
  }

  async updateName(sub, nome) {
    try {
      await knex('usuario').update({ nome: nome })
        .where({ sub: sub });
      return { response: 'Nome atualizado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao atualizar nome', status: 404 };
    }
  }

  async updateProntuario(sub, prontuario) {
    try {
      await knex('usuario').update({ prontuario: prontuario })
        .where({ sub: sub });
      return { response: 'Prontuário atualizado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao atualizar prontuário', status: 404 };
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
        .where({ sub: sub });
      if (area.length === 0) return { response: 'Curso do usuário não encontrado', status: 404 };
      const colegas = await knex.distinct().select('u.id', 'u.nome')
        .from('usuario AS u')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .where({ idtipousuario: 2 })
        .where({ 'c.idarea': area[0].idarea });
      if (colegas.length === 0) return { response: 'Nenhum orientador encontrado', status: 404 };

      const colegasids = [];

      for (const i in colegas) {
        colegasids.push(colegas[i].id);
      }

      const data = await knex.distinct().select('idaluno', 'idorientador')
        .table('estagio')
        .whereIn('idorientador', colegasids)
        .where('idstatus', 2);

      for (const i in colegas) {
        total.push({ quantidade: data.filter(function (d) { return d.idorientador === colegas[i].id; }).length, nome: colegas[i].nome });
      }
      console.log(total);
      console.log(data);

      return { response: total, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar os processos dos outros orientadores', status: 400 };
    }
  }

  async getUserProfile(sub) {
    try {
      const profile = await knex.select('u.*', 'c.nome AS curso')
        .from('usuario AS u')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .where({ sub: sub });
      if (profile.length === 0) return { response: null, status: 200 };

      return { response: profile, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar dados do usuário', status: 400 };
    }
  }

  async getUserSupervisor(sub) {
    try {
      const idorientador = await knex.select('e.idorientador')
        .from('usuario AS u')
        .leftJoin('estagio AS e', 'e.idaluno', 'u.id')
        .where({ 'u.sub': sub });

      if (idorientador[0].idorientador === null) return { response: null, status: 200 };
      const supervisor = await knex('usuario').select('*')
        .where({ id: idorientador[0].idorientador });

      return { response: supervisor, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar dados do usuário', status: 400 };
    }
  }

  async getUserInternshipData(sub) {
    try {
      const estagio = await knex.select('e.id', knex.raw("TO_CHAR(e.criado, 'DD/MM/YYYY') as criado"), 'c.carga AS necessario', 'u.cargatotal AS cumprido')
        .from('estagio AS e')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .leftJoin('status AS s', 's.id', 'e.idstatus')
        .where({ 'u.sub': sub })
        .whereNot({ 's.nome': 'Aberto' });

      if (estagio.length === 0) return { response: null, status: 200 };

      estagio[0]['faltante'] = estagio[0].necessario - estagio[0].cumprido;

      const tickets = await knex('ticket').select('*')
        .where({ idestagio: estagio[0].id });
      if (tickets.length === 0) return { response: null, status: 200 };
      let countAceito = 0;
      let countRecusado = 0;
      for (const i in tickets) {
        if (tickets[i].aceito === true) {
          countAceito += 1;
        } else if (tickets[i].aceito === false) {
          countRecusado += 1;
        }
      }

      estagio[0]['tickets'] = tickets.length;
      estagio[0]['aceito'] = countAceito;
      estagio[0]['recusado'] = countRecusado;

      return { response: estagio, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar dados do usuário', status: 400 };
    }
  }

  async getSupervisorsByArea(sub) {
    try {
      const area = await knex.select('c.idarea')
        .from('curso AS c')
        .leftJoin('usuario AS u', 'u.idcurso', 'c.id')
        .where({ 'u.sub': sub });
      const result = await knex.select('u.*', 'c.nome AS curso')
        .from('usuario AS u')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .where({ 'c.idarea': area[0].idarea })
        .where('idtipousuario', 2)
        .whereNot('u.sub', sub)
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
      const result = await knex.select('u.nome', 'u.id', 'u.foto', 'u.prontuario', 'c.nome as curso')
        .from('usuario AS u')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .where({ 'u.idtipousuario': 2 })
        .orderBy('u.nome', 'asc');
      if (result.length === 0) return { response: null, status: 200 };
      return { response: result, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao encontrar orientadores', status: 400 };
    }
  }

  async deleteSupervisor(id) {
    try {
      await knex('usuario').del()
        .where({ id: id });
      return { response: 'Orientador deletado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao deletar orientador', status: 400 };
    }
  }

  async createRandomStudent() {
    try {
      let nomeAluno = 'Aluno-' + Math.floor(Math.random() * 100000);
      const cursos = await knex('curso').select('id', 'carga')
        .where({ idarea: 28 });
      console.log(cursos);
      const usuarios = await knex('usuario').select('nome');
      while (usuarios.some(x => x.nome === nomeAluno)) {
        nomeAluno = 'Aluno-' + Math.floor(Math.random() * 100000);
      }
      const estudante = {
        idcurso: cursos[Math.floor(Math.random() * (cursos.length - 1))].id,
        nome: nomeAluno,
        email: nomeAluno + '@aluno.ifsp.edu.br',
        sub: nomeAluno,
        foto: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        prontuario: 'SP' + nomeAluno,
        cargatotal: 0,
        idtipousuario: 1,
      };
      const idcurso = await knex('usuario').returning('*').insert(estudante);
      const processos = await knex('processo').select('id').where({ idcurso: idcurso[0].idcurso });

      await Estagio.newEstagio(processos[Math.floor(Math.random() * processos.length)].id, nomeAluno, 6);
      const etapaunica = await knex('estagio').select('etapaunica').where({ idaluno: idcurso[0].id });
      if (etapaunica) {
        await Ticket.new('Olá Orientador, gostaria de realizar meu processo de estágio!', nomeAluno, null, 30);
      } else {
        await Ticket.new('Olá Orientador, gostaria de realizar meu processo de estágio!', nomeAluno, null, null);
      }
      return { response: 'Estudante criado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao criar estudante', status: 400 };
    }
  }

  async createTicketForRandomStudent(id) {
    try {
      const processo = await knex('estagio').select('processo', 'id').where({ idaluno: id });
      await knex('estagio').update({ idstatus: 4 }).where({ id: processo[0].id });
      const sub = await knex('usuario').select('sub').where({ id: id });
      const indexAtual = processo[0].processo.etapas.findIndex(x => x.atual === true);
      if (indexAtual < processo[0].processo.etapas.length - 1) {
        await Ticket.new('Olá Orientador, gostaria de realizar meu processo de estágio!', sub[0].sub, null, 30);
      } else {
        await Ticket.new('Olá Orientador, gostaria de finalizar meu processo de estágio!', sub[0].sub, null, null);
      }
      return { response: 'Estudante criado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao criar estudante', status: 400 };
    }
  }

  async createRandomSupervisorForStudent(id) {
    try {
      let nomeOrientador = 'Orientador-' + Math.floor(Math.random() * 100000);
      const idcurso = await knex('usuario').select('idcurso').where({ id: id });
      const usuarios = await knex('usuario').select('nome');
      while (usuarios.some(x => x.nome === nomeOrientador)) {
        nomeOrientador = 'Orientador-' + Math.floor(Math.random() * 100000);
      }
      const orientador = {
        idcurso: idcurso[0].idcurso,
        nome: nomeOrientador,
        email: nomeOrientador + '@ifsp.edu.br',
        sub: nomeOrientador,
        foto: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        prontuario: null,
        cargatotal: 0,
        idtipousuario: 2,
      };
      const sub = await knex('usuario').returning('sub').insert(orientador);
      await this.answerFakeStudentTicket(sub[0].sub, id);
      return { response: 'Orientador criado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao criar estudante', status: 400 };
    }
  }

  async createRandomSupervisorsForCourse(cursos) {
    try {
      const orientadores = [];
      for (const j in cursos) {
        for (let i = 2; i <= Math.floor(Math.random() * 3) + 2; i++) {
          let nomeOrientador = 'Orienta-' + Math.floor(Math.random() * 100000);
          const usuarios = await knex('usuario').select('nome');
          while (usuarios.some(x => x.nome === nomeOrientador)) {
            nomeOrientador = 'Orienta-' + Math.floor(Math.random() * 100000);
          }
          usuarios.push({ nome: nomeOrientador });
          orientadores.push({
            idcurso: cursos[j].id,
            nome: nomeOrientador,
            email: nomeOrientador + '@ifsp.edu.br',
            sub: nomeOrientador,
            foto: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            prontuario: nomeOrientador,
            cargatotal: 0,
            idtipousuario: 2,
          });
        }
      }
      const ids = await knex('usuario').returning('*').insert(orientadores);
      return { response: ids, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao criar estudante', status: 400 };
    }
  }

  async populateCoursesWithStudentsAndSupervisors() {
    try {
      const cursos = await knex('curso').select('id')
        .where({ idarea: 28 });
      const idsOrientadores = await this.createRandomSupervisorsForCourse(cursos);
      await this.createRandomStudentsForSupervisor(idsOrientadores.response);
      return { response: 'Banco populado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao retornar estudantes', status: 400 };
    }
  }

  async createRandomStudentsForSupervisor(idsOrientadores) {
    try {
      const usuarios = await knex('usuario').select('nome');
      for (const i in idsOrientadores) {
        for (let j = 3; j <= Math.floor(Math.random() * 10) + 3; j++) {
          let nomeAluno = 'AlunoP-' + Math.floor(Math.random() * 100000);
          while (usuarios.some(x => x.nome === nomeAluno)) {
            nomeAluno = 'AlunoP-' + Math.floor(Math.random() * 100000);
          }
          usuarios.push({ nome: nomeAluno });
          let aluno = {
            idcurso: idsOrientadores[i].idcurso,
            nome: nomeAluno,
            email: nomeAluno + '@aluno.ifsp.edu.br',
            sub: nomeAluno,
            foto: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            prontuario: 'SP' + nomeAluno,
            cargatotal: 0,
            idtipousuario: 1,
          };
          const id = await knex('usuario').returning('*').insert(aluno);
          const idarea = await knex('curso').select('idarea')
            .where({ id: id[0].idcurso });

          const processos = await knex.select('p.id')
            .from('processo AS p')
            .leftJoin('curso AS c', 'c.id', 'p.idcurso')
            .where({ 'c.idarea': idarea[0].idarea });
          console.log(processos.length);
          const idprocesso = Math.floor(Math.random() * (processos.length - 1));
          console.log(idprocesso);
          await Estagio.newEstagio(processos[idprocesso].id, nomeAluno, 6);
          const etapaunica = await knex('estagio').select('etapaunica').where({ idaluno: id[0].id });
          if (etapaunica) {
            await Ticket.new('Olá Orientador, gostaria de realizar meu processo de estágio!', nomeAluno, null, Math.floor(Math.random() * 10) + 21);
          } else {
            await Ticket.new('Olá Orientador, gostaria de realizar meu processo de estágio!', nomeAluno, null, null);
          }
          await this.answerFakeStudentTicket(idsOrientadores[i].sub, id[0].id);
          await this.createTicketForRandomStudent(id[0].id);
          await this.answerFakeStudentTicket(idsOrientadores[i].sub, id[0].id);
        }
      }
      return { response: 'ok', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao retornar estudantes', status: 400 };
    }
  }

  async answerFakeStudentTicket(sub, id) {
    try {
      const idticket = await knex.select('t.id')
        .from('ticket AS t')
        .leftJoin('estagio AS e', 'e.id', 't.idestagio')
        .where({ 'e.idaluno': id })
        .where({ 't.resposta': null });
      await Ticket.updateFeedback(sub, idticket[0].id, 'Tudo certo!', true, 1);
      return { response: 'Ticket criado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao responder ticket', status: 400 };
    }
  }

  async getFakeStudents() {
    try {
      const alunos = await knex.select('u.*', 'c.nome AS curso', 'e.idorientador')
        .from('usuario AS u')
        .leftJoin('curso AS c', 'c.id', 'u.idcurso')
        .leftJoin('estagio AS e', 'e.idaluno', 'u.id')
        .whereLike('u.nome', '%Aluno-%');
      return { response: alunos, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao retornar estudantes', status: 400 };
    }
  }

  async getStatus(sub) {
    try {
      const status = await knex.select('s.nome')
        .from('status AS s')
        .leftJoin('estagio AS e', 'e.idstatus', 's.id')
        .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
        .where({ 'u.sub': sub });
      console.log(status);
      if (status.length === 0) return { response: null, status: 200 };

      if (status[0].nome === 'Atrasado') {
        const dataAtual = new Date();
        const prazoEtapa = await knex.select('t.datafechado', 't.datacriado', 't.resposta', 'f.valor', knex.raw("etapa->'etapa'->'prazo' as prazo"))
          .from('ticket AS t')
          .leftJoin('estagio AS e', 'e.id', 't.idestagio')
          .leftJoin('frequencia AS f', 'f.id', 'e.idfrequencia')
          .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
          .where({ 'u.sub': sub });

        const indexTicketAtual = prazoEtapa.length;
        // if (prazoEtapa[indexTicketAtual - 1].resposta === null) {
        //   status[0].nome = 'Sem Resposta';
        // } 
        const dataPrevista = new Date(prazoEtapa[indexTicketAtual - 1].datacriado);
        dataPrevista.setMonth(dataPrevista.getMonth() + prazoEtapa[indexTicketAtual - 1].valor);
        dataPrevista.setDate(dataPrevista.getDate() + prazoEtapa[indexTicketAtual - 1].prazo);
        status[0]['dataPrevista'] = dataPrevista;
        status[0]['dias'] = Math.round((dataAtual - dataPrevista) / (1000 * 60 * 60 * 24));
      }

      if (status[0].nome === 'Em Dia') {
        const dataAtual = new Date();
        const prazoEtapa = await knex.select('t.datafechado', 'f.valor', knex.raw("etapa->'etapa'->'prazo' as prazo"))
          .from('ticket AS t')
          .leftJoin('estagio AS e', 'e.id', 't.idestagio')
          .leftJoin('frequencia AS f', 'f.id', 'e.idfrequencia')
          .leftJoin('usuario AS u', 'u.id', 'e.idaluno')
          .where({ 'u.sub': sub });
        const dataPrevista = new Date(prazoEtapa[prazoEtapa.length - 1].datafechado);
        dataPrevista.setMonth(dataPrevista.getMonth() + prazoEtapa[prazoEtapa.length - 1].valor);
        status[0]['dataPrevista'] = dataPrevista;
        status[0]['dias'] = Math.round((dataPrevista - dataAtual) / (1000 * 60 * 60 * 24));
      }
      return { response: status[0], status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao deletar orientador', status: 400 };
    }
  }

  async teste() {
    try {
      const estagios = await knex.select('e.id', 'e.processo', 'f.valor', 's.nome', knex.raw('json_agg(t.datacriado) as tickets'))
        .from('estagio AS e')
        .leftJoin('ticket AS t', 't.idestagio', 'e.id')
        .leftJoin('status AS s', 's.id', 'e.idstatus')
        .leftJoin('frequencia AS f', 'f.id', 'e.idfrequencia')
        .where({ 's.nome': 'Atrasado', 'e.etapaunica': false })
        .orWhere({ 's.nome': 'Em Dia', 'e.etapaunica': false })
        .whereNot({ 's.nome': 'Aberto' })
        .groupBy('e.id')
        .groupBy('s.nome')
        .groupBy('f.valor');
      if (estagios.length === 0) return { response: null, status: 200 };
      const dataAtual = new Date();
      console.log(estagios);

      for (const i in estagios) {
        const indexTicketAtual = estagios[i].tickets.length;
        const datavencimentoticket = new Date(estagios[i].tickets[indexTicketAtual - 1]);
        for (const j in estagios[0].processo.etapas) {
          if (estagios[0].processo.etapas[j].atual === true) {
            const prazo = estagios[0].processo.etapas[j].prazo;
            datavencimentoticket.setDate(datavencimentoticket.getDate() + prazo);
            break;
          }
        }
        datavencimentoticket.setMonth(datavencimentoticket.getMonth() + estagios[i].valor);
        console.log(estagios[i]);
        console.log(datavencimentoticket);
        if (estagios[i].nome === 'Em Dia') {
          if (dataAtual > datavencimentoticket) {
            await knex('estagio').update({ idstatus: 5 }).where({ id: estagios[0].id });
          }
        } else {
          datavencimentoticket.setDate(datavencimentoticket.getDate() + 10);
          if (dataAtual > datavencimentoticket) {
            // await knex('estagio').update({ idstatus: 5 }).where({ id: estagios[0].id });
          }
        }
      }

      return { response: estagios, status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao deletar orientador', status: 400 };
    }
  }
}

module.exports = new User();
