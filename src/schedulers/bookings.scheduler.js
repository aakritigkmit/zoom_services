const cron = require("node-cron");
const moment = require("moment");
const { sendEmail } = require("../utils/email");

// function scheduleHelper(bookingId, startDate, endDate, onReminder, onLate) {
//   const now = new Date();

//   // for hourly reminders
//   if (startDate > now) {
//     cron.schedule("0 * * * *", () => {
//       const timeLeft = moment(startDate).diff(moment(), "hours");
//       if (timeLeft > 0) {
//         console.log(
//           `[Reminder] Booking ${bookingId}: ${timeLeft} hours left until your ride starts.`,
//         );
//         onReminder(bookingId, timeLeft);
//       }
//     });
//   }

//   //when trip end but car is dropped late

//   if (endDate > now) {
//     const endTimestamp = moment(endDate).toDate();
//     const lateTask = cron.schedule(
//       `${endTimestamp.getMinutes()} ${endTimestamp.getHours()} ${endTimestamp.getDate()} ${endTimestamp.getMonth() + 1} *`,
//       () => {
//         const isLate = new Date() > endDate;
//         if (isLate) {
//           console.log(`[Late] Booking ${bookingId}: Ride is late.`);
//           onLate(bookingId);
//         }

//         lateTask.stop();
//       },
//     );
//   }
// }

// module.exports = scheduleHelper;

// const cron = require("node-cron");
// const moment = require("moment");

// function scheduleHelper(bookingId, startDate, endDate, onReminder, onLate) {
//   const now = new Date();

//   // 1. Schedule reminders every minute until the start date
//   if (startDate > now) {
//     const reminderTask = cron.schedule("*/1 * * * *", () => {
//       const timeLeft = moment(startDate).diff(moment(), "minutes");
//       if (timeLeft > 0) {
//         console.log(
//           `[Reminder] Booking ${bookingId}: ${timeLeft} minutes left until your ride starts.`,
//         );
//         sendEmail(userEmail, "Booking Reminder", reminderMessage);
//         onReminder(bookingId, timeLeft);
//       } else {
//         console.log(`[Reminder] Booking ${bookingId}: Ride has started.`);
//         reminderTask.stop(); // Stop reminders once the ride starts

//       }
//     });
//   }

//   // 2. Schedule a late-drop check at the end date
//   if (endDate > now) {
//     const endTimestamp = moment(endDate).toDate();
//     const lateTask = cron.schedule(
//       `${endTimestamp.getMinutes()} ${endTimestamp.getHours()} ${endTimestamp.getDate()} ${endTimestamp.getMonth() + 1} *`,
//       () => {
//         const isLate = new Date() > endDate;
//         if (isLate) {
//           console.log(`[Late] Booking ${bookingId}: Ride is late.`);
//           onLate(bookingId);
//         }
//         // Stop this task once executed
//         lateTask.stop();
//       },
//     );
//   }
// }

// module.exports = scheduleHelper;

// function scheduleHelper(bookingId, startDate, endDate, onReminder, onLate) {
//   const now = new Date();

//   // 1. Schedule reminders every 10 seconds until the start date
//   if (startDate > now) {
//     const reminderInterval = setInterval(() => {
//       const timeLeft = moment(startDate).diff(moment(), "seconds");
//       if (timeLeft > 0) {
//         console.log(
//           `[Reminder] Booking ${bookingId}: ${timeLeft} seconds left until your ride starts.`,
//         );
//         onReminder(bookingId, timeLeft);
//       } else {
//         console.log(`[Reminder] Booking ${bookingId}: Ride has started.`);
//         clearInterval(reminderInterval); // Stop reminders once the ride starts
//       }
//     }, 10000); // 10 seconds interval
//   }

//   // 2. Schedule a late-drop check at the end date
//   if (endDate > now) {
//     const lateCheckTimeout = setTimeout(() => {
//       const isLate = new Date() > endDate;
//       if (isLate) {
//         console.log(`[Late] Booking ${bookingId}: Ride is late.`);
//         onLate(bookingId);
//       }
//       // No need to clear timeout as it only runs once
//     }, moment(endDate).diff(moment()));
//   }
// }

// module.exports = scheduleHelper;

// function scheduleHelper(bookingId, startDate, endDate, userEmail) {
//   const now = new Date();

//   if (startDate > now) {
//     const reminderInterval = setInterval(async () => {
//       const timeLeft = moment(startDate).diff(moment(), "hours");
//       if (timeLeft > 0) {
//         const reminderMessage = `[Reminder] Booking ${bookingId}: ${timeLeft} seconds left until your ride starts.`;
//         console.log(reminderMessage);

//         await sendEmail(
//           userEmail,
//           "Booking Reminder",
//           `Hello! Your booking with ID ${bookingId} is about to start. ${timeLeft} seconds left.`,
//         );
//       } else {
//         console.log(`[Reminder] Booking ${bookingId}: Ride has started.`);
//         clearInterval(reminderInterval);
//       }
//     }, 10000);
//   }

//   if (endDate > now) {
//     const lateCheckTimeout = setTimeout(async () => {
//       const isLate = new Date() > endDate;
//       if (isLate) {
//         const lateMessage = `[Late] Booking ${bookingId}: Your ride is late.`;
//         console.log(lateMessage);

//         // Send email notification
//         await sendEmail(
//           userEmail,
//           "Late Notification",
//           `Your booking with ID ${bookingId} is overdue. Please return the car immediately.`,
//         );
//       }
//       // No need to clear timeout as it only runs once
//     }, moment(endDate).diff(moment()));
//   }
// }

// module.exports = scheduleHelper;

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
