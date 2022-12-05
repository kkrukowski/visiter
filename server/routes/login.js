const express = require("express");
const {
  homeView,
  loginView,
  registerView,
  forgetPasswordView,
  registerUser,
  loginUser,
} = require("../controller/loginController");
const router = express.Router();

/*
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect('/login');
}
function isLoggedOut(req, res, next){
  if(!req.isAuthenticated()) return next();
  res.redirect('/');
}
*/
router.get("/home", homeView);

router.get("/login", loginView);
router.get("/register", registerView);
router.get("/forget", forgetPasswordView);

router.post("/register", registerUser);
router.post("/login/password", loginUser);

module.exports = router;
