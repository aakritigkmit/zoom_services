const { StatusCodes } = require("http-status-codes");
const bookingService = require("../services/bookings.service");
const {
  throwCustomError,
  errorHandler,
  responseHandler,
} = require("../helpers/common.helper");
const { Booking } = require("../models");

exports.createBooking = async (req, res) => {
  try {
    // console.log("req.body", req.body);
    const newBooking = await bookingService.createBooking(req.body);
    // console.log("newBooking", newBooking);
    res.status(StatusCodes.CREATED).json({
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

exports.fetchByBookingId = async (req, res) => {
  const bookingId = req.params.id;
  try {
    const booking = await bookingService.fetchByBookingId(bookingId);
    if (!booking) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Booking not found" });
    }
    res.status(StatusCodes.OK).json({ booking });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findByPk(id);

    if (!booking) {
      throwCustomError("Booking not found", StatusCodes.NOT_FOUND);
    }

    if (booking.status === "Cancelled") {
      throwCustomError("Booking is already cancelled", StatusCodes.BAD_REQUEST);
    }

    booking.status = "Cancelled";
    await booking.save();

    res.status(StatusCodes.OK).json({ booking });
  } catch (error) {
    console.error("Error in cancelBooking:", error);
    errorHandler(res, error, error.statusCode || StatusCodes.BAD_REQUEST);
  }
};

exports.submitFeedback = async (req, res, next) => {
  try {
    const bookingId = req.params.id;

    console.log("Booking ID:", bookingId);

    const { feedback } = req.body;

    if (!feedback) {
      throwCustomError("Feedback is required", 400);
    }

    const userId = req.user.id;
    console.log("User ID:", userId);

    const result = await bookingService.submitFeedback({
      bookingId,
      userId,
      feedback,
    });

    res.status(StatusCodes.OK).json({
      message: "Feedback submitted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.monthlySummary = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    console.log("year", year);

    const result = await bookingService.monthlySummary(year);
    res.status(StatusCodes.OK).json({
      message: "Retrieved  monthly data successfully",
      data: result,
    });
  } catch (error) {
    errorHandler(res, error, error.statusCode || StatusCodes.BAD_REQUEST);
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year || isNaN(month) || isNaN(year)) {
      return responseHandler(
        res,
        400,
        "Invalid or missing month and year values",
      );
    }

    const bookings = await bookingService.getBookingDetails(month, year);
    return res.status(200).json({
      status: 200,
      message: `Bookings for ${month}/${year}`,
      data: bookings,
    });
  } catch (error) {
    errorHandler(res, error, error.statusCode || StatusCodes.BAD_REQUEST);
  }
};

exports.downloadMonthlyBookings = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const csvData = await bookingService.downloadMonthlyBookings({
      month,
      year,
    });
    res.header("Content-Type", "text/csv");
    res.attachment(`bookings_${month || "all"}_${year || "all"}.csv`);
    res.send(csvData);
  } catch (error) {
    next(error);
  }
};
