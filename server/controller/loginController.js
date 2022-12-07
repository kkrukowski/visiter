const User = require("../models/User");
const bcrypt = require("bcrypt");
const passport = require("passport");


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

const loginUser = (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return res.status(400).json({ errors: err });
    }
    if (!user) {
      return res.status(400).json({ errors: "User not found!" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(400).json({ errors: err });
      }
        res.render("home");
    });
  })(req, res, next);
};

const registerUser = async (req, res) => {

  const userExists = await User.findOne({ email: req.body.email.toLowerCase() });
  if (userExists) {
    return res.status(400).json({ message: "User already exists." });
  };

  try {
    console.log(req.body.password);
    const hashedPasword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      id: Date.now().toString(),
      email: req.body.email.toLowerCase(),
      password: hashedPasword,
      role: "User"
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
