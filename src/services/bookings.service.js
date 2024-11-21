const { Booking, Car, User, sequelize } = require("../models");
const { calculateBookingFare } = require("../helpers/calculateFares.helper");
const { Parser } = require("json2csv");
const { throwCustomError } = require("../helpers/common.helper");
const { StatusCodes } = require("http-status-codes");

const createBooking = async (data) => {
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

    const newBooking = await Booking.create({ ...data, fare: totalFare });

    await rollBack.commit();

    return newBooking;
  } catch (error) {
    await rollBack.rollback();
    throw error;
  }
};

const fetchByBookingId = async (id) => {
  return await Booking.findByPk(id);
};

const updateBooking = async (bookingId, updatedData, userId) => {
  const t = await sequelize.transaction();

  try {
    const booking = await Booking.findByPk(bookingId, { transaction: t });
    console.log("booking", booking);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.user_id !== userId) {
      throwCustomError("Forbidden", StatusCodes.FORBIDDEN);
    }

    if (updatedData.car_id) {
      const car = await Car.findByPk(updatedData.car_id, { transaction: t });
      if (!car) {
        throw new Error("Car not found");
      }
    }

    await booking.update(updatedData, { transaction: t });

    await t.commit();

    return booking;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const cancelBooking = async (bookingId, userId) => {
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

const submitFeedback = async ({ bookingId, userId, feedback }) => {
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

const monthlySummary = async (year = new Date().getFullYear()) => {
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

const getBookingDetails = async (month, year) => {
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
  });

  return bookings;
};

const fetchAllBookingsForUser = async (userId, page = 1, pageSize = 10) => {
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

const downloadMonthlyBookings = async ({ month, year }) => {
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

module.exports = {
  createBooking,
  fetchByBookingId,
  cancelBooking,
  submitFeedback,
  downloadMonthlyBookings,
  monthlySummary,
  fetchAllBookingsForUser,
  getBookingDetails,
  updateBooking,
};
