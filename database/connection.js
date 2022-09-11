/* eslint-disable linebreak-style */
require('dotenv').config();

const knex = require('knex')({
  debug: true,
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USE,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionTimeoutMillis: 0,
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

module.exports = knex;
