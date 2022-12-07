const express = require("express");
const {
  homeView,
  loginView,
  registerView,
  forgetPasswordView,
  loginUser,
  registerUser
} = require("../controller/loginController");
const router = express.Router();


function isLoggedIn(req, res, next){
  console.log("check");
  if(req.isAuthenticated()) return next();
  res.redirect('/login');
}
function isLoggedOut(req, res, next){
  if(!req.isAuthenticated()) return next();
  res.redirect('/home');
}

router.get("/home", isLoggedIn, homeView);
router.get("/login", isLoggedOut, loginView)
router.get("/register", isLoggedOut, registerView);
router.get("/forget", isLoggedOut, forgetPasswordView);

router.post("/login", loginUser)
router.post("/register", registerUser)

module.exports = router;
