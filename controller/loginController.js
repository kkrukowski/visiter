const User = require("../models/User");
const bcrypt = require("bcrypt");
const passport = require("passport");
const Business = require("../models/Business");
const e = require("express");

const normalize = (string) => {
  const newString = string.charAt(0).toUpperCase() +
  string.slice(1).toLowerCase();
  return newString;
}

const homeView = (req, res) => {
  Business.findOne({ "ownerId" : req.user._id }, (err, business) => {
    if (err) {
      const message = "Coś poszło nie tak."
      return res.render("home", {business, user, message}); //dodac error message
    }
    const user = req.user;
    const message = "";
    return res.render("home", { business, user, message});
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

const generateInvCode = async () => {
  let code = "#";
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  const codeExists = await User.findOne({ invCode: code });

  if (codeExists) {
    return generateInvCode()
  }
  else {
    return code;
  }
}

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
    const newUser = new User({
      email: req.body.email.toLowerCase(),
      name: normalize(req.body.name),
      surname: normalize(req.body.surname),
      //sex: normalize(req.body.sex),  zrobic checkboxa w rejestracji (front) - domyslna wartosc; Mężczyzna w modelu
      country: normalize(req.body.country),
      city: normalize(req.body.city),
      phone: req.body.phone,
      password: hashedPasword,
      invCode: await generateInvCode(),
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
