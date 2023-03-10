const Business = require("../models/Business");
const User = require("../models/User");
const Visit = require("../models/Visit");
const Service = require("../models/Service");
const ObjectId = require("mongoose").Types.ObjectId;

const moment = require("moment");

const {
  getAvailableHours,
  isAbleToBook,
} = require("../middlewares/visitHandler");

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
  // Create new Visit
  const workerId = req.params.workerId;
  const clientId = req.user.id;
  const serviceId = req.params.serviceId;
  const { year, hour, minute } = req.params;
  const day = req.params.day;
  const month = req.params.month;

  if (ObjectId.isValid(workerId) && ObjectId.isValid(serviceId)) {
    Service.findById(serviceId)
      .then((serviceInfo) => {
        const visitDate = moment().set({
          year: year,
          month: month,
          date: day,
          hour: hour,
          minute: minute,
          second: 0,
        });

        // Create new Visit
        const newVisit = new Visit({
          createdAt: moment(),
          visitDate: visitDate,
          businessId: serviceInfo.businessId,
          workerId: workerId,
          clientId: clientId,
          serviceId: serviceId,
          status: "waiting",
        });

        const serviceDuration = serviceInfo.duration;

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
              // Add to worker's visits list
              const workerUpdate = { $push: { workerVisits: visit.id } };
              // Update visits for user
              const updatedWorker = User.findByIdAndUpdate(
                workerId,
                workerUpdate,
                (err, client) => {
                  if (err) return res.send(err);
                  // Edit worker's availability
                  const date = new Date(year, month, day, 0, 0, 0);
                  const time = hour + ":" + minute;
                  User.findById(workerId, (err, worker) => {
                    if (err) res.send(err);
                    const workerBusyAvailabilityDates =
                      getWorkerAvailabilityDates(worker, date);
                    console.log(
                      isAbleToBook(
                        workerBusyAvailabilityDates,
                        serviceDuration,
                        time
                      )
                    );
                    const updateAvailability = User.updateOne(
                      {
                        _id: ObjectId(workerId),
                        "workerBusyAvailability.date": date,
                      },
                      {
                        $addToSet: {
                          "workerBusyAvailability.$.hours": time,
                        },
                      },
                      (err, availability) => {
                        if (err) return res.send(err);
                        if (availability.modifiedCount === 0) {
                          User.updateOne(
                            {
                              _id: ObjectId(workerId),
                            },
                            {
                              $addToSet: {
                                workerBusyAvailability: {
                                  date: date,
                                  hours: [time],
                                },
                              },
                            },
                            (err, availability) => {
                              if (err) return res.send(err);
                            }
                          );
                        }
                      }
                    );
                  });
                }
              );
            }
          );
          return res.send("Visit successfully added!");
        });
      })
      .catch((err) => {
        if (err) return res.status(404).send({ err });
      });
  } else {
    return res.status(404).send({ err: "ID is not valid!" });
  }
};

const getAvailableHoursForWorker = (req, res) => {
  const workerId = req.params.workerId;
  const serviceId = req.params.serviceId;
  const { year, month, day } = req.params;
  const searchingDate = new Date(year, month, day, 0, 0, 0);
  const currentUser = req.user;
  if (ObjectId.isValid(workerId) && ObjectId.isValid(serviceId)) {
    User.findById(workerId, (err, worker) => {
      if (err) res.send(err);
      const searchingDateObject = getWorkerAvailabilityDates(
        worker,
        searchingDate
      );
      if (searchingDateObject) {
        console.log(searchingDateObject);
        // Get only available hours for this worker
        const busyHours = searchingDateObject[0].hours;
        console.log(busyHours);
        const availableHours = getAvailableHours(busyHours, 9, 17);
        Service.findById(serviceId, (err, service) => {
          if (err) return res.send(err);
          const businessId = service.businessId;
          Business.findById(businessId, (err, business) => {
            if (err) return res.send(err);
            const workersIds = business.workers;
            User.find({ _id: workersIds }).then((workers) => {
              const currentUser = req.user;
              return res.render("visit", {
                user: currentUser,
                business,
                workers,
                selectedWorker: workerId,
                service,
                availableHours,
              });
            });
          });
        });
      }
    });
  }
};

const getWorkerAvailabilityDates = (worker, searchingDate) => {
  const workerBusyAvailabilityDates = worker.workerBusyAvailability;
  console.log(workerBusyAvailabilityDates, searchingDate);
  const searchingDateObject = workerBusyAvailabilityDates.filter(
    (elem) => elem.date.getTime() == searchingDate.getTime()
  );

  return searchingDateObject;
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
        User.find({ _id: workersIds }).then((workers) => {
          const currentUser = req.user;
          return res.render("visit", {
            user: currentUser,
            business,
            workers,
            selectedWorker: null,
            service,
            availableHours: null,
          });
          // Visit.find({ workerId: workersIds }).then((visits) => {
          //   console.log(visits);
          //   const currentUser = req.user;
          //   const serviceDuration = service.duration;
          //   const datesInfo = getAvailableHours(visits, serviceDuration);

          // });
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
  getAvailableHoursForWorker,
  getServicesDatesForWorker,
};
