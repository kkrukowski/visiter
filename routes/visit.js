const express = require("express");
const router = express.Router();

const {
  getAllClientVisits,
  getAllWorkerVisits,
  getAllServiceDates,
  getServicesDatesForWorker,
  getAvailableHoursForWorker,
  createVisit,
} = require("../controller/visitController");

router.get("/", getAllClientVisits);
router.get("/book/:serviceId", getAllServiceDates);
router.get(
  "/book/:serviceId/day/:day/month/:month/year/:year",
  getAllServiceDates
);
router.get("/book/:serviceId/worker/:workerId", getAllServiceDates);
router.get(
  "/book/:serviceId/worker/:workerId/day/:day/month/:month/year/:year/hour/:hour/minute/:minute",
  getAvailableHoursForWorker
);
router.get(
  "/book/:serviceId/worker/:workerId/day/:day/month/:month/year/:year",
  getAvailableHoursForWorker
);
router.post(
  "/book/:serviceId/worker/:workerId/day/:day/month/:month/year/:year/hour/:hour/minute/:minute",
  createVisit
);

module.exports = router;
