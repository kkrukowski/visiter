const express = require("express");
const router = express.Router();

const { isLoggedIn, isLoggedOut } = require("../middlewares/authHandler");

router.get("/chat", isLoggedOut, (req, res) => {
  res.render("chat");
});

module.exports = router;
