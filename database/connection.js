console.log(process.env.CLIENT)
console.log(process.env.HOST)
console.log(process.env.PORT)
console.log(process.env.USER)
console.log(process.env.PASSWORD)
console.log(process.env.DATABASE)

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