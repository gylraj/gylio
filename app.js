const express = require("express");
const socket = require("socket.io");


// App setup
const PORT = process.env.PORT;// | 5555;
const app = express();
const server = app.listen(PORT, function () {
  consoleThis(`Listening on port ${PORT}`);
  consoleThis(`http://localhost:${PORT}`);
});

const DEBUG = true; 

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

var connectedCount = 0;
var activeCount = 0;

function monitorConnect(socket){
  consoleThis("socket connected");
  consoleThis("socket.id : " + socket.id)
  connectedCount++;
  consoleThis("online: "+connectedCount);
  consoleThis("active: "+activeCount);
}

  // consoleThis(io);
io.on("connection", function (socket) {
  consoleThis("Made socket connection");
  consoleThis("socket.id : " +socket.id);

  monitorConnect(socket);

  socket.on('connect', () => {
    consoleThis("socket connected");
    consoleThis("socket.id : " +socket.id);
    // io.emit("new user", [...activeUsers]);

    monitorConnect(socket);
  });

  socket.on("disconnect", () => {
    consoleThis("socket disconnected");
    consoleThis("socket.id : " +socket.id);
    if(socket.uid){
      consoleThis("disconnected "+socket.uid)
      delete userMap[socket.uid];
      // consoleThis(userMap);
      io.emit("_userDisconnected", socket.uid);
    }
    consoleThis("socket.id : " + socket.id)
    connectedCount--;
    activeCount--;
    consoleThis("online: "+connectedCount);
    consoleThis("active: "+activeCount);

    io.emit("_emitOnlineActive", {onlineUserCount: connectedCount, activeUserCount: activeCount});
  });

 //LOGIN
  socket.on("_login", function (data) {
    consoleThis("_login");
    consoleThis("socket.id : " +socket.id);
    // consoleThis(data);
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
    // consoleThis('userMap')
    // consoleThis(userMap)
    io.emit("_fetchUsers", userMap);

    activeCount++;
    consoleThis("online: "+connectedCount);
    consoleThis("active: "+activeCount);
    io.emit("_emitOnlineActive", {onlineUserCount: connectedCount, activeUserCount: activeCount});
  });



  // socket.on("new user", function (data) {
  //   consoleThis("new user");
  //   consoleThis(data);
  //   socket.userId = data;
  //   activeUsers.add(data);
  //   io.emit("new user", [...activeUsers]);
  //   io.to(socket.id).emit('event', 'I just met you');
  // });

  // socket.on("chat message", function (data) {
  //   consoleThis("chat message");
  //   consoleThis(data);
  //   io.emit("chat message", data);
  // });
  
  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data);
  });



 //SendMessage
  socket.on("_sendMessage", function (data) {
    consoleThis("_sendMessage");
    // consoleThis(data);
    data.id = generateUniqueId();
    // consoleThis("_recvMessage");
    // consoleThis(data.to);
    if(userMap[data.to]){
      consoleThis('si')
      var si = userMap[data.to].si;
      // consoleThis('si');
      // consoleThis(si);
      io.to(si).emit('_recvMessage', data);
    }else{
      consoleThis('!si')
    }
  });

});


function consoleThis(v){
  if(DEBUG){
    console.log(v);
  }
}

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


