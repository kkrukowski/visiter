const app = express();
const User = require("../models/User");

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: trueS,
  })
);
app.use(express.json());

const loginView = (req, res) => {
  res.render("login");
};

const registerView = (req, res) => {
  res.render("register");
};

const forgetPasswordView = (req, res) => {
  res.render("forgetPassword");
};

module.exports = {
  loginView,
  registerView,
  forgetPasswordView,
};
