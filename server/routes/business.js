const express = require("express");
const router = express.Router();
const {
    registerView, 
    registerBusiness, 
    homeView, 
    refreshRole,
    getAllBusiness,
    getBusiness,
    addOpinion,
    addWorker,
    removeWorker
} = require("../controller/businessController")

const { isLoggedIn, isLoggedOut } = require("../middlewares/authHandler");

router.get("/myBusiness/:id", isLoggedIn, homeView);
router.get("/register", isLoggedIn, registerView);

router.post("/myBusiness/:idBusiness/:id/removeWorker", isLoggedIn, removeWorker);

router.post("/register", isLoggedIn, registerBusiness);
router.get("/refreshRole", isLoggedIn, refreshRole);
router.get("/search", isLoggedIn, getAllBusiness);
router.get("/:id", isLoggedIn, getBusiness);

router.post("/:id/opinion", isLoggedIn, addOpinion);
router.post("/myBusiness/:id/addWorker", isLoggedIn, addWorker)

module.exports = router;