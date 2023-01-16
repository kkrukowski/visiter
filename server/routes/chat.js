const express = require("express");
const router = express.Router();
// Database - mongodb
const mongoose = require("mongoose");

const { isLoggedIn, isLoggedOut } = require("../middlewares/authHandler");

router.get("/chat", isLoggedIn, (req, res) => {
  userId = req.user._id.toString();
  res.render("chat", {
    name: req.user.name,
    userDbId: userId,
  });
});

router.get("/chat/:id", isLoggedIn, (req, res) => {
  userId = req.user._id.toString();
  receiverId = req.params.id;
  res.render("chat", {
    name: req.user.name,
    userDbId: userId,
    receiverId: receiverId,
  });
});

module.exports = router;
