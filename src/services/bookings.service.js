const { Booking, Car } = require("../models");

const { calculateBookingFare } = require("../helpers/calculateFares.helper");
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

  const bookingData = { ...data, fare: totalFare, status: null };

  return await Booking.create(bookingData);
};

exports.fetchByBookingId = async (id) => {
  return await Booking.findByPk(id);
};
