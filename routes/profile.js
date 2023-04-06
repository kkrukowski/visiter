const express = require("express");
const router = express.Router();

const { getUser, addOpinion, editProfile, removeOpinion, removeProfile } = require("../controller/profileController");

const { isLoggedIn, isLoggedOut, isSameUser } = require("../middlewares/authHandler");

router.get("/:id", isLoggedIn, getUser);

router.post("/:id/addOpinion", isLoggedIn, addOpinion);
router.post("/:id/:idOpinion/removeOpinion", [isLoggedIn, isSameUser], removeOpinion)

router.post("/:id/edit/removeProfile", [isLoggedIn, isSameUser], removeProfile)

router.post("/:id/edit", [isLoggedIn, isSameUser], editProfile);

module.exports = router;