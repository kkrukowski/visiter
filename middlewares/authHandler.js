const Business = require('../models/Business');

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
    const business = await Business.findById(req.params.id).exec();
    if (business.ownerId.equals(req.user_id))
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

module.exports = {
  isLoggedIn,
  isLoggedOut,
  isOwner
};
