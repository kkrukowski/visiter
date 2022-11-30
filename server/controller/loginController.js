const express = require("express");
const app = express();
const User = require("../models/User");
const session = require("express-session");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy


app.use(express.json());
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);


// AUTHENTICATION

app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser((user, done) => done(null, user.id))

passport.deserializeUser(function (id, done){
  User.findById(id, function (err, user){
    done(err, user);
  });
}); 

passport.use(new LocalStrategy(function (emailUser, password, done){
  console.log("dziala");
  User.findOne({ email: emailUser }, function(err, user){
    if(err) { 
      return done(err);
    }
    if(!user){
      return done(null, false, { message: "Nieprawdiłowy mail."});
    }
    bcrypt.compare(password, user.password, function(err, res){
      if(err){
        return done(err);
      }
      if(res == false){
        return done(null, false, {message: "Nieprawidłowe hasło."});
      }
      return done(null, user);
    });
  });
}));
//  ----



const loginView = (req, res) => {
  res.render("login");
};

const registerView = (req, res) => {
  res.render("register");
};

const forgetPasswordView = (req, res) => {
  res.render("forgetPassword");
};

const loginUser = (req, res) =>{
  passport.authenticate('local',{
    successRedirect: '/register',
    failureRedirect: '/register'
  })
  console.log("logged")
}

const registerUser = async (req, res) => {
  try{
    console.log(req.body.password);
    const hashedPasword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      id: Date.now().toString(),
      email: req.body.email,
      password: hashedPasword,
      role: "User"
    })
    console.log(newUser);
    newUser.save();
    res.redirect("/login");
  }
  catch{
    res.redirect("/register");
  }
}
module.exports = {
  loginView,
  registerView,
  forgetPasswordView,
  registerUser,
  loginUser
};
