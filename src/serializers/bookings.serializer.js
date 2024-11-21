// const serializeSingleBooking = (booking) => {
//   return (serializedBooking = {
//     id: booking.id,
//     startDate: booking.start_date,
//     endDate: booking.end_date,
//     status: booking.status,
//     fare: booking.fare,
//     user: booking.user
//       ? {
//           id: booking.user.id,
//           name: booking.user.name,
//           email: booking.user.email,
//         }
//       : null,
//     car: booking.car
//       ? {
//           id: booking.car.id,
//           model: booking.car.model,
//           type: booking.car.type,
//         }
//       : null,
//   });
// };

// const serializeAllBookings = (req, res, next) => {
//   const { data } = res;
//   console.log(data);

//   console.log(">>> ", Object.keys(data));
//   console.log(">>> ", data.message);

//   if (data.bookings) {
//     let serializedBookings;
//     if (data.bookings.length === 0) {
//       serializedBookings = [];
//     }

//     const bookings = data.bookings;

//     serializedBookings = bookings.map((booking) => {
//       return serializeSingleBooking(booking);
//     });

//     res.data = {
//       bookings: serializedBookings,
//       message: data.message || "Bookings retrieved successfully",
//     };

//     return next();
//   }

//   if (data.booking) {
//     console.log(Object.keys(data));
//     let serializedBooking;

//     const booking = data.booking;

//     if (Object.keys(booking).length === 0) {
//       serializedBooking = {};
//     }

//     serializedBooking = serializeSingleBooking(booking);

//     res.data = {
//       booking: serializedBooking,
//       message: data.message || "Bookings retrieved successfully",
//     };

//     return next();
//   }

//   return next();
// };

// module.exports = {
//   serializeAllBookings,
// };

const {
  toCamelCase,
  normalizeTimestamps,
  removeCircularReferences,
} = require("../helpers/serializer.helper");

// Serialize a single car
const carSerializer = (car) => ({
  id: car.id,
  model: car.model,
  type: car.type,
  ...normalizeTimestamps(car),
});

// Serialize a single user
const userSerializer = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  ...normalizeTimestamps(user),
});

// Serialize a single booking
const bookingSerializer = (booking) => ({
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
  user: booking.user ? userSerializer(booking.user) : null,
  car: booking.car ? carSerializer(booking.car) : null,
  ...normalizeTimestamps(booking),
});

// Serialize a list of bookings
const bookingsListSerializer = (bookingsData) => ({
  totalBookings: bookingsData.totalBookings,
  currentPage: bookingsData.currentPage,
  totalPages: bookingsData.totalPages,
  bookings: bookingsData.bookings.map(bookingSerializer),
});

// Main serializer middleware
const bookingsSerializerMiddleware = (req, res, next) => {
  if (!res.data) {
    return next();
  }

  const serializeData = (data) => {
    if (data.newBooking) {
      return {
        newBooking: bookingSerializer(data.newBooking),
      };
    } else if (data.bookings) {
      return bookingsListSerializer(data.bookings);
    } else if (data.booking) {
      return {
        booking: bookingSerializer(data.booking),
      };
    } else {
      return data; // Fallback for other cases
    }
  };

  // Remove circular references, serialize data, and convert to camelCase
  res.data = removeCircularReferences(res.data);
  res.data = serializeData(res.data);
  res.data = toCamelCase(res.data);

  next();
};

module.exports = {
  bookingSerializer,
  bookingsListSerializer,
  bookingsSerializerMiddleware,
};
