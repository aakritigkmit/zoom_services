const { scheduleBookingsReminders } = require("./bookings.scheduler");

const initializeSchedulers = () => {
  console.log("Initializing schedulers...");
  scheduleBookingsReminders();
};
module.exports = {
  initializeSchedulers,
};
