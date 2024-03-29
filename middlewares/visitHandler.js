const moment = require("moment");
const mongoose = require("mongoose");

const User = require("../models/User");
const ObjectId = require("mongoose").Types.ObjectId;

// CLIENT VISITS

// WORKER VISITS

// VISITS CREATING
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
    const timesToUpdate = getTimesToUpdate(time, serviceDuration);

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
    return true;
  } catch (err) {
    await session.abortTransaction();
    return err;
  } finally {
    session.endSession();
  }
};

const getTimesToUpdate = (time, serviceDuration) => {
  let timesToUpdate = [];
  let bookTime = moment.utc(time, "HH:mm");
  const bookEndTime = moment
    .utc(bookTime, "HH:mm")
    .add(serviceDuration, "minutes");
  while (bookTime <= bookEndTime) {
    timesToUpdate.push(bookTime.utc().format("HH:mm"));
    bookTime.add(20, "minutes").utc();
  }
  return timesToUpdate;
};

// GETTING VISITS AVAILABILITY INFO
const createCalendarArray = async (monthAvailabilityInfo, searchingDate) => {
  let calendarInfo = [];

  const startDate = moment(searchingDate)
    .clone()
    .startOf("month")
    .startOf("isoWeek");

  const endDate = moment(searchingDate).clone().endOf("month").endOf("isoWeek");

  let currentDay = startDate.clone().subtract(1, "day");

  while (currentDay.isBefore(endDate, "day")) {
    calendarInfo.push(
      Array(7)
        .fill(0)
        .map(() => {
          const dayObject = {
            day: currentDay.add(1, "day").format("DD"),
            isAvailable:
              currentDay.month() == searchingDate.month()
                ? isDayAvailableCalendar(monthAvailabilityInfo, currentDay)
                : false,
          };
          return dayObject;
        })
    );
  }
  return calendarInfo;
};

const isDayAvailableCalendar = (monthAvailabilityInfo, day) => {
  return monthAvailabilityInfo.find((dayInfo) => dayInfo.day == day.format("D"))
    .isAvailable;
};

const getWorkerBusyAvailabilityHours = async (worker, searchingDate) => {
  let workerBusyAvailabilityDates = [];
  if (worker.workerBusyAvailability) {
    workerBusyAvailabilityDates = worker.workerBusyAvailability;
  }
  const workerBusyHours = await workerBusyAvailabilityDates.filter((elem) =>
    moment(elem.date).utc().isSame(searchingDate)
  );

  if (workerBusyHours.length > 0) return workerBusyHours[0].hours;

  return [];
};

const getWorkerBusyAvailabilityDates = async (
  worker,
  searchingDate,
  serviceDuration
) => {
  let workerBusyAvailabilityDates = [];
  if (worker.workerBusyAvailability != null) {
    workerBusyAvailabilityDates = worker.workerBusyAvailability;
  }
  const startMonth = moment(searchingDate).utc().startOf("month");
  const endMonth = moment(searchingDate).utc().endOf("month");
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
      isAvailable: false,
    };
    const currentDayOfWeek = currentDate.day();
    if (
      currentDate.isBefore(moment().utc(moment()), "day") ||
      currentDayOfWeek == 0 ||
      currentDayOfWeek == 6
    ) {
      workerDatesAvailabilityInfo.push(availabilityObject);
      currentDate = currentDate.add(1, "day");
      continue;
    }
    if (
      workerAvailabilityInfo.some((e) =>
        moment(e.date).utc().isSame(currentDate)
      )
    ) {
      const index = workerAvailabilityInfo.findIndex((e) =>
        moment(e.date).utc().isSame(currentDate)
      );
      const busyHours = workerAvailabilityInfo[index].hours;
      const availableHours = await getAvailableHours(
        serviceDuration,
        busyHours,
        9,
        17
      );
      if (availableHours.length > 0) availabilityObject.isAvailable = true;
    } else {
      availabilityObject.isAvailable = true;
    }
    workerDatesAvailabilityInfo.push(availabilityObject);
    currentDate = currentDate.add(1, "day");
  }

  return workerDatesAvailabilityInfo;
};

const getServicesDatesForWorkers = async (
  workers,
  serviceDuration,
  searchingDate
) => {
  // Get workers availability info
  let workersDatesAvailabilityInfo = [];
  for (const worker of workers) {
    if (searchingDate == null) {
      searchingDate = moment();
    }

    const workerDatesAvailabilityInfo = await getWorkerBusyAvailabilityDates(
      worker,
      searchingDate,
      serviceDuration
    );

    workersDatesAvailabilityInfo.push(workerDatesAvailabilityInfo);
  }

  // Create array of day availability info object
  const startMonth = moment(searchingDate).startOf("month");
  const endMonth = moment(searchingDate).endOf("month");
  const currentDay = moment(searchingDate).date();

  let allDatesAvailabilityInfo = [];

  for (
    let dayIndex = startMonth.date();
    dayIndex <= endMonth.date();
    dayIndex++
  ) {
    let dayObject = { day: dayIndex, isAvailable: false };
    for (let workerIndex = 0; workerIndex < workers.length; workerIndex++) {
      const currentDayOfWeek = startMonth.set({ day: dayIndex - 2 }).day();
      // Check availability for a day
      if (
        workersDatesAvailabilityInfo[workerIndex][dayIndex - 1].isAvailable &&
        dayIndex >= currentDay &&
        currentDayOfWeek != 0 &&
        currentDayOfWeek != 6
      ) {
        dayObject.isAvailable = true;
        break;
      }
    }

    allDatesAvailabilityInfo.push(dayObject);
  }

  return allDatesAvailabilityInfo;
};

const areWorkersAvailableInGivenDay = async (
  workers,
  serviceDuration,
  searchingDate
) => {
  // Get workers availability info
  let workersDayAvailabilityInfo = [];
  for (const worker of workers) {
    if (searchingDate == null) {
      searchingDate = moment();
    }

    const workerDatesAvailabilityInfo = await getWorkerBusyAvailabilityDates(
      worker,
      searchingDate,
      serviceDuration
    );

    const isWorkerAvailable =
      workerDatesAvailabilityInfo[searchingDate.date() - 1].isAvailable;

    const workerDayAvailabilityObject = {
      worker: worker,
      isAvailable: isWorkerAvailable,
    };

    workersDayAvailabilityInfo.push(workerDayAvailabilityObject);
  }

  return workersDayAvailabilityInfo;
};

const getAvailableHoursForWorkers = async (
  workers,
  serviceDuration,
  startHour,
  endHour,
  searchingDate
) => {
  const workersCount = workers.length;
  // Create array of available hours
  let concatedWorkersBusyHours = [];
  for (const worker of workers) {
    let busyHours = await getWorkerBusyAvailabilityHours(
      worker,
      searchingDate,
      startHour
    );
    concatedWorkersBusyHours = concatedWorkersBusyHours.concat(busyHours);
  }

  const workersBusyHours = await createBusyHoursForMultipleWorkers(
    concatedWorkersBusyHours,
    startHour,
    endHour,
    workersCount
  );

  // Add past hours as busy hours
  if (
    searchingDate.startOf("day").isSame(moment().utc().startOf("day")) ||
    searchingDate.startOf("day").isBefore(moment().utc().startOf("day"))
  ) {
    const currentDate = new Date(moment().utc(new Date()));
    let checkingTime = moment.utc(startHour, "HH:mm");
    while (checkingTime <= new Date(currentDate)) {
      workersBusyHours.push([checkingTime.hours(), checkingTime.minutes()]);
      checkingTime.add(20, "minutes").utc();
    }
  }

  const workersAvailableHours = await getAvailableHours(
    serviceDuration,
    workersBusyHours,
    startHour,
    endHour,
    workersCount
  );

  return workersAvailableHours;
};

// VISITS UPDATING
const isAbleToBook = async (busyHours, serviceDuration, time) => {
  const bookStartTime = moment.utc(time, "HH:mm");
  const bookEndTime = moment
    .utc(bookStartTime, "HH:mm")
    .add(serviceDuration, "minutes");
  // Check if any hour conflicts with this book time
  const areAnyHoursConflicts = busyHours.some((hour) => {
    const momentHour = moment.utc(hour, "HH:mm");
    return bookStartTime <= momentHour && momentHour <= bookEndTime;
  });
  if (areAnyHoursConflicts) {
    return false;
  }
  return true;
};

const createBusyHoursForMultipleWorkers = async (
  busyHours,
  startHour,
  endHour,
  workersCount = 1
) => {
  let workersBusyHours = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 20) {
      const checkedTime =
        (hour < 10 ? "0" : "") + hour + ":" + (minute < 10 ? "0" : "") + minute;

      const countOfTimes = busyHours.filter(
        (time) => time == checkedTime
      ).length;

      if (countOfTimes == workersCount) {
        const time = [hour.toString(), (minute < 10 ? "0" : "") + minute];
        workersBusyHours.push(time);
      }
    }
  }

  return workersBusyHours;
};

const getAvailableHours = async (
  serviceDuration,
  busyHours,
  startHour,
  endHour
) => {
  let availableHours = [];
  // Calculate end time based on service duration
  const endTime = moment()
    .utc()
    .set({ hours: endHour })
    .subtract(serviceDuration, "minutes");
  for (let hour = startHour; hour < endTime.hour(); hour++) {
    let endMinute = 60;
    if (hour == endTime.hour()) {
      endMinute = endTime.minutes();
    }
    for (let minute = 0; minute < endMinute; minute += 20) {
      const checkedTime =
        (hour < 10 ? "0" : "") + hour + ":" + (minute < 10 ? "0" : "") + minute;
      if (
        !busyHours.includes(checkedTime) &&
        (await isAbleToBook(busyHours, serviceDuration, checkedTime)) === true
      ) {
        const time = [
          (hour < 10 ? "0" : "") + hour,
          (minute < 10 ? "0" : "") + minute,
        ];
        availableHours.push(time);
      }
    }
  }

  return availableHours;
};

// VALIDATION
// Is provided date valid
const isProvidedDateValid = async (day, month, year, hour, minute) => {
  const inputDate = `${year}-${month}-${day}`;
  const inputTime = `${hour}:${minute}:00`;
  const parsedDate = moment(`${inputDate} ${inputTime}`, "YYYY-MM-DD HH:mm:ss");
  return parsedDate.isValid();
};

module.exports = {
  updateAvailability,
  getAvailableHours,
  createCalendarArray,
  getWorkerBusyAvailabilityHours,
  getWorkerBusyAvailabilityDates,
  getAvailableHoursForWorkers,
  getServicesDatesForWorkers,
  areWorkersAvailableInGivenDay,
  isAbleToBook,
  getTimesToUpdate,
  isProvidedDateValid,
};
