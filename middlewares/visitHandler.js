const moment = require("moment");

const isAbleToBook = async (busyHours, serviceDuration, time) => {
  const bookStartTime = moment.utc(time, "HH:mm");
  const bookEndTime = moment
    .utc(bookStartTime, "HH:mm")
    .add(serviceDuration, "minutes");
  if (
    busyHours.some((hour) => {
      const momentHour = moment.utc(hour, "HH:mm");
      return bookStartTime <= momentHour && momentHour <= bookEndTime;
    })
  ) {
    return false;
  }
  return true;
};

const isAbleToBookSomeHour = async (busyHours, serviceDuration) => {
  
}

const getAvailableHours = async (
  serviceDuration,
  busyHours,
  startHour,
  endHour
) => {
  let availableHours = [];
  console.log("BUSY: ", busyHours);
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 20) {
      const checkedTime = hour + ":" + (minute < 10 ? "0" : "") + minute;
      if (
        !busyHours.includes(checkedTime) &&
        isAbleToBook(busyHours, serviceDuration, checkedTime)
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

module.exports = { getAvailableHours, isAbleToBook, getTimesToUpdate };
