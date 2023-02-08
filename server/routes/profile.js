const express = require("express");
const router = express.Router();

const { getUser, addOpinion, editProfileView } = require("../controller/profileController");

const { isLoggedIn, isLoggedOut } = require("../middlewares/authHandler");

router.get("/:id", isLoggedIn, getUser);
router.post("/:id/addOpinion", isLoggedIn, addOpinion);
router.get("/:id/edit", isLoggedIn, editProfileView)

module.exports = router;