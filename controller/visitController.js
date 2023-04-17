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
  areWorkersAvailableInGivenDay,
  isProvidedDateValid,
  createCalendarArray,
} = require("../middlewares/visitHandler");

// CLIENT VISITS
const getAllClientVisits = (req, res) => {
  // Get array of visits ids
  const clientId = req.user.id;
  User.findById(clientId, (err, user) => {
    if (err) return res.send(err);
    // Get visits data
    const visitsIds = user.clientVisits;
    Visit.find({ id: visitsIds })
      .populate("businessId")
      .populate("serviceId")
      .exec((err, visits) => {
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
    // If provided date data are invalid
    if ((await isProvidedDateValid(day, month, year, hour, minute)) === false) {
      await session.abortTransaction();
      return res.render("home", {
        user: currentUser,
        business: getBusinessData(currentUser),
        message: "Pomyślnie zapisano na wizytę!",
      });
    }

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
  const hour = req.params.hour;
  const minute = req.params.minute;
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

  const currentDate = moment();
  const currentUser = req.user;

  // Avoid same or before date
  if (
    searchingDate.isBefore(currentDate) &&
    !searchingDate.isSame(moment().utc(moment()).startOf("day"))
  ) {
    return res.render("home", {
      user: currentUser,
      business:
        req.user.role == "Owner"
          ? await Business.findOne({ ownerId: req.user._id }).exec()
          : await Business.findOne({ workers: req.user._id }).exec(),
      message: "Błędna data!",
    });
  }

  // If provided date data are invalid
  if ((await isProvidedDateValid(day, month, year, hour, minute)) === false) {
    return res.render("home", {
      user: currentUser,
      business:
        req.user.role == "Owner"
          ? await Business.findOne({ ownerId: req.user._id }).exec()
          : await Business.findOne({ workers: req.user._id }).exec(),
      message: "Wprowadzona data jest błędna!",
    });
  }
  try {
    // Search worker
    const worker = await User.findById(workerId);
    if (!worker) throw new Error("Worker not found!");

    // Get worker busy hours array for searching date
    const busyHours = await getWorkerBusyAvailabilityHours(
      worker,
      searchingDate
    );

    // Add past hours as busy hours
    if (
      searchingDate
        .startOf("day")
        .isSame(moment().utc(moment()).startOf("day")) ||
      searchingDate
        .startOf("day")
        .isBefore(moment().utc(moment()).startOf("day"))
    ) {
      const currentDate = new Date(moment().utc(moment()));
      let checkingTime = moment.utc("9:00", "HH:mm");
      while (checkingTime <= new Date(currentDate)) {
        busyHours.push(`${checkingTime.hours()}:${checkingTime.minutes()}`);
        checkingTime.add(20, "minutes").utc();
      }
    }

    if ((hour != null) & (minute != null)) {
      if (busyHours.includes(`${hour}:${minute}`)) {
        return res.render("home", {
          user: currentUser,
          business:
            req.user.role == "Owner"
              ? await Business.findOne({ ownerId: req.user._id }).exec()
              : await Business.findOne({ workers: req.user._id }).exec(),
          message: "Błędna data!",
        });
      }
    }

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

    // Avoid loading url in unavailable hour
    if ((hour != null) & (minute != null)) {
      const searchingTime = [hour, minute];
      const isHourAvailable = availableHours.some(
        (time) => time[0] === searchingTime[0] && time[1] === searchingTime[1]
      );

      if (!isHourAvailable) {
        return res.render("home", {
          user: currentUser,
          business:
            req.user.role == "Owner"
              ? await Business.findOne({ ownerId: req.user._id }).exec()
              : await Business.findOne({ workers: req.user._id }).exec(),
          message: "Data jest niedostępna!",
        });
      }
    }

    const businessId = service.businessId;

    // Get business
    const business = await Business.findById(businessId);
    if (!business) throw new Error("Business not found");

    const workersIds = business.workers;

    // Get workers
    const workers = await User.find({ _id: workersIds });

    const workersDayAvailabilityInfo = await areWorkersAvailableInGivenDay(
      workers,
      serviceDuration,
      searchingDate
    );

    const calendarInfo = await createCalendarArray(
      workerDatesAvailabilityInfo,
      searchingDate
    );
    if (!calendarInfo) throw new Error("Creating calendar info failed!");

    return res.status(200).render("visit", {
      user: currentUser,
      business,
      workers,
      selectedWorker: workerId,
      service,
      date: { year, month: req.params.month, day, hour, minute },
      availableHours,
      workerDatesAvailabilityInfo,
      workersDayAvailabilityInfo,
      allDatesAvailabilityInfo: null,
      calendarInfo,
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
  const hour = 0;
  const minute = 0;
  // If date not provided set todays date as default
  if (year == null || month == null || day == null) {
    year = moment().utc().year();
    month = moment().utc().month() + 1;
    day = moment().utc().date();
  }

  // If provided date data are invalid
  if ((await isProvidedDateValid(day, month, year, hour, minute)) === false) {
    return res.render("home", {
      user: currentUser,
      business:
        req.user.role == "Owner"
          ? await Business.findOne({ ownerId: req.user._id }).exec()
          : await Business.findOne({ workers: req.user._id }).exec(),
      message: "Wprowadzona data jest błędna!",
    });
  }

  const visitDate = moment()
    .utc()
    .set({
      year: year,
      month: month - 1,
      date: day,
      hour: hour,
      minute: minute,
      second: 0,
      millisecond: 0,
    });

  // If searching date is weekend set it to future monday
  // if (visitDate.day() === 6 || visitDate.day() === 0) {
  //   const newDate = visitDate.add(1, "week").startOf("isoWeek");
  //   const url = `/book/${serviceId}/day/${newDate.date()}/month/${newDate.month()}/year/${newDate.year()}`;
  //   return res.redirect(url, async () => {
  //     res.render("visit", {
  //       user: currentUser,
  //       business:
  //         req.user.role == "Owner"
  //           ? await Business.findOne({ ownerId: req.user._id }).exec()
  //           : await Business.findOne({ workers: req.user._id }).exec(),
  //     });
  //   });
  // }

  const currentDate = moment().utc().set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  if (visitDate.isBefore(currentDate)) {
    return res.render("home", {
      user: currentUser,
      business:
        req.user.role == "Owner"
          ? await Business.findOne({ ownerId: req.user._id }).exec()
          : await Business.findOne({ workers: req.user._id }).exec(),
      message: "Błędna data!",
    });
  }

  const service = await Service.findById(serviceId);
  if (!service) throw new Error("Service not found");

  const serviceDuration = service.duration;
  const businessId = service.businessId;

  const business = await Business.findById(businessId);
  if (!business) throw new Error("Business not found");
  const workersIds = business.workers;

  const workers = await User.find({ _id: workersIds });
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

  const workersDayAvailabilityInfo = await areWorkersAvailableInGivenDay(
    workers,
    serviceDuration,
    visitDate
  );

  const calendarInfo = await createCalendarArray(
    allDatesAvailabilityInfo,
    visitDate
  );

  return res.render("visit", {
    user: currentUser,
    business,
    workers,
    selectedWorker: workersIds[0],
    service,
    date: { year, month, day, hour, minute },
    availableHours: workersAvailableHours,
    workerDatesAvailabilityInfo: null,
    workersDayAvailabilityInfo,
    allDatesAvailabilityInfo,
    calendarInfo,
  });
};

module.exports = {
  getAllClientVisits,
  getAllWorkerVisits,
  createVisit,
  getAllServiceDates,
  getAvailableHoursForWorker,
};
