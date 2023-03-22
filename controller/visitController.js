const Business = require("../models/Business");
const User = require("../models/User");
const Visit = require("../models/Visit");
const Service = require("../models/Service");
const ObjectId = require("mongoose").Types.ObjectId;

const moment = require("moment");
const mongoose = require("mongoose");

const {
  getAvailableHours,
  isAbleToBook,
  getTimesToUpdate,
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

const getAllWorkerVisits = async (req, res) => {
  const workerId = req.params.workerId;

  // Session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get worker data
    const worker = await User.findById(workerId).session(session);
    if (!worker) throw new Error("Worker not found!");

    const visitsIds = worker.workerVisits;
    const dateNow = moment().utc();

    const visitsDate = await Visit.find({
      id: visitsIds,
      visitDate: { $gt: dateNow },
    }).session(session);
    if (!visitsDate) throw new Error("Visits not found!");

    await session.commitTransaction();

    // Return visits
    return res.send(visits);
    // return res.render("clientVisits", {
    //   user: user,
    //   workerVisits: visits,
    // });
  } catch (err) {
    await session.abortTransaction();
    res.send(err);
  } finally {
    session.endSession();
  }
};

const updateAvailability = async (
  res,
  workerId,
  date,
  time,
  serviceDuration
) => {
  // Start transaction's session
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const timesToUpdate = await getTimesToUpdate(time, serviceDuration);

    // Update worker availability
    const worker = await User.findOne({
      _id: ObjectId(workerId),
      "workerBusyAvailability.date": new Date(date),
    }).session(session);
    const updateWorker = await User.updateOne(
      {
        _id: ObjectId(workerId),
        "workerBusyAvailability.date": new Date(date),
      },
      {
        $addToSet: {
          "workerBusyAvailability.$.hours": { $each: timesToUpdate },
        },
      }
    ).session(session);
    if (!updateWorker)
      throw new Error("Worker not found or wrong data provided!");

    // Add new item if not found
    if (updateWorker.modifiedCount === 0) {
      const updateWorker = await User.updateOne(
        {
          _id: ObjectId(workerId),
        },
        {
          $addToSet: {
            workerBusyAvailability: {
              date: new Date(date),
              hours: timesToUpdate,
            },
          },
        }
      ).session(session);
      if (!updateWorker) throw new Error("Updating worker failed!");
    }

    await session.commitTransaction();
    res.send("Success");
  } catch (err) {
    await session.abortTransaction();
    res.send(err);
  } finally {
    session.endSession();
  }
};

const createVisit = async (req, res) => {
  // Create new Visit
  const workerId = req.params.workerId;
  const clientId = req.user.id;
  const serviceId = req.params.serviceId;
  const { year, hour, minute } = req.params;
  const day = req.params.day;
  const month = parseInt(req.params.month) - 1;

  let visitDate = moment()
    .set({
      year: year,
      month: month,
      date: day,
      hour: hour,
      minute: minute,
      second: 0,
      millisecond: 0,
    })
    .utc();

  // Start transaction's session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const serviceInfo = await Service.findById(serviceId).session(session);
    if (!serviceInfo) throw new Error("Service not found!");
    // Create new Visit
    const newVisit = new Visit({
      createdAt: moment().utc(),
      visitDate: visitDate,
      businessId: serviceInfo.businessId,
      workerId: workerId,
      clientId: clientId,
      serviceId: serviceId,
      status: "waiting",
    });
    const serviceDuration = serviceInfo.duration;

    const visit = await newVisit.save({ session });
    if (!visit) throw new Error("Visit not saved!");

    // Add to client's visits list
    const clientUpdate = { $push: { clientVisits: visit.id } };
    // Update visits for user
    const updatedClient = await User.findByIdAndUpdate(clientId, clientUpdate, {
      session,
    });
    if (!updatedClient) throw new Error("Client not updated!");

    // Edit worker's availability
    const time = hour + ":" + minute;

    const worker = await User.findById(workerId).session(session);
    if (!worker) throw new Error("Worker no found!");

    visitDate = visitDate
      .set({
        hour: 0,
        minute: 0,
      })
      .utc();

    const workerBusyAvailabilityDates = await getWorkerBusyAvailabilityHours(
      worker,
      visitDate
    );

    if (
      workerBusyAvailabilityDates.length == 0 ||
      (await isAbleToBook(workerBusyAvailabilityDates, serviceDuration, time))
    ) {
      const updatedAvailability = await updateAvailability(
        res,
        workerId,
        visitDate,
        time,
        serviceDuration
      );
    } else {
      throw new Error("Date is not available!");
    }

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
  } finally {
    session.endSession();
    console.log("Visit successfuly created!");
  }
};

const getAvailableHoursForWorker = async (req, res) => {
  // Get params data
  const workerId = req.params.workerId;
  const serviceId = req.params.serviceId;
  let year = req.params.year;
  const day = req.params.day;
  const month = parseInt(req.params.month) - 1;
  // If date not provided set today's date as default
  if (year == null && month == null && day == null) {
    year = moment().utc().year();
    month = moment().utc().month();
    day = moment().utc().date();
  }
  const searchingDate = moment()
    .set({
      year: year,
      month: month,
      date: day,
      hour: 1,
      minute: 0,
      second: 0,
      millisecond: 0,
    })
    .utc();
  const currentUser = req.user;
  try {
    // Search worker
    const worker = await User.findById(workerId);
    if (!worker) throw new Error("Worker not found!");

    // Get worker busy hours array for searching date
    const busyHours = await getWorkerBusyAvailabilityHours(
      worker,
      searchingDate
    );

    // Get worker availability dates info
    const workerDatesAvailabilityInfo = await getWorkerBusyAvailabilityDates(
      worker,
      searchingDate
    );

    // Get service
    const service = await Service.findById(serviceId);
    if (!service) throw new Error("Service not found!");

    const serviceDuration = service.duration;
    // Get available hours for searching date based on busy hours
    const availableHours = await getAvailableHours(
      serviceDuration,
      busyHours,
      9,
      17
    );

    const businessId = service.businessId;

    // Get business
    const business = await Business.findById(businessId);
    if (!business) throw new Error("Business not found");

    const workersIds = business.workers;

    // Get workers
    const workers = await User.find({ _id: workersIds });

    return res.render("visit", {
      user: currentUser,
      business,
      workers,
      selectedWorker: workerId,
      service,
      date: { year, month: req.params.month, day },
      availableHours,
      workerDatesAvailabilityInfo,
    });
  } catch (err) {
    return res.send(err);
  }
};

const getWorkerBusyAvailabilityHours = async (worker, searchingDate) => {
  const workerBusyAvailabilityDates = worker.workerBusyAvailability;
  const workerBusyHours = await workerBusyAvailabilityDates.filter((elem) =>
    moment(elem.date).utc().isSame(searchingDate)
  );

  if (workerBusyHours.length > 0) return workerBusyHours[0].hours;

  return [];
};

const getWorkerBusyAvailabilityDates = async (worker, searchingDate) => {
  const workerBusyAvailabilityDates = worker.workerBusyAvailability;
  const startMonth = moment(searchingDate).utc().startOf("month");
  const endMonth = moment(searchingDate).utc().endOf("month");
  console.log(searchingDate);
  console.log(startMonth, endMonth);
  // Get worker availability array elements in current month
  const workerAvailabilityInfo = workerBusyAvailabilityDates.filter(
    (elem) =>
      moment(elem.date).utc() >= startMonth &&
      moment(elem.date).utc() <= endMonth
  );

  let currentDate = moment(startMonth).utc();
  let workerDatesAvailabilityInfo = [];
  while (currentDate <= endMonth) {
    let availabilityObject = {
      day: currentDate.date(),
      isAvailable: null,
    };
    if (
      workerAvailabilityInfo.some((e) =>
        moment(e.date).utc().isSame(currentDate)
      )
    ) {
      availabilityObject.isAvailable = false;
    } else {
      availabilityObject.isAvailable = true;
    }
    workerDatesAvailabilityInfo.push(availabilityObject);
    currentDate = currentDate.add(1, "day");
  }

  console.log(workerDatesAvailabilityInfo);

  return workerDatesAvailabilityInfo;
};

const getAllServiceDates = async (req, res) => {
  const serviceId = req.params.serviceId;
  const currentUser = req.user;

  // Start new transaction's session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const service = await Service.findById(serviceId).session(session);
    if (!service) throw new Error("Service not found");

    const businessId = service.businessId;

    const business = await Business.findById(businessId).session(session);
    if (!business) throw new Error("Business not found");
    const workersIds = business.workers;

    const workers = await User.find({ _id: workersIds }).session(session);
    if (!workers) throw new Error("Workers not found");

    await session.commitTransaction();
    return res.render("visit", {
      user: currentUser,
      business,
      workers,
      selectedWorker: null,
      service,
      availableHours: null,
      workerDatesAvailabilityInfo: null,
    });
  } catch (err) {
    session.abortTransaction();
  } finally {
    session.endSession();
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
