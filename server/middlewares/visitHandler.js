const moment = require("moment");

const getAvailableHours = (visits, serviceDuration) => {
  let availableHours = [];
  let time = moment().hour(8).minute(0).second(0);
  const tommorowsDate = moment().hour(0).minute(0).second(0).add(1, "day");
  // Get only these visits in selected day
  const todaysVisits = visits.filter(
    (visit) => visit.visitDate < tommorowsDate && visit.visitDate > moment()
  );

  // Create object with info for selected date
  const day = time.get("date");
  const month = time.get("month");
  const year = time.get("year");
  const todaysDate = { day, month, year };

  // Calculate in which hours visits are possible to make
  const possibleIterations = 480 / serviceDuration;
  for (let i = 0; i < possibleIterations; i++) {
    // Create array with hour info for visit
    const startHour = time.get("hour");
    const startMinute = time.get("minute");
    const startTime = [startHour, startMinute];
    // Check if in this time someone can work
    let workingWorkersAmount = 0;
    todaysDate.forEach((date) => {
      //if (date.hour() === startHour && state.)
    });
    // Add this array in available hours
    availableHours.push(startTime);
    // Go to next visit hour
    time.add(serviceDuration, "minute");
  }
  return { todaysDate, availableHours };
};

module.exports = { getAvailableHours };
