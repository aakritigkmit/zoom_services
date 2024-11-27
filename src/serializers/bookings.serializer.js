const {
  toCamelCase,
  normalizeTimestamps,
  removeCircularReferences,
} = require("../helpers/serializer.helper");

const carSerializer = (car) => ({
  id: car.id,
  model: car.model,
  type: car.type,
  ...normalizeTimestamps(car),
});

const userSerializer = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  ...normalizeTimestamps(user),
});

const bookingsSerializerMiddleware = (booking) => ({
  id: booking.id,
  userId: booking.user_id,
  carId: booking.car_id,
  startDate: booking.start_date,
  endDate: booking.end_date,
  dropOffTime: booking.drop_off_time,
  status: booking.status,
  fare: booking.fare,
  feedback: booking.feedback,
  estimatedDistance: booking.estimated_distance,
  ...normalizeTimestamps(booking),
});

const bookingsListSerializer = (bookingsData) => ({
  totalBookings: bookingsData.totalBookings,
  currentPage: bookingsData.currentPage,
  totalPages: bookingsData.totalPages,
  bookings: bookingsData.bookings.map(bookingsSerializerMiddleware),
});

const bookingWithTransactionSerializer = (data) => {
  const responseData = {
    bookingId: data.booking.id,
    transactionId: data.transaction.id,
    model: data.booking.car?.model || null,
    startDate: data.booking.start_date,
    endDate: data.booking.end_date,
    fare: data.booking.fare,
    totalGst:
      parseFloat(data.transaction.GST) +
      parseFloat(data.transaction.CGST) +
      parseFloat(data.transaction.IGST) +
      parseFloat(data.transaction.SGST),
    amount: parseFloat(data.transaction.amount),
    ...normalizeTimestamps(data),
  };

  delete responseData["booking"];
  delete responseData["transaction"];

  return responseData;
};

const bookingSerializer = (req, res, next) => {
  if (!res.data) {
    return next();
  }

  const serializeData = (data) => {
    // For Booking with Transaction API
    if (data.booking && data.transaction) {
      return bookingWithTransactionSerializer(data);
    }
    // For General Booking API
    if (data.newBooking) {
      return {
        newBooking: bookingsSerializerMiddleware(data.newBooking),
      };
    } else if (data.bookings) {
      return bookingsListSerializer(data.bookings);
    } else if (data.booking) {
      return {
        booking: bookingsSerializerMiddleware(data.booking),
      };
    }
    return data; // Fallback for other cases
  };

  res.data = removeCircularReferences(res.data);
  res.data = serializeData(res.data);
  res.data = toCamelCase(res.data);

  next();
};

module.exports = {
  bookingSerializer,
};

// const {
//   toCamelCase,
//   normalizeTimestamps,
//   removeCircularReferences,
// } = require("../helpers/serializer.helper");

// const carSerializer = (car) => ({
//   id: car.id,
//   model: car.model,
//   type: car.type,
//   ...normalizeTimestamps(car),
// });

// const userSerializer = (user) => ({
//   id: user.id,
//   name: user.name,
//   email: user.email,
//   ...normalizeTimestamps(user),
// });

// const bookingsSerializerMiddleware = (booking) => ({
//   id: booking.id,
//   userId: booking.user_id,
//   carId: booking.car_id,
//   startDate: booking.start_date,
//   endDate: booking.end_date,
//   dropOffTime: booking.drop_off_time,
//   status: booking.status,
//   fare: booking.fare,
//   feedback: booking.feedback,
//   estimatedDistance: booking.estimated_distance,
//   ...normalizeTimestamps(booking),
// });

// const bookingsListSerializer = (bookingsData) => ({
//   totalBookings: bookingsData.totalBookings,
//   currentPage: bookingsData.currentPage,
//   totalPages: bookingsData.totalPages,
//   bookings: bookingsData.bookings.map(bookingsSerializerMiddleware),
// });

// const bookingSerializer = (req, res, next) => {
//   if (!res.data) {
//     return next();
//   }

//   const serializeData = (data) => {
//     if (data.newBooking) {
//       return {
//         newBooking: bookingsSerializerMiddleware(data.newBooking),
//       };
//     } else if (data.bookings) {
//       return bookingsListSerializer(data.bookings);
//     } else if (data.booking) {
//       return {
//         booking: bookingsSerializerMiddleware(data.booking),
//       };
//     } else {
//       return data;
//     }
//   };

//   res.data = removeCircularReferences(res.data);
//   res.data = serializeData(res.data);
//   res.data = toCamelCase(res.data);

//   next();
// };

// module.exports = {
//   bookingSerializer,
//   bookingsListSerializer,
//   bookingsSerializerMiddleware,
// };
