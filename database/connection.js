require('dotenv').config()
console.log(process.env)
const knex = require('knex')({
  debug: true,
  client: 'postgresql',
  connection: {
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USE,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    ssl: {
      require: true,  
      rejectUnauthorized: false 
    }
  }
});


module.exports = knex