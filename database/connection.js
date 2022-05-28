require('dotenv').config();


console.log(process.env.DB_HOST)
const knex = require('knex')({
  debug: true,
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USE,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: {
      require: true,  
      rejectUnauthorized: false 
    }
  }
})



module.exports = knex