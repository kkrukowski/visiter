const User = require("../models/User");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;


// AUTHENTICATION
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new LocalStrategy(function (username, password, done) {
    console.log("dziala");
    User.findOne({ email: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Nieprawdiłowy mail." });
      }
      bcrypt.compare(password, user.password, function (err, res) {
        if (err) {
          return done(err);
        }
        if (res == false) {
          return done(null, false, { message: "Nieprawidłowe hasło." });
        }
        return done(null, user);
      });
    });
  })
);

module.exports = passport

