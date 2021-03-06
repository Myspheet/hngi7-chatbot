const express = require("express");
const app = express();
const server = require("http").Server(app);
const session = require("express-session");
const io = require("socket.io")(server);
const cors = require("cors");
const port = process.env.PORT || 7000;
const WitService = require("./service/WitService");
const ConversationService = require("./service/ConversationService");

// For .env files
require("dotenv").config();

// middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);
app.use(express.json());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

app.use(express.static("public"));

const witService = new WitService(process.env.WIT_ACCESS_TOKEN);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  req.session.context = {};
  res.sendFile(__dirname + "/public/index.html");
});

app.options("/", async (req, res) => {
  // res.sendFile(__dirname + "/public/index.html");

  if (!req.session.context) {
    req.session.context = {};
  }
  const context = await ConversationService.run(
    witService,
    req.body.message,
    req.session.context
  );
  res.json({ message: context.conversation.followUp });
});

app.post("/", async (req, res) => {
  // res.sendFile(__dirname + "/public/index.html");

  if (!req.session.context) {
    req.session.context = {};
  }
  const context = await ConversationService.run(
    witService,
    req.body.message,
    req.session.context
  );
  res.json({ message: context.conversation.followUp });
});
// io.on("connection", (socket) => {
//   socket.context = context;
//   io.emit("message", {
//     message:
//       "Hello, I'm Resi and I can help you book a reservation at the Continental Diner!",
//   });
//   socket.on("message", async (data) => {
//     io.emit("message", { message: data.chatMsg, user: data.user });
//     const context = await ConversationService.run(
//       witService,
//       data.chatMsg,
//       socket.context
//     );
//     console.log(socket.context.conversation.complete);
//     if (!socket.context.conversation.complete) {
//       io.emit("message", {
//         message: context.conversation.followUp,
//         user: "bot",
//       });
//     } else {
//       io.emit("message", {
//         message: context.conversation.followUp,
//         user: "bot",
//       });
//     }
//   });
// });
