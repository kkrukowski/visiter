const Business = require("../models/Business");
const User = require("../models/User");
const Visit = require("../models/Visit");
const Service = require("../models/Service");
const { getBusinessData } = require("../middlewares/authHandler");

const moment = require("moment");
const mongoose = require("mongoose");

const {
  getAvailableHours,
  isAbleToBook,
  updateAvailability,
  getWorkerBusyAvailabilityHours,
  getWorkerBusyAvailabilityDates,
  getServicesDatesForWorkers,
  getAvailableHoursForWorkers,
} = require("../middlewares/visitHandler");

// CLIENT VISITS
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

// WORKER VISITS
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

const createVisit = async (req, res) => {
  // Create new Visit
  const workerId = req.params.workerId;
  const clientId = req.user.id;
  const serviceId = req.params.serviceId;
  const currentUser = req.user;
  const { year, hour, minute } = req.params;
  const day = req.params.day;
  const month = parseInt(req.params.month) - 1;

  let visitDate = moment().utc().set({
    year: year,
    month: month,
    date: day,
    hour: hour,
    minute: minute,
    second: 0,
    millisecond: 0,
  });

  // Start transaction's session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const serviceInfo = await Service.findById(serviceId).session(session);
    if (!serviceInfo) throw new Error("Service not found!");
    // Create new Visit
    const newVisit = new Visit({
      createdAt: moment().utc(),
      visitDate: visitDate.utc(),
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

    visitDate = visitDate.utc().set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

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
      if (!updatedAvailability)
        throw new Error("Updating availability failed!");
    } else {
      throw new Error("Date is not available!");
    }

    await session.commitTransaction();
    return res.render("home", {
      user: currentUser,
      business: getBusinessData(currentUser),
      message: "Pomyślnie zapisano na wizytę!",
    });
  } catch (err) {
    await session.abortTransaction();
  } finally {
    session.endSession();
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
  const searchingDate = moment().utc().set({
    year: year,
    month: month,
    date: day,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
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

    // Get service
    const service = await Service.findById(serviceId);
    if (!service) throw new Error("Service not found!");

    const serviceDuration = service.duration;

    // Get worker availability dates info
    const workerDatesAvailabilityInfo = await getWorkerBusyAvailabilityDates(
      worker,
      searchingDate,
      serviceDuration
    );

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

    return res.status(200).render("visit", {
      user: currentUser,
      business,
      workers,
      selectedWorker: workerId,
      service,
      date: { year, month: req.params.month, day },
      availableHours,
      workerDatesAvailabilityInfo,
      allDatesAvailabilityInfo: null,
    });
  } catch (err) {
    return res.send(err);
  }
};

const getAllServiceDates = async (req, res) => {
  const serviceId = req.params.serviceId;
  const currentUser = req.user;
  let year = req.params.year;
  let day = req.params.day;
  let month = req.params.month;
  // If date not provided set todays date as default
  if (year == null || month == null || day == null) {
    year = moment().utc().year();
    month = moment().utc().month() + 1;
    day = moment().utc().date();
  }

  const visitDate = moment()
    .utc()
    .set({
      year: year,
      month: month - 1,
      date: day,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

  // Start new transaction's session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const service = await Service.findById(serviceId).session(session);
    if (!service) throw new Error("Service not found");

    const serviceDuration = service.duration;
    const businessId = service.businessId;

    const business = await Business.findById(businessId).session(session);
    if (!business) throw new Error("Business not found");
    const workersIds = business.workers;

    const workers = await User.find({ _id: workersIds }).session(session);
    if (!workers) throw new Error("Workers not found");

    const allDatesAvailabilityInfo = await getServicesDatesForWorkers(
      workers,
      serviceDuration
    );

    const workersAvailableHours = await getAvailableHoursForWorkers(
      workers,
      serviceDuration,
      9,
      17,
      visitDate
    );

    await session.commitTransaction();
    return res.render("visit", {
      user: currentUser,
      business,
      workers,
      selectedWorker: workersIds[0],
      service,
      date: { year, month, day },
      availableHours: workersAvailableHours,
      workerDatesAvailabilityInfo: null,
      allDatesAvailabilityInfo,
    });
  } catch (err) {
    session.abortTransaction();
  } finally {
    session.endSession();
  }
};

module.exports = {
  getAllClientVisits,
  getAllWorkerVisits,
  createVisit,
  getAllServiceDates,
  getAvailableHoursForWorker,
};
