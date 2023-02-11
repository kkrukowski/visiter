const express = require("express");
const router = express.Router();

const {
  getAllClientVisits,
  createVisit,
} = require("../controller/visitController");

router.get("/:id", getAllClientVisits);
router.post("/add/client/:clientId", createVisit);

module.exports = router;
