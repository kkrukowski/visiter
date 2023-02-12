const express = require("express");
const router = express.Router();

const {
  getAllClientVisits,
  getAllWorkerVisits,
  getAllServiceDates,
  createVisit,
} = require("../controller/visitController");

router.get("/:id", getAllClientVisits);
router.get("/book/:serviceId", getAllServiceDates);
router.post("/add/client/:clientId", createVisit);

module.exports = router;
