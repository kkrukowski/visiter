const express = require("express");
const app = express();
const User = require("../models/User");
const session = require("express-session");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;


const homeView = (req, res) => {
  res.render("home");
};

const loginView = (req, res) => {
  res.render("login");
};

const registerView = (req, res) => {
  res.render("register");
};

const forgetPasswordView = (req, res) => {
  res.render("forgetPassword");
};

const loginUser = (req, res) => {
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/register",
  });
  console.log("logged");
};

const registerUser = async (req, res) => {
  try {
    console.log(req.body.password);
    const hashedPasword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      id: Date.now().toString(),
      email: req.body.email,
      password: hashedPasword,
      role: "User",
    });
    console.log(newUser);
    newUser.save();
    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
};
module.exports = {
  homeView,
  loginView,
  registerView,
  forgetPasswordView,
  registerUser,
  loginUser,
};
