const express = require("express");
const router = express.Router();
const passport = require("passport");

router.post("/login", (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return res.status(400).json({ errors: err });
    }
    if (!user) {
      return res.status(400).json({ errors: "User not found!" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(400).json({ errors: err });
      }
      return res.status(200).json({ success: "Logged in" });
    });
  })(req, res, next);
});

module.exports = router;
