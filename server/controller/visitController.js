const Business = require("../models/Business");
const User = require("../models/User");
const Visit = require("../models/Visit");

const moment = require("moment");

// test id - 63bd2f8b35c597866c9fe176
const getAllClientVisits = (req, res) => {
  const userId = req.params.id;
  User.findById(userId, (err, user) => {
    if (err) return res.send(err);
    return res.render("clientVisits", { user: user, visits: user.visits });
  });
};

// const getWorkerSchedule = () => {};

const addVisitToClient = (req, res) => {
  const userId = req.params.id;
  const visitDate = moment().set({
    year: 2023,
    month: 1,
    date: 18,
    hour: 10,
    minute: 30,
    second: 0,
  });
  // Create new Visit
  const visit = new Visit({
    createdAt: moment(),
    visitDate: visitDate,
    businessId: "id",
    workerId: "id",
    service: "service",
    status: "waiting",
  });
  const update = { $push: { visits: visit } };
  // Update visits for user
  User.findByIdAndUpdate(userId, update, (err, user) => {
    if (err) return res.send(err);
    console.log(user);
    return res.send("Added visit");
  });
};

// const addVisitToWorker = () => {};

module.exports = { getAllClientVisits, addVisitToClient };
