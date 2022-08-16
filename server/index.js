const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  // options
  cors: "cors",
});

var members = 0;
var socketNo = 0;
var turn = false;

io.on("connection", (socket) => {
  if (members === 2) {
    socketNo++;
    members = 0;
  }
  members++;
  socket.join(socketNo.toString());
  socket.emit("sNo", socketNo);
  socket.emit("turn", turn);
  turn = !turn;
  console.log(turn);
  socket.on("grid", ({ el, sNo, t }) => {
    console.log(sNo);
    console.log(t);
    socket.to(sNo.toString()).emit("gridL", el);
    socket.to(sNo.toString()).emit("switch", !t);
  });
});

httpServer.listen(3001, () => {
  console.log("started");
});
