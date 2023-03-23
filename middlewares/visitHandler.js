const moment = require("moment");

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

const getAvailableHours = async (
  serviceDuration,
  busyHours,
  startHour,
  endHour
) => {
  let availableHours = [];
  console.log(busyHours);
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 20) {
      const checkedTime =
        (hour < 10 ? "0" : "") + hour + ":" + (minute < 10 ? "0" : "") + minute;
      if (
        !busyHours.includes(checkedTime) &&
        (await isAbleToBook(busyHours, serviceDuration, checkedTime)) === true
      ) {
        const time = [hour, (minute < 10 ? "0" : "") + minute];
        availableHours.push(time);
      }
    }
  }

  return availableHours;
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

module.exports = {
  getAvailableHours,
  isAbleToBook,
  getTimesToUpdate,
};
