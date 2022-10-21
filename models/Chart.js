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

class Chart {
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
            .where({ idtipousuario: 2})
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

    async getInternshipsAmountByStatus(sub) {
        try {
            console.log('test');
        } catch (error) {
            return { response: 'Erro ao encontrar os processos por status', status: 400 };
        }
    }
}

module.exports = new Chart();