require("dotenv").config();
const express = require("express");
const http = require("http");
// Socket
const { Server } = require("socket.io");
// Database - mongodb
const mongoose = require("mongoose");
// Other
const session = require("express-session");
const passport = require("../passport/setup");

const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(
    session({
      secret: "secret",
      resave: true,
      saveUninitialized: true,
    })
  );

  // LOCAL ROUTING TO FILES
  app.use(passport.initialize());
  app.use(passport.session());

  app.set("view engine", "ejs");
  app.use(express.static("public"));
  app.use(express.urlencoded({ extended: false }));

  return app;
};

const createServer = (app) => {
  const server = http.createServer(app);

  return server;
};

const createSocketServer = (server) => {
  const io = new Server(server);

  // Socket IO
  io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    const sessionId = socket.handshake.auth.sessionId;
    const userDdId = socket.handshake.auth.userDbId;

    console.log(socket.handshake.auth);
    console.log("try to connect ", username, " sessionId: ", sessionId);

    if (sessionId) {
      console.log(sessionId);
      // find existing session
      console.log("session: ", session);
      if (session) {
        socket.sessionId = sessionId;
        socket.userDbId = userDdId;
        socket.username = username;
        console.log(
          `User ${socket.username} socket_id: ${socket.sessionId} db_id: ${socket.userDbId} is trying to connect`
        );
        return next();
      }
    }

    socket.sessionId = uuidv4();
    socket.username = username;
    socket.userDbId = userDdId;
    console.log(
      `User ${socket.username} socket_id: ${socket.sessionId} db_id: ${socket.userDbId} is trying to connect`
    );
    next();
  });
  // Ustawić dopiero po logowaniu
  io.on("connection", (socket) => {
    console.log("user connected");
    socket.join(socket.userDbId);

    // Session
    socket.emit("session", {
      userSessionId: socket.sessionId,
      userDbId: socket.userDbId,
      username: socket.username,
    });

    // List all users
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
      users.push({
        userSocketId: socket.sessionId,
        userDbId: socket.userDbId,
        username: socket.username,
      });
    }
    console.log("users", users);
    socket.emit("users", users);

    // Message event listener
    socket.on("private_message", ({ content, to }) => {
      console.log("priv", to);
      console.log("users: ", users);
      const receiverData = users.find((user) => user.userDbId === to);
      console.log("receiver: " + receiverData.userDbId);
      const userInfo = { username: socket.username, userDbId: socket.userDbId };
      const msgInfo = { content, userInfo };
      console.log(receiverData);
      io.to(to).to(receiverData.userSocketId).emit("private_message", {
        msgInfo,
        from: socket.userDbId,
        to,
      });
    });

    // Disconnect event listener
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  return io;
};

const createDbConnection = async () => {
  // MongoDB connection
  const mongoString = process.env.DATABASE_URL;

  mongoose.connect(mongoString);
};

module.exports = {
  createApp,
  createServer,
  createSocketServer,
  createDbConnection,
};
