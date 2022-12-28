const express = require("express");
const {
  registerValidation,
  loginValidation,
} = require("../middlewares/loginHandler");
const router = express.Router();
const {
  homeView,
  loginView,
  registerView,
  forgetPasswordView,
  loginUser,
  registerUser,
  logOutUser,
  addOpinion,
  getUser
} = require("../controller/loginController");
const { isLoggedIn, isLoggedOut } = require("../middlewares/authHandler");

router.get("/", isLoggedIn, homeView);

router.get("/login", isLoggedOut, loginView);
router.get("/register", isLoggedOut, registerView);
router.get("/reset-password", isLoggedOut, forgetPasswordView);
router.get("/", isLoggedOut, loginView);

router.get("/:id", isLoggedIn, getUser);
router.post("/:id/opinion", isLoggedIn, addOpinion);

router.post("/login", loginValidation, loginUser);
router.post("/register", registerValidation, registerUser);
router.post("/logout", isLoggedIn, logOutUser);

module.exports = router;
