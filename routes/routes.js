const express = require("express");
const router = express.Router();

const { homeView } = require("../controller/loginController");
const { isLoggedIn, isLoggedOut } = require("../middlewares/authHandler");

router.get("*", (req, res) => {
  res.send("404");
});

module.exports = router;
