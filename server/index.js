// Server setup
require("dotenv").config();

const express = require("express");
const app = express();
const port = 5000;

// Database - mongodb
const mongoose = require("mongoose");

// Other
const path = require("path");

//routes
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

app.listen(port, () => {
  console.log(`Server started on port ${port}!`);
});
