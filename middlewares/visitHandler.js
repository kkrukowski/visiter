const moment = require("moment");

const getAvailableHours = (busyHours, startHour, endHour) => {
  let availableHours = [];
  console.log(busyHours);
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 20) {
      const checkedTime = hour + ":" + (minute < 10 ? "0" : "") + minute;
      if (!busyHours.includes(checkedTime)) {
        const time = [hour, (minute < 10 ? "0" : "") + minute];
        availableHours.push(time);
      }
    }
  }

  return availableHours;
};

const isAbleToBook = (workerBusyAvailabilityDates, serviceDuration, time) => {
  const bookStartTime = moment(time, "HH:mm");
  const bookEndTime = moment(bookStartTime, "HH:mm").add(
    serviceDuration,
    "minutes"
  );
  console.log(bookStartTime, bookEndTime);
};

module.exports = { getAvailableHours, isAbleToBook };
