const Business = require("../models/Business");
const User = require("../models/User");
const Visit = require("../models/Visit");
const Service = require("../models/Service");
const ObjectId = require("mongoose").Types.ObjectId;

const moment = require("moment");

const {
  getAvailableHours,
  isAbleToBook,
  getTimesToUpdate
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

const updateAvailability = (res, workerId, date, time, serviceDuration) => {
  const timesToUpdate = getTimesToUpdate(time, serviceDuration);
  const updateWorker = User.updateOne(
  {
    _id: ObjectId(workerId),
    "workerBusyAvailability.date": date,
  },
  {
    $addToSet: {
      "workerBusyAvailability.$.hours": {$each: timesToUpdate},
    },
  },
  (err, availability) => {
    console.log(timesToUpdate)
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
              hours: timesToUpdate,
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
}

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
                    getWorkerBusyAvailabilityHours(worker, date);
                    if (workerBusyAvailabilityDates.length == 0 ||
                      isAbleToBook(
                        workerBusyAvailabilityDates[0].hours,
                        serviceDuration,
                        time
                      )
                    ){
                      updateAvailability(res, workerId, date, time, serviceDuration)
                    } else {
                      console.log("Date not available")
                    }
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
  // Get params data
  const workerId = req.params.workerId;
  const serviceId = req.params.serviceId;
  let { year, month, day } = req.params;
  // If date not provided set today's date as default
  if (year == null && month == null && day == null){
    year = moment().utc().year();
    month = moment().utc().month();
    day = moment().utc().date()
  }
  const searchingDate = new Date(year, month, day, 0, 0, 0);
  const currentUser = req.user;
  if (ObjectId.isValid(workerId) && ObjectId.isValid(serviceId)) {
    // Get worker data
    User.findById(workerId, (err, worker) => {
      if (err) res.send(err);
        // Get worker busy hours array for searching date
        const busyHours = getWorkerBusyAvailabilityHours(
          worker,
          searchingDate
        );
        const workerAvailabilityInfo = getWorkerBusyAvailabilityDates(worker,
          searchingDate)
        console.log("DATES: ", workerAvailabilityInfo)
        Service.findById(serviceId, (err, service) => {
          if (err) return res.send(err);
          const serviceDuration = service.duration;
          // Get available hours for searching date based on busy hours
          const availableHours = getAvailableHours(serviceDuration, busyHours, 9, 17);
          const businessId = service.businessId;
          Business.findById(businessId, (err, business) => {
            if (err) return res.send(err);
            // Get workers IDs
            const workersIds = business.workers;
            User.find({ _id: workersIds }).then((workers) => {
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
    });
  }
};

const getWorkerBusyAvailabilityHours = (worker, searchingDate) => {
  const workerBusyAvailabilityDates = worker.workerBusyAvailability;
  const workerBusyHours = workerBusyAvailabilityDates.filter(
    (elem) => elem.date.getTime() == searchingDate.getTime()
  );

  if (workerBusyHours.length > 0) {
    return workerBusyHours[0].hours
  }

  return [];
};

const getWorkerBusyAvailabilityDates = (worker, searchingDate) => {
  const workerBusyAvailabilityDates = worker.workerBusyAvailability;
  const startMonth = moment(searchingDate).utc().startOf("month")
  const endMonth = moment(searchingDate).utc().endOf("month")
  // Get worker availability array elements in current month
  console.log("MOMENT: ", startMonth, endMonth)
  const workerAvailabilityInfo = workerBusyAvailabilityDates.filter(
    (elem) => moment(elem.date) >= startMonth && moment(elem.date) <= endMonth
  );

  return workerAvailabilityInfo;
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
