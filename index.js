const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 7000;
const WitService = require("./service/WitService");
const ConversationService = require("./service/ConversationService");

// For .env files
require("dotenv").config();

// middleware
app.use(express.static("public"));

const witService = new WitService(process.env.WIT_ACCESS_TOKEN);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
const context = {};
io.on("connection", (socket) => {
  socket.context = context;
  io.emit("message", {
    message:
      "Hello, I'm Resi and I can help you book a reservation at the Continental Diner!",
  });
  socket.on("message", async (data) => {
    io.emit("message", { message: data.chatMsg, user: data.user });
    const context = await ConversationService.run(
      witService,
      data.chatMsg,
      socket.context
    );
    console.log(socket.context.conversation.complete);
    if (!socket.context.conversation.complete) {
      io.emit("message", {
        message: context.conversation.followUp,
        user: "bot",
      });
    } else {
      io.emit("message", {
        message: context.conversation.followUp,
        user: "bot",
      });
    }
  });
});
