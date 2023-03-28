var validator = require("validator");
const { loginView, registerView } = require("../controller/loginController");

const registerValidation = (req, res, next) => {
  if (!validator.isEmail(req.body.email)) {
    message = "Email musi być poprawny.";
    return registerView(req, res, "", message);
  }
  if (!validator.isAlpha(req.body.name, "pl-PL")) {
    message = "Imie powinno składać się z normalnych znaków.";
    return registerView(req, res, "", message);
  }
  if (!validator.isAlpha(req.body.surname, "pl-PL")) {
    message = "Nazwisko powinno składać się z normalnych znaków.";
    return registerView(req, res, "", message);
  }
  if (!validator.isLength(req.body.password, { min: 5, max: undefined })) {
    message = "Hasło powinno mieć przynajmniej 5 znaków.";
    return registerView(req, res, "", message);
  }
  return next();
};

const loginValidation = (req, res, next) => {
  if (!validator.isEmail(req.body.username)) {
    message = "Email musi być poprawny.";
    return loginView(req, res, "", message);
  }
  return next();
};

module.exports = {
  registerValidation,
  loginValidation,
};
