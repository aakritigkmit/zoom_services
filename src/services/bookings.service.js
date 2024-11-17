const { Booking, Car, User } = require("../models");
const { calculateBookingFare } = require("../helpers/calculateFares.helper");
const sequelize = require("sequelize");
const { Parser } = require("json2csv");
const { throwCustomError } = require("../helpers/common.helper");

exports.createBooking = async (data) => {
  const rollBack = await sequelize.transaction();
  try {
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

    await rollBack.commit();

    return await Booking.create(bookingData);
  } catch (error) {
    await rollBack.rollback();
    throw error;
  }
};

exports.fetchByBookingId = async (id) => {
  return await Booking.findByPk(id);
};

exports.cancelBooking = async (bookingId, userId) => {
  // console.log("bookingId", bookingId);
  // console.log("userId", userId);

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

exports.monthlySummary = async (year = new Date().getFullYear()) => {
  const summary = await Booking.findAll({
    attributes: [
      [
        sequelize.fn("EXTRACT", sequelize.literal("MONTH FROM created_at")),
        "month",
      ],
      [sequelize.fn("SUM", sequelize.col("fare")), "total_revenue"],
      [sequelize.fn("COUNT", sequelize.col("id")), "total_bookings"],
    ],
    where: sequelize.where(
      sequelize.fn("EXTRACT", sequelize.literal("YEAR FROM created_at")),
      year,
    ),
    group: [
      sequelize.fn("EXTRACT", sequelize.literal("MONTH FROM created_at")),
    ],
    order: [
      [
        sequelize.fn("EXTRACT", sequelize.literal("MONTH FROM created_at")),
        "ASC",
      ],
    ],
  });

  return summary;
};

exports.getBookingDetails = async (month, year, page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;
  const bookings = await Booking.findAll({
    where: sequelize.and(
      sequelize.where(
        sequelize.fn("EXTRACT", sequelize.literal('MONTH FROM "start_date"')),
        month,
      ),
      sequelize.where(
        sequelize.fn("EXTRACT", sequelize.literal('YEAR FROM "start_date"')),
        year,
      ),
    ),
    include: [
      { model: Car, as: "car", attributes: ["model", "type"] },
      { model: User, as: "user", attributes: ["name", "email"] },
    ],
    order: [["start_date", "DESC"]],
    limit: pageSize,
    offset,
  });

  return {
    totalBookings: count,
    currentPage: page,
    totalPages: Math.ceil(count / pageSize),
    bookings,
  };
};

exports.fetchAllBookingsForUser = async (userId, page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;

  const { count, rows: bookings } = await Booking.findAndCountAll({
    where: {
      user_id: userId,
    },
    include: [
      {
        model: Car,
        as: "car",
        attributes: ["id", "model", "year", "fuel_type", "city", "status"],
      },
    ],
    order: [["start_date", "DESC"]],
    limit: pageSize,
    offset,
  });

  return {
    totalBookings: count,
    currentPage: page,
    totalPages: Math.ceil(count / pageSize),
    bookings,
  };
};

exports.downloadMonthlyBookings = async ({ month, year }) => {
  const whereConditions = {};

  if (month) {
    whereConditions[sequelize.fn("MONTH", sequelize.col("created_at"))] = month;
  }
  if (year) {
    whereConditions[sequelize.fn("YEAR", sequelize.col("created_at"))] = year;
  }

  const bookings = await Booking.findAll({
    where: whereConditions,
    attributes: [
      "id",
      "user_id",
      "car_id",
      "start_date",
      "end_date",
      "status",
      "fare",
      "feedback",
      "estimated_distance",
    ],
  });

  if (!bookings || bookings.length === 0) {
    throwCustomError("No bookings found for the specified criteria", 404);
  }

  const json2csvParser = new Parser();
  const csvData = json2csvParser.parse(bookings.map((b) => b.toJSON()));
  return csvData;
};
