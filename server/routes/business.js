const express = require("express");
const router = express.Router();
const {
    registerView, 
    registerBusiness, 
    homeView, 
    refreshRole,
    getAllBusiness
} = require("../controller/businessController")

const { isLoggedIn, isLoggedOut } = require("../middlewares/authHandler");

router.get("/", isLoggedIn, homeView);
router.get("/register", isLoggedIn, registerView);

router.post("/register", isLoggedIn, registerBusiness);
router.get("/refreshRole", isLoggedIn, refreshRole);
router.get("/search", isLoggedIn, getAllBusiness);

module.exports = router;