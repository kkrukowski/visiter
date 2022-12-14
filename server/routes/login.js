const express = require("express");
const { 
  registerValidation, 
  loginValidation } = require("../middlewares/loginHandler");
const router = express.Router();
const {
  homeView,
  loginView,
  registerView,
  forgetPasswordView,
  loginUser,
  registerUser,
  logOutUser
} = require("../controller/loginController");
const {
  isLoggedIn,
  isLoggedOut
} = require("../middlewares/authHandler");



router.get("/home", isLoggedIn, homeView);
router.get("/login", isLoggedOut, loginView)
router.get("/register", isLoggedOut, registerView);
router.get("/forget", isLoggedOut, forgetPasswordView);

router.post("/login", loginValidation, loginUser)
router.post("/register", registerValidation, registerUser)

router.post("/logout", isLoggedIn, logOutUser);

module.exports = router;
