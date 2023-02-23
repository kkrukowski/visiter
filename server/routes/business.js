const express = require("express");
const router = express.Router();
const {
  registerView,
  registerBusiness,
  homeView,
  getAllBusiness,
  getBusiness,
  addOpinion,
  addWorker,
  removeWorker,
  addService,
  removeService,
} = require("../controller/businessController");

const { isLoggedIn, isLoggedOut } = require("../middlewares/authHandler");

//register
router.get("/register", isLoggedIn, registerView);
router.post("/register", isLoggedIn, registerBusiness);

//views
router.get("/search", isLoggedIn, getAllBusiness);
router.get("/:id", isLoggedIn, getBusiness);
router.get("/myBusiness/:id", isLoggedIn, homeView);

//opinions
router.post("/:id/opinion", isLoggedIn, addOpinion);

//workers
router.post("/myBusiness/:id/addWorker", isLoggedIn, addWorker);
router.post(
  "/myBusiness/:idBusiness/:id/removeWorker",
  isLoggedIn,
  removeWorker
);

//services
router.post(
  "/myBusiness/:idBusiness/:id/removeService",
  isLoggedIn,
  removeService
);
router.post("/myBusiness/:id/addService", isLoggedIn, addService);

module.exports = router;
