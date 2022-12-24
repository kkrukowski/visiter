const User = require("../models/User");
const bcrypt = require("bcrypt");
const passport = require("passport");

const homeView = (req, res) => {
  res.render("home");
};

const loginView = (req, res, err = "", message = "") => {
  res.render("login", {
    message: message,
  });
};

const registerView = (req, res, err = "", message = "") => {
  res.render("register", {
    message: message,
  });
};

const forgetPasswordView = (req, res) => {
  res.render("forgetPassword");
};

const loginUser = (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    // Password error
    if (err) {
      message = info.message;
      return loginView(req, res, err, message);
    }
    // Mail error
    if (!user) {
      message = info.message;
      return loginView(req, res, err, message);
    }
    req.logIn(user, (err) => {
      if (err) {
        message = "Błąd z logowaniem.";
        return loginView(req, res, err, message);
      }
      return res.redirect("/");
    });
  })(req, res, next);
};

const logOutUser = (req, res) => {
  console.log("WYLOGOWANO");
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    message = "Wylogowano.";
    return loginView(req, res, "", message);
  });
};

const registerUser = async (req, res) => {
  console.log("przeszlo");
  const userExists = await User.findOne({
    email: req.body.email.toLowerCase(),
  });
  if (userExists) {
    message = "Użytkownik już istnieje.";
    console.log(message);
    return registerView(req, res, "", message);
  }

  try {
    const hashedPasword = await bcrypt.hash(req.body.password, 10);
    correctUsername =
      req.body.username.charAt(0).toUpperCase() +
      req.body.username.slice(1).toLowerCase();
    correctSecondname =
      req.body.secondname.charAt(0).toUpperCase() +
      req.body.secondname.slice(1).toLowerCase();

    const newUser = new User({
      email: req.body.email.toLowerCase(),
      username: correctUsername,
      secondname: correctSecondname,
      sex: req.body.plec,
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
  logOutUser
};
