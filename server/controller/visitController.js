const Business = require("../models/Business");
const User = require("../models/User");
const Visit = require("../models/Visit");
const Service = require("../models/Service");
const ObjectId = require("mongoose").Types.ObjectId;

const moment = require("moment");

const { getAvailableHours } = require("../middlewares/visitHandler");

// test id - 63bd2f8b35c597866c9fe176
// test business id - 63b7015741e1b4cc6ecc9b62
const getAllClientVisits = (req, res) => {
  // Get array of visits ids
  const clientId = req.params.id;
  User.findById(clientId, (err, user) => {
    if (err) return res.send(err);
    // Get visits data
    const visitsIds = user.clientVisits;
    Visit.find({ id: visitsIds }, (err, visits) => {
      if (err) return res.send(err);
      return res.render("clientVisits", {
        user: user,
        visits: visits,
      });
    });
  });
};

const getAllWorkerVisits = (req, res) => {
  const workerId = req.params.workerId;
  if (ObjectId.isValid(workerId)) {
    User.findById(workerId, (err, user) => {
      if (err) return res.send(err);
      // Get worker visits
      const visitsIds = user.workerVisits;
      const dateNow = moment();
      Visit.find(
        { id: visitsIds, visitDate: { $gt: dateNow } },
        (err, visits) => {
          if (err) return res.send(err);
          console.log(visits);
          return res.send(visits);
          // return res.render("clientVisits", {
          //   user: user,
          //   workerVisits: visits,
          // });
        }
      );
    });
  }
};

// const getWorkerSchedule = () => {};

const createVisit = (req, res) => {
  console.log("Create");
  // Create new Visit
  const clientId = req.params.clientId;
  const workerId = req.params.workerId;
  const businessId = req.params.businessId;
  const serviceId = req.params.serviceId;

  if (
    ObjectId.isValid(clientId) &&
    ObjectId.isValid(workerId) &&
    ObjectId.isValid(businessId) &&
    ObjectId.isValid(serviceId)
  ) {
    const visitDate = moment().set({
      year: 2023,
      month: 1,
      date: 23,
      hour: 10,
      minute: 30,
      second: 0,
    });
    // Create new Visit
    const newVisit = new Visit({
      createdAt: moment(),
      visitDate: visitDate,
      businessId: businessId,
      workerId: workerId,
      clientId: clientId,
      serviceId: serviceId,
      status: "waiting",
    });

    newVisit.save((err, visit) => {
      if (err) return handleError(err);
      // Add to client's visits list
      const clientUpdate = { $push: { clientVisits: visit.id } };
      // Update visits for user
      const updatedClient = User.findByIdAndUpdate(
        clientId,
        clientUpdate,
        (err, client) => {
          if (err) return res.send(err);
        }
      );

      // Add to worker's visits list
      const workerUpdate = { $push: { workerVisits: visit.id } };
      // Update visits for user
      const updatedWorker = User.findByIdAndUpdate(
        workerId,
        workerUpdate,
        (err, client) => {
          if (err) return res.send(err);
        }
      );

      return res.send("Visit successfully added!");
    });
  } else {
    return res.status(404).send({ err: "ID is not valid!" });
  }
};

const getAllServiceDates = (req, res) => {
  const serviceId = req.params.serviceId;
  if (ObjectId.isValid(serviceId)) {
    Service.findById(serviceId, (err, service) => {
      if (err) return res.send(err);
      const businessId = service.businessId;
      Business.findById(businessId, (err, business) => {
        if (err) return res.send(err);
        const workersIds = business.workers;
        console.log("IDS: ", workersIds);
        Visit.find({ workerId: workersIds }).then((visits) => {
          console.log(visits);
          const currentUser = req.user;
          const serviceDuration = service.duration;
          const datesInfo = getAvailableHours(serviceDuration);
          return res.render("visit", {
            user: currentUser,
            business,
            workers,
            service,
            datesInfo,
          });
        });
      });
    });
  }
};

const getServicesDatesForWorker = (req, res) => {};

module.exports = {
  getAllClientVisits,
  getAllWorkerVisits,
  createVisit,
  getAllServiceDates,
  getServicesDatesForWorker,
};
