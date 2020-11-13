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
        // httpCompression: true,
        origins: '*:*'// <---- Allow any origin here
};
// Socket setup
const io = socket(server,options);

const activeUsers = new Set();


const userMap = new Object();
const messageList = {};
messageList["test"] = []

  // console.log(io);
io.on("connection", function (socket) {
  // console.log(socket);
  console.log("Made socket connection");

  socket.on('connect', () => {
    console.log("socket connected")
    // console.log(socket)
    // console.log(socket.connected); // true
    // io.emit("new user", [...activeUsers]);
  });

  // socket.on("new user", function (data) {
  //   console.log("new user");
  //   console.log(data);
  //   socket.userId = data;
  //   activeUsers.add(data);
  //   io.emit("new user", [...activeUsers]);
  //   io.to(socket.id).emit('event', 'I just met you');
  // });

  socket.on("disconnect", () => {
    if(socket.userId){
      activeUsers.delete(socket.userId);
      io.emit("user disconnected", socket.userId);
    }
    if(socket.uid){
      console.log("disconnected "+socket.uid)
      delete userMap[socket.uid];
      // console.log(userMap);
      io.emit("_userDisconnected", socket.uid);
    }
  });

  // socket.on("chat message", function (data) {
  //   console.log("chat message");
  //   console.log(data);
  //   io.emit("chat message", data);
  // });
  
  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data);
  });


 //LOGIN
  socket.on("_login", function (data) {
    console.log("_login");
    // console.log(data);
    // activeUsers.add(data);
    // io.emit("new user", [...activeUsers]);
    // io.to(socket.id).emit('event', 'I just met you');
    var uid = generateUniqueId();
    socket.uid = uid;
    var obj = {
      name:data,
      si : socket.id,
      uid : uid
    }
    userMap[uid] = obj ;
    socket.uid = uid;
    io.to(socket.id).emit('_setUser', obj);
    // console.log('userMap')
    // console.log(userMap)
    io.emit("_fetchUsers", userMap);
  });

 //SendMessage
  socket.on("_sendMessage", function (data) {
    console.log("_sendMessage");
    // console.log(data);
    data.id = generateUniqueId();
    // console.log("_recvMessage");
    // console.log(data.to);
    if(userMap[data.to]){
      console.log('si')
      var si = userMap[data.to].si;
      // console.log('si');
      // console.log(si);
      io.to(si).emit('_recvMessage', data);
    }else{
      console.log('!si')
    }
  });

});


//my generate uniqueid
function generateUniqueId(){
  var getNow = getNowFunc();
  var NowWithZero = (getNow+"").replace(".",randomString(3)).padEnd(20,'0');
  var NowInReverse = randomString(3)+reverseString(NowWithZero);
  return NowInReverse;
}
//get random String
function randomString(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
//get string in reverse
function reverseString(str) {
    return str.split("").reverse().join("");
}


function getNowFunc(){
  var hrTime = process.hrtime()
  return hrTime[0] * 1000000 + hrTime[1] / 1000;
}


