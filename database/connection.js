const knex = require('knex')({
  client: 'postgresql',
  connection: {
    host: 'ec2-54-172-175-251.compute-1.amazonaws.com',
    port: 5432,
    user: 'elluzlxbymnibj',
    password: 'd916b2fdd9753c2cbb9c656ef9dad387f838b57f4d6f184547174fdf83584a96',
    database: 'd1f9dqpn25am03',
    ssl: {
      require: true, // This will help you. But you will see nwe error
      rejectUnauthorized: false // This line will fix new error
    }
  }
});

module.exports = knex