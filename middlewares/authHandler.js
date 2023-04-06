const Business = require('../models/Business');
const User = require('../models/User');

async function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.render("login", { message: "Musisz być zalogowany." });
}
async function isLoggedOut(req, res, next) {
  if (!req.isAuthenticated()) return next();
  return res.render("home", {
    user: req.user,
    business: req.user.role == "Owner" ? await Business.find({ ownerId: req.user._id }).exec() : await Business.find({ workers: req.user._id }).exec(),
    message: "Jesteś zalogowany."
  });
}
async function isOwner(req, res, next) {
  try {
    const business = await Business.findOne({ _id: req.params.id }).exec();
    if (business.ownerId.equals(req.user._id))
      return next();
    throw new Error("Nie jesteś właścicielem tej firmy.");
  } catch (err) {
    return res.render("home", {
      user: req.user,
      business: req.user.role == "Owner" ? await Business.find({ ownerId: req.user._id }).exec() : await Business.find({ workers: req.user._id }).exec(),
      message: err
    });
  }
}

async function isSameUser(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    const userByParams = await User.findById(req.params.id);

    if(user == userByParams) return next();

    throw new Error("Nie posiadasz uprawnień do tego konta.");
  } catch (err){
    return res.status(401).render("home", {
      user: req.user,
      business: req.user.role == "Owner" ? await Business.findOne({ ownerId: req.user._id }).exec() : await Business.findOne({ workers: req.user._id }).exec(),
      message: err.message
    });
  }
}

module.exports = {
  isLoggedIn,
  isLoggedOut,
  isOwner,
  isSameUser
};
