const express = require("express");
const app = express();
const port = 5000;

const path = require("path");

app.get("/", function (req, res) {
  console.log(path.join(__dirname, "/index.html"));
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.listen(port, () => {
  console.log(`Server started on port ${port}!`);
});
