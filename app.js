const express = require("express");
const socket = require("socket.io");

// App setup
const PORT = process.env.PORT;// | 5555;
const app = express();
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

// Static files
app.use(express.static("public"));

var options = {
        allowUpgrades: true,
        transports: [ 'polling', 'websocket' ],
        pingTimeout: 9000,
        pingInterval: 3000,
        cookie: 'mycookie',
        // httpCompression: true,
        origins: '*:*'// <---- Allow any origin here
};
// Socket setup
const io = socket(server,options);

const activeUsers = new Set();

const messageList = {};
messageList["test"] = []

  // console.log(io);
io.on("connection", function (socket) {
  // console.log(socket);
  console.log("Made socket connection");

  socket.on('connect', () => {
    console.log("socket")
    // console.log(socket)
    console.log(socket.connected); // true
    io.emit("new user", [...activeUsers]);
  });

  socket.on("new user", function (data) {
    console.log("new user");
    console.log(data);
    socket.userId = data;
    activeUsers.add(data);
    io.emit("new user", [...activeUsers]);
    io.to(socket.id).emit('event', 'I just met you');
  });

  socket.on("disconnect", () => {
    activeUsers.delete(socket.userId);
    io.emit("user disconnected", socket.userId);
  });

  socket.on("chat message", function (data) {
    console.log("chat message");
    console.log(data);
    io.emit("chat message", data);
  });
  
  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data);
  });
});