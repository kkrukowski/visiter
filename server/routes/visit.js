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
router.post(
  "/add/client/:clientId/worker/:workerId/business/:businessId/service/:serviceId",
  createVisit
);

module.exports = router;
