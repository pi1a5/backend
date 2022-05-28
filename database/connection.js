console.log(process.env.CLIENT)
console.log(process.env.HOST)
console.log(process.env.PORT)
console.log(process.env.USER)
console.log(process.env.PASSWORD)
console.log(process.env.DATABASE)

const knex = require('knex')({
  client: "postgresql",
  connection: {
    host: "ec2-52-4-104-184.compute-1.amazonaws.com",
    port: 5432,
    user: "rojffajrdflnho",
    password: "26d7426815121263da04cbd5b140ba5064dcff582cbed8da9aedaca8b6d11ab7",
    database: "df0h2i2l2pfcdr",
    ssl: {
      require: true,  
      rejectUnauthorized: false 
    }
  }
});


module.exports = knex