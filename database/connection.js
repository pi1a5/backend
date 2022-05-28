const knex = require('knex')({
  client: process.env.CLIENT,
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