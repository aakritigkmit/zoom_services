const cron = require("node-cron");
const { bookingScheduler } = require("../services/bookings.service");

const scheduleBookingsReminders = () => {
  cron.schedule("* 5 * * *", async () => {
    try {
      console.log("Running Booking reminder ");
      await bookingScheduler();
      console.log("Booking reminders sent successfully.");
    } catch (error) {
      console.error("Error occurred while sending Bookings reminders:", error);
    }
  });
};
module.exports = {
  scheduleBookingsReminders,
};
