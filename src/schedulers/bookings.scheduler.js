const cron = require("node-cron");
const moment = require("moment");
const { sendEmail } = require("../utils/email");

function scheduleHelper(bookingId, startDate, endDate, userEmail) {
  const now = new Date();

  if (startDate > now) {
    const reminderInterval = setInterval(
      async () => {
        const timeLeft = moment(startDate).diff(moment(), "hours");

        if (timeLeft > 0) {
          const reminderMessage = `[Reminder] Booking ${bookingId}: ${timeLeft} hours left until your ride starts.`;
          console.log(reminderMessage);

          await sendEmail(
            userEmail,
            "Booking Reminder",
            `Hello! Your booking with ID ${bookingId} is about to start. ${timeLeft} hours left.`,
          );
        } else {
          console.log(`[Reminder] Booking ${bookingId}: Ride has started.`);
          clearInterval(reminderInterval);
        }
      },
      60 * 60 * 1000,
    );
  }

  if (endDate > now) {
    const lateCheckTimeout = setTimeout(async () => {
      const isLate = new Date() > endDate;
      if (isLate) {
        const lateMessage = `[Late] Booking ${bookingId}: Your ride is late.`;
        console.log(lateMessage);

        await sendEmail(
          userEmail,
          "Late Notification",
          `Your booking with ID ${bookingId} is overdue. Please return the car immediately.`,
        );
      }
    }, moment(endDate).diff(moment()));
  }
}

module.exports = scheduleHelper;
