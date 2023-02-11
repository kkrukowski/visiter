const express = require("express");
const router = express.Router();

const { getUser, addOpinion, editProfileView, editProfile } = require("../controller/profileController");

const { isLoggedIn, isLoggedOut } = require("../middlewares/authHandler");

router.get("/:id", isLoggedIn, getUser);
router.post("/:id/addOpinion", isLoggedIn, addOpinion);

router.get("/:id/edit", isLoggedIn, editProfileView);
router.post("/:id/edit", isLoggedIn, editProfile);

module.exports = router;