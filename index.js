const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 7000;

// middleware
app.use(express.static("public"));

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  socket.on("message", (data) => {
    console.log(data.chatMsg);
    io.emit("message", { message: data.chatMsg, user: socket.user });
  });
});
