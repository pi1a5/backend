/* eslint-disable no-console */
/* eslint-disable linebreak-style */
const User = require('../models/socket/User');
const Users = require('../models/socket/Users');

module.exports = function (io) {
  io.on('connection', (socket) => {
    // create a User
    const user = new User(socket);
    // add User into Users
    Users.addUser(user);
    console.log(`Client ${socket.id} connected`);

    // remove User from users
    socket.on('disconnect', () => {
      Users.removeUser(socket.id);
      console.log(`Client ${socket.id} disconnected`);
    });
  });
};
