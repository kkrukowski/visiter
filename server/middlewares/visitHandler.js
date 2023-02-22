const moment = require("moment");

const getAvailableHours = (serviceDuration) => {
  let availableHours = [];
  let time = moment().hour(8).minute(0).second(0);
  const day = time.get("date");
  const month = time.get("month");
  const year = time.get("year");
  const todaysDate = { day, month, year };
  const possibleIterations = 480 / serviceDuration;
  for (let i = 0; i < possibleIterations; i++) {
    const startHour = time.get("hour");
    const startMinute = time.get("minute");
    const startTime = [startHour, startMinute];
    availableHours.push(startTime);
    time.add(serviceDuration, "minute");
  }
  return { todaysDate, availableHours };
};

module.exports = { getAvailableHours };
