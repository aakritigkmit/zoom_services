const { Booking, Car, User, sequelize, Transaction } = require("../models");
const calculateBookingFare = require("../helpers/calculateFares.helper");
const { sendTransactionEmail } = require("../utils/email.js");
const { Parser } = require("json2csv");
const { throwCustomError } = require("../helpers/common.helper");
const { StatusCodes } = require("http-status-codes");
const { sendEmail } = require("../utils/email");
const moment = require("moment");
const { Op } = require("sequelize");

const create = async (data, email, userId) => {
  const t = await sequelize.transaction();
  try {
    const car = await Car.findByPk(data.car_id);

    if (!car) {
      throwCustomError("Car not found", StatusCodes.NOT_FOUND);
    }

    if (car.status === "unavailable") {
      throwCustomError(
        "Car is not available for rent",
        StatusCodes.BAD_REQUEST,
      );
    }

    const existingBooking = await Booking.findOne({
      where: {
        user_id: userId,
        car_id: data.car_id,
      },
    });

    if (existingBooking) {
      throwCustomError(
        "You already have an active booking for this car.",
        StatusCodes.BAD_REQUEST,
      );
    }

    const totalFare = calculateBookingFare(
      car,
      data.estimated_distance,
      data.start_date,
      data.end_date,
    );

    const newBooking = await Booking.create(
      {
        ...data,
        fare: totalFare,
        user_id: userId,
        status: "Pending",
      },
      { transaction: t },
    );

    const GST = totalFare * 0.18;
    const CGST = totalFare * 0.18;
    const IGST = totalFare * 0.18;
    const SGST = totalFare * 0.18;
    const totalGST = GST + CGST + IGST + SGST;
    const totalAmount = totalFare + totalGST;

    const transaction = await Transaction.create(
      {
        user_id: userId,
        booking_id: newBooking.id,
        GST,
        CGST,
        IGST,
        SGST,
        amount: totalAmount,
        transaction_status: "Success",
      },
      { transaction: t },
    );

    newBooking.status = "Confirmed";
    await newBooking.save({ transaction: t });

    car.status = "booked";
    await car.save({ transaction: t });

    await sendTransactionEmail({
      to: email,
      subject: "Booking and Transaction Successful",
      description: "Your booking and transaction were successfully processed.",
      car_name: car.model,
      booking_date: newBooking.created_at,
      start_date: data.start_date,
      end_date: data.end_date,
      total_amount: totalFare,
      total_gst: totalGST,
      amount: totalAmount,
      booking_status: "Confirmed",
    });

    await t.commit();
    return { booking: newBooking, transaction };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const fetchById = async (id) => {
  const booking = await Booking.findByPk(id);

  if (!booking) {
    throwCustomError("Booking not found", StatusCodes.NOT_FOUND);
  }
  return await Booking.findByPk(id);
};

const update = async (bookingId, updatedData, userId) => {
  const t = await sequelize.transaction();

  try {
    const booking = await Booking.findByPk(bookingId, { transaction: t });

    if (!booking) {
      throwCustomError("Booking not found", StatusCodes.NOT_FOUND);
    }

    if (booking.user_id !== userId) {
      throwCustomError("Forbidden", StatusCodes.FORBIDDEN);
    }

    if (updatedData.car_id) {
      const car = await Car.findByPk(updatedData.car_id, { transaction: t });
      if (!car) {
        throwCustomError("Car not found", StatusCodes.NOT_FOUND);
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

const cancelBooking = async (params, user) => {
  const { id: bookingId } = params;
  const userId = user.id;
  const booking = await Booking.findByPk(bookingId, {
    include: [{ model: User, as: "user", attributes: ["name", "email"] }],
  });

  if (!booking) {
    throwCustomError("Booking not found", StatusCodes.NOT_FOUND);
  }

  if (booking.user_id !== userId) {
    throwCustomError("Forbidden", StatusCodes.FORBIDDEN);
  }

  if (booking.status === "Cancelled") {
    throwCustomError(
      "This booking has already been cancelled.",
      StatusCodes.BAD_REQUEST,
    );
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
    throwCustomError(
      "Booking not found or not accessible",
      StatusCodes.FORBIDDEN,
    );
  }

  if (booking.feedback) {
    throwCustomError(
      "Feedback already submitted for this booking",
      StatusCodes.BAD_REQUEST,
    );
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

const getBookings = async (month, year) => {
  const whereCondition = [];

  if (month && (isNaN(month) || month < 1 || month > 12)) {
    throwCustomError(
      "Invalid month provided. It should be between 1 and 12.",
      StatusCodes.BAD_REQUEST,
    );
  }

  if (month) {
    whereCondition.push(
      sequelize.where(
        sequelize.fn("EXTRACT", sequelize.literal('MONTH FROM "start_date"')),
        month,
      ),
    );
  }

  if (year) {
    whereCondition.push(
      sequelize.where(
        sequelize.fn("EXTRACT", sequelize.literal('YEAR FROM "start_date"')),
        year,
      ),
    );
  }

  const bookings = await Booking.findAll({
    where: whereCondition.length > 0 ? sequelize.and(...whereCondition) : {},
    include: [
      { model: Car, as: "car", attributes: ["model", "type"] },
      { model: User, as: "user", attributes: ["name", "email"] },
    ],
  });

  return bookings;
};

const downloadMonthlyBookings = async (data) => {
  const { month, year } = data;
  const whereConditions = [];

  if (month) {
    whereConditions.push(
      sequelize.where(
        sequelize.fn("EXTRACT", sequelize.literal(`MONTH FROM "created_at"`)),
        month,
      ),
    );
  }

  if (year) {
    whereConditions.push(
      sequelize.where(
        sequelize.fn("EXTRACT", sequelize.literal(`YEAR FROM "created_at"`)),
        year,
      ),
    );
  }

  const bookings = await Booking.findAll({
    where: whereConditions.length ? { [Op.and]: whereConditions } : undefined,
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
    throwCustomError(
      "No bookings found for the specified criteria",
      StatusCodes.NOT_FOUND,
    );
  }

  const json2csvParser = new Parser();
  const csvData = json2csvParser.parse(bookings.map((b) => b.toJSON()));
  return csvData;
};

const bookingScheduler = async () => {
  try {
    const confirmedBookings = await Booking.findAll({
      where: { status: "Confirmed" },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: Car,
          as: "car",
          attributes: ["id", "model", "type"],
        },
      ],
    });

    const now = new Date();

    for (const booking of confirmedBookings) {
      const { id: bookingId, start_date, end_date, user } = booking;

      const timeLeft = moment(start_date).diff(moment(), "hours");
      if (timeLeft > 0 && timeLeft <= 24) {
        console.log(`[Reminder] Booking ${bookingId}: ${timeLeft} hours left.`);

        await sendEmail(
          user.email,
          "Booking Reminder",
          `Hello! Your booking with ID ${bookingId} is about to start in ${timeLeft} hours.`,
        );
      }

      if (moment(end_date).isBefore(now)) {
        console.log(`[Late] Booking ${bookingId}: Your ride is late.`);

        await sendEmail(
          user.email,
          "Late Notification",
          `Your booking with ID ${bookingId} is overdue. Please return the car immediately.`,
        );

        booking.status = "Late";
        await booking.save();
      }
    }
  } catch (error) {
    console.error("Error in booking scheduler:", error);
  }
};

module.exports = {
  create,
  fetchById,
  cancelBooking,
  submitFeedback,
  downloadMonthlyBookings,
  monthlySummary,
  getBookings,
  update,
  bookingScheduler,
};
