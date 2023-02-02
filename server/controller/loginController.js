const User = require("../models/User");
const bcrypt = require("bcrypt");
const passport = require("passport");
const Business = require("../models/Business");

const homeView = (req, res) => {
  Business.findOne({ "owner._id": req.user._id }, (err, business) => {
    if (err) {
      return res.render("home");
    }
    const user = req.user;
    return res.render("home", { business, user });
  });
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
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    message = "Wylogowano.";
    return loginView(req, res, "", message);
  });
};

const registerUser = async (req, res) => {
  const userExists = await User.findOne({
    email: req.body.email.toLowerCase(),
  });
  if (userExists) {
    message = "Użytkownik już istnieje.";
    return registerView(req, res, "", message);
  }

  try {
    const hashedPasword = await bcrypt.hash(req.body.password, 10);
    correctName =
      req.body.name.charAt(0).toUpperCase() +
      req.body.name.slice(1).toLowerCase();
    correctSurname =
      req.body.surname.charAt(0).toUpperCase() +
      req.body.surname.slice(1).toLowerCase();

    const newUser = new User({
      email: req.body.email.toLowerCase(),
      name: correctName,
      surname: correctSurname,
      sex: req.body.plec,
      password: hashedPasword,
      role: "User",
    });
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
