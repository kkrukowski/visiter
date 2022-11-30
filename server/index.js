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
// Routes
const loginRoute = require("./routes/login.js");
app.use("/login", loginRoute);

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

app.set("view engine", "ejs");
app.use(express.static("public"));

// Routes
app.use("/", require("./routes/login"));
app.use("/", require("./routes/chat"));

// Socket
io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    // find existing session
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
      return next();
    }
  }
  // const username = socket.handshake.auth.username;
  // if (!username) {
  //   return next(new Error("invalid username"));
  // }
  // create new session
  socket.sessionID = randomId();
  socket.userID = randomId();
  socket.username = randomId();
  next();
});

io.on("connection", (socket) => {
  console.log("user connected");
  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });
  socket.on("chat message", (msg) => {
    console.log("message: " + msg);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server started on port ${port}!`);
});
