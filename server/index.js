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
const chat = require("./routes/chat");
const routes = require("./routes/routes");

// APIs
app.use("/", loginApi);
app.use("/", chat);
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
// Ustawić dopiero po logowaniu
io.on("connection", (socket) => {
  const usersCount = io.engine.clientsCount;
  socket.username = "user" + usersCount;
  console.log(`User ${socket.username} id: ${socket.id} connected`);
  socket.on("message", (msg) => {
    io.emit("message", msg);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server started on port ${port}!`);
});
