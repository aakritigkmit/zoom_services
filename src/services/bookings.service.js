const { Booking, Car, User } = require("../models");
const { calculateBookingFare } = require("../helpers/calculateFares.helper");

const { throwCustomError } = require("../helpers/common.helper");

exports.createBooking = async (data) => {
  const car = await Car.findByPk(data.car_id);
  if (!car) {
    throw new Error("Car not found");
  }

  const existingBooking = await Booking.findOne({
    where: {
      user_id: data.user_id,
      car_id: data.car_id,
    },
  });

  if (existingBooking) {
    throw new Error("You already have an active booking for this car.");
  }

  const totalFare = calculateBookingFare(
    car,
    data.estimated_distance,
    data.start_date,
    data.end_date,
  );

  const bookingData = { ...data, fare: totalFare };

  return await Booking.create(bookingData);
};

exports.fetchByBookingId = async (id) => {
  return await Booking.findByPk(id);
};

exports.cancelBooking = async (bookingId, userId) => {
  console.log("bookingId", bookingId);
  console.log("userId", userId);
  const booking = await Booking.findOne({
    where: {
      id: bookingId,
      user_id: userId,
    },
    include: [{ model: User, as: "user", attributes: ["name", "email"] }],
  });

  // console.log(booking);
  if (!booking) {
    throw new Error(
      "Booking not found or you're not authorized to cancel this booking.",
    );
  }

  if (booking.status === "Cancelled") {
    throw new Error("This booking has already been cancelled.");
  }

  booking.status = "Cancelled";
  await booking.save();

  return booking;
};

exports.submitFeedback = async ({ bookingId, userId, feedback }) => {
  const booking = await Booking.findOne({
    where: { id: bookingId, user_id: userId },
  });

  if (!booking) {
    throwCustomError("Booking not found or not accessible", 404);
  }

  if (booking.feedback) {
    throwCustomError("Feedback already submitted for this booking", 400);
  }

  booking.feedback = feedback;

  await booking.save();

  return booking;
};
