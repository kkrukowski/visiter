const User = require("../models/User");
const bcrypt = require("bcrypt");
const passport = require("passport");
const Business = require("../models/Business");

const normalize = (string) => {
  const newString = string.charAt(0).toUpperCase() +
    string.slice(1).toLowerCase();
  return newString;
}

const homeView = async (req, res) => {
  try {
    const business = await Business.findOne({ "ownerId": req.user._id }).exec();
    return res.render("home", {
      business,
      user: req.user,
      message: ""
    });
  } catch (err) {
    return res.render("home", {
      business: false,
      user: req.user,
      message: "Coś poszło nie tak"
    });
  }
};

const loginView = (req, res,) => {
  return res.render("login", {
    message: ""
  });
};

const registerView = (req, res,) => {
  return res.render("register", {
    message: ""
  });
};

const forgetPasswordView = (req, res) => {
  return res.render("forgetPassword");
};

const loginUser = (req, res, next) => {
  try {
    passport.authenticate("local", function (err, user, info) {
      // Password error
      if (err) return res.render("login", { message: "Nieprawidłowe hasło." });
      // Mail error
      if (!user) return res.render("login", { message: "Nieprawidłowe dane." });
      req.logIn(user, async (err) => {
        if (err) return res.render("login", { message: "Błąd podczas logowania." });
        return res.render("home", {
          user: req.user,
          business: req.user.role == "Owner" ? await Business.findOne({ ownerId: req.user._id }).exec() : await Business.findOne({ workers: req.user._id }).exec(),
          message: ""
        });
      });
    })(req, res, next);
  } catch (err) {
    return res.render("login", {
      message: err
    });
  }
};

const logOutUser = (req, res) => {
  try {
    req.logOut(function (err) {
      if (err) return next(err);
      return res.render("login", {
        message: "Wylogowano."
      });
    });
  } catch (err) {
    return next(err);
  }
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
    return res.render("login", {
      message: "Konto utworzone."
    });
  } catch {
    return res.render("register", {
      message: "Błąd przy tworzeniu konta."
    });
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
