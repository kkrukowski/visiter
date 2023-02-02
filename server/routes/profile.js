const express = require("express");
const router = express.Router();

const { getUser, addOpinion } = require("../controller/profileController");

const { isLoggedIn, isLoggedOut } = require("../middlewares/authHandler");

router.get("/:id", isLoggedIn, getUser);
router.post("/:id/addOpinion", isLoggedIn, addOpinion);

module.exports = router;