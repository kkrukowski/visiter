const moment = require("moment");

const getAvailableHours = (busyHours, startHour, endHour) => {
  let availableHours = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 20) {
      const time = hour + ":" + (minute < 10 ? "0" : "") + minute;
      console.log(time);

      if (!busyHours.includes(time)) {
        availableHours.push(time);
      }
    }
  }

  return availableHours;
};

module.exports = { getAvailableHours };
