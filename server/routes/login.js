const express = require("express");
const {
  loginView,
  registerView,
  forgetPasswordView,
} = require("../controller/loginController");
const router = express.Router();

router.get("/login", loginView);
router.get("/register", registerView);
router.get("/forget", forgetPasswordView);

module.exports = router;
