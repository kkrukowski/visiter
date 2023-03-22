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
  editService,
  editProfile,
  removeBusiness
} = require("../controller/businessController");

const { isLoggedIn, isLoggedOut, isOwner } = require("../middlewares/authHandler");

//register
router.get("/register", isLoggedIn, registerView);
router.post("/register", isLoggedIn, registerBusiness);

//views
router.get("/search", isLoggedIn, getAllBusiness);
router.get("/:id", isLoggedIn, getBusiness);
router.get("/myBusiness/:id", [isLoggedIn, isOwner], homeView);

//opinions
router.post("/:id/opinion", isLoggedIn, addOpinion);

//workers
router.post("/myBusiness/:id/addWorker", [isLoggedIn, isOwner], addWorker);
router.post(
  "/myBusiness/:id/:idWorker/removeWorker",
  [isLoggedIn, isOwner],
  removeWorker
);

//services
router.post(
  "/myBusiness/:id/:idService/removeService",
  [isLoggedIn, isOwner],
  removeService
);
router.post("/myBusiness/:id/addService", [isLoggedIn, isOwner], addService);

router.post("/myBusiness/:id/editService/:idService", [isLoggedIn, isOwner], editService);

//editProfile
router.post("/myBusiness/:id/edit", [isLoggedIn, isOwner], editProfile);

router.post("/myBusiness/:id/removeBusiness", [isLoggedIn, isOwner], removeBusiness);

module.exports = router;
