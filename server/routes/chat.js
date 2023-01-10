const express = require("express");
const router = express.Router();
// Database - mongodb
const mongoose = require("mongoose");

const { isLoggedIn, isLoggedOut } = require("../middlewares/authHandler");

router.get("/chat", isLoggedIn, (req, res) => {
  res.send("chat");
  // userId = req.user._id.toString();
  // res.render("chat", {
  //   username: req.user.username,
  //   userDbId: userId,
  // });
});

module.exports = router;
