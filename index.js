/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const multer = require('multer')

const app = express();
const http = require('http').createServer(app);
const fileupload = require('express-fileupload');
const router = require('./routes/routes');

// const io = require('socket.io')(http)

// require('./modules/socket')(io)

// const urlencodedParser = bodyParser.urlencoded({ extended: true })

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileupload());
// app.use(multer({dest:'./uploads/'}).any())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', router);

http.listen(process.env.PORT || '3000', () => {
  console.log('Server is running...');
});
