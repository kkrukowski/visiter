const express = require("express");
const router = express.Router();

const { getUser, addOpinion, editProfileView, editProfile, removeOpinion } = require("../controller/profileController");

const { isLoggedIn, isLoggedOut } = require("../middlewares/authHandler");

router.get("/:id", isLoggedIn, getUser);

router.post("/:id/addOpinion", isLoggedIn, addOpinion);
router.post("/:id/:idOpinion/removeOpinion", isLoggedIn, removeOpinion)


router.get("/:id/edit", isLoggedIn, editProfileView);
router.post("/:id/edit", isLoggedIn, editProfile);

module.exports = router;