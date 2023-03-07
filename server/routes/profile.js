const express = require("express");
const router = express.Router();

const { getUser, addOpinion, editProfile, removeOpinion, removeProfile } = require("../controller/profileController");

const { isLoggedIn, isLoggedOut } = require("../middlewares/authHandler");

router.get("/:id", isLoggedIn, getUser);

router.post("/:id/addOpinion", isLoggedIn, addOpinion);
router.post("/:id/:idOpinion/removeOpinion", isLoggedIn, removeOpinion)

router.post("/:id/edit/removeProfile", isLoggedIn, removeProfile)


router.post("/:id/edit", isLoggedIn, editProfile);

module.exports = router;