const express = require("express");
const router = express.Router();

const {
  getAllClientVisits,
  addVisitToClient,
} = require("../controller/visitController");

router.get("/:id", getAllClientVisits);
router.post("/client/add/:id", addVisitToClient);

module.exports = router;
