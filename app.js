const express = require("express");
const socket = require("socket.io");

// App setup
const PORT = process.env.PORT | 5555;
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
        httpCompression: true,
        origins: '*:*'// <---- Allow any origin here
};
// Socket setup
const io = socket(server,options);

const activeUsers = new Set();

io.on("connection", function (socket) {
  console.log("Made socket connection");

  socket.on("new user", function (data) {
    socket.userId = data;
    activeUsers.add(data);
    io.emit("new user", [...activeUsers]);
  });

  socket.on("disconnect", () => {
    activeUsers.delete(socket.userId);
    io.emit("user disconnected", socket.userId);
  });

  socket.on("chat message", function (data) {
    io.emit("chat message", data);
  });
  
  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data);
  });
});