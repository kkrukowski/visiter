const User = require("../models/User");
const bcrypt = require("bcrypt");
const passport = require("passport");



const homeView = (req, res) => {
  res.render("home");
};

const loginView = (req, res, err = "", message="") => {
  res.render("login", {
    message: message
  });
};

const registerView = (req, res, err = "", message="") => {
  res.render("register", {
    message: message
  });
};

const forgetPasswordView = (req, res) => {
  res.render("forgetPassword");
};

const loginUser = (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      message = "Błędne hasło.";
      return loginView(req, res, err, message);
    }
    if (!user) {
      message = "Błędny email lub hasło.";
      return loginView(req, res, err, message);
    }
    req.logIn(user, (err) => {
      if (err) {
        message = "Błąd z logowaniem.";
        return loginView(req, res, err, message);
      }
        return homeView(req, res);
    });
  })(req, res, next);
};

const registerUser = async (req, res) => {

  const userExists = await User.findOne({ email: req.body.email.toLowerCase() });
  if (userExists) {
    message = "Użytkownik już istnieje."
    console.log(message)
    return registerView(req, res, "", message);
  };

  try {
    console.log(req.body.password);
    const hashedPasword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      id: Date.now().toString(),
      email: req.body.email.toLowerCase(),
      username: req.body.username,
      secondname: req.body.secondname,
      sex: req.body.plec,
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
