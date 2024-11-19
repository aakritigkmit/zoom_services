const { StatusCodes } = require("http-status-codes");
const bookingService = require("../services/bookings.service");
const {
  throwCustomError,
  errorHandler,
  responseHandler,
} = require("../helpers/common.helper");

const createBooking = async (req, res) => {
  const userId = req.user.id;
  try {
    const newBooking = await bookingService.createBooking(
      req.body,
      req.user.email,
      userId,
    );
    responseHandler(
      res,
      newBooking,
      "Booking created successfully",
      StatusCodes.CREATED,
    );
  } catch (error) {
    errorHandler(res, error, "Failed to create booking");
  }
};

const fetchByBookingId = async (req, res) => {
  const bookingId = req.params.id;
  try {
    const booking = await bookingService.fetchByBookingId(bookingId);
    if (!booking) {
      throwCustomError("Booking not found", StatusCodes.NOT_FOUND);
    }
    responseHandler(res, booking, "Booking fetched successfully");
  } catch (error) {
    errorHandler(res, error, "Failed to fetch booking");
  }
};

const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const booking = await bookingService.cancelBooking(id, userId);

    responseHandler(res, booking, "Booking cancelled successfully");
  } catch (error) {
    errorHandler(res, error, "Failed to cancel booking");
  }
};

const updateBookingDetails = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const userId = req.user.id;

  try {
    const updatedBooking = await bookingService.updateBooking(
      id,
      updatedData,
      userId,
    );
    responseHandler(res, updatedBooking, "Booking updated successfully");
  } catch (error) {
    errorHandler(res, error, "Failed to update booking details");
  }
};

const submitFeedback = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { feedback } = req.body;

    if (!feedback) {
      throwCustomError("Feedback is required", StatusCodes.BAD_REQUEST);
    }

    const userId = req.user.id;

    const result = await bookingService.submitFeedback({
      bookingId,
      userId,
      feedback,
    });

    responseHandler(res, result, "Feedback submitted successfully");
  } catch (error) {
    errorHandler(res, error, "Failed to submit feedback");
  }
};

const monthlySummary = async (req, res) => {
  try {
    const { page, pageSize } = req.query;
    const { year = new Date().getFullYear() } = req.query;

    const result = await bookingService.monthlySummary(year, page, pageSize);
    responseHandler(res, result, "Monthly summary retrieved successfully");
  } catch (error) {
    errorHandler(res, error, "Failed to retrieve monthly summary");
  }
};

const getBookings = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year || isNaN(month) || isNaN(year)) {
      throwCustomError(
        "Invalid or missing month and year values",
        StatusCodes.BAD_REQUEST,
      );
    }

    const bookings = await bookingService.getBookingDetails(month, year);
    responseHandler(res, bookings, `Bookings for ${month}/${year}`);
  } catch (error) {
    errorHandler(res, error, "Failed to fetch bookings");
  }
};

const downloadMonthlyBookings = async (req, res) => {
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
    errorHandler(res, error, "Failed to download bookings");
  }
};

module.exports = {
  downloadMonthlyBookings,
  createBooking,
  fetchByBookingId,
  cancelBooking,
  updateBookingDetails,
  submitFeedback,
  monthlySummary,
  getBookings,
};
