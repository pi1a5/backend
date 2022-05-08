const express = require("express")
//const bodyParser = require('body-parser')
const router = require("./routes/routes")
const app = express()
const http = require("http").createServer(app)
//const io = require('socket.io')(http)

//require('./modules/socket')(io)

//const urlencodedParser = bodyParser.urlencoded({ extended: true })

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/", router)

http.listen(process.env.PORT || "3000", () => {
  console.log("Server is running...")
})