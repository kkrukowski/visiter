// Server setup
require("dotenv").config();

const express = require("express");
const app = express();
const port = 5000;

// Database - mongodb
const mongoose = require("mongoose");

// Other
const path = require("path");

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

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.listen(port, () => {
  console.log(`Server started on port ${port}!`);
});





function pokazhaslo() {
  const eye = document.querySelector('#eye');
  const pass = document.querySelector('#pass');
  if(pass.getAttribute("type")==='password'){
    pass.setAttribute("type","text");
  } else{
    pass.setAttribute("type","password")
  }      
  eye.classList.toggle('fa-eye-slash');
    
};
