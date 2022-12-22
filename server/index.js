// Server setup
require("dotenv").config();
const express = require("express");
const app = express();
const port = 5000;
const http = require("http");
const server = http.createServer(app);
// Database - mongodb
const mongoose = require("mongoose");
// Socket
const { Server } = require("socket.io");
const io = new Server(server);
// Other
const path = require("path");
const session = require("express-session");

app.use(express.json());
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
const passport = require("./passport/setup");

// LOCAL ROUTING TO FILES
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

// Routes
const loginApi = require("./routes/login");
const businessApi = require("./routes/business");
const chat = require("./routes/chat");
const routes = require("./routes/routes");

// APIs
app.use("/", loginApi);
app.use("/", chat);
app.use("/business", businessApi);
app.use("/", routes);

// MongoDB connection
const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

// Socket IO
io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  const userDdId = socket.handshake.auth.userDbId;
  socket.username = username;
  socket.userDbId = userDdId;
  console.log(
    `User ${socket.username} socket_id: ${socket.id} db_id: ${socket.userDbId} connected`
  );
  next();
});
// Ustawić dopiero po logowaniu
io.on("connection", (socket) => {
  // List all users
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userSocketId: id,
      userDbId: socket.userDbId,
      username: socket.username,
    });
  }
  console.log(users);
  socket.emit("users", users);

  // Message event listener
  socket.on("private_message", ({ content, to }) => {
    console.log("priv");
    console.log(content);
    console.log(to);
    const receiverData = users.find((user) => user.userDbId == to);
    const userInfo = { username: socket.username, userDbId: socket.userDbId };
    const msgInfo = { content, userInfo };
    io.to(receiverData.userSocketId).emit("private_message", {
      msgInfo,
      from: socket.userDbId,
    });
  });

  // Disconnect event listener
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server started on port ${port}!`);
});
