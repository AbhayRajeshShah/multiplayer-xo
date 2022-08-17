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
let clients = {};

io.on("connection", (socket) => {
  socket.on("grid", ({ el, sNo, t }) => {
    console.log(sNo);
    console.log(t);
    socket.to(sNo.toString()).emit("gridL", el);
    socket.to(sNo.toString()).emit("switch", !t);
  });
  socket.on("joinRoom", (el) => {
    let str = el.toString();
    if (clients[str] == undefined) {
      clients[str] = 1;
    } else {
      clients[str]++;
    }
    if (clients[str] < 3) {
      temp = true;
      socket.join(el.toString());
      socket.emit("turn", turn);
      turn = !turn;
      socket.to(str).emit("new", clients[str]);
    }
    socket.emit("join", clients[str]);
  });
  socket.on("winner", ({ x, sNo, grid }) => {
    socket.to(sNo.toString()).emit("winner", { el: x, els: grid });
  });
});

httpServer.listen(process.env.PORT || 3001, () => {
  console.log("started");
});
