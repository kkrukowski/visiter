const Business = require('../models/Business');

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}
function isLoggedOut(req, res, next) {
  if (!req.isAuthenticated()) return next();
  res.redirect("/");
}
function isOwner(req, res, next) {
  Business.findById(req.params.id, (err, business) => {
    if (err) return res.render("home", { business, user: req.user, message: "Coś poszło nie tak." });

    try{
      if (business.ownerId.equals(req.user._id)) return next();
    
      const message= "Nie jesteś właścicielem tej firmy."
      return res.render("home", { business, user: req.user, message }); //dodac wyszukanie firmy
    }
    catch{
      return res.render("home", { business, user: req.user, message: "Coś poszło nie tak." }); //dodac wyszukanie firmy
    }
  });
}

module.exports = {
  isLoggedIn,
  isLoggedOut,
  isOwner
};
