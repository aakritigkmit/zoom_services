const { StatusCodes } = require("http-status-codes");
const bookingService = require("../services/bookings.service");
const { errorHandler } = require("../helpers/common.helper");

const create = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const { booking, transaction } = await bookingService.create(
      req.body,
      req.user.email,
      userId,
    );

    res.data = {
      booking,
      transaction,
    };
    res.message = "Booking created successfully";
    res.statusCode = StatusCodes.CREATED;

    next();
  } catch (error) {
    console.error(error);

    errorHandler(
      res,
      error,
      error.message || "Failed to create booking",
      StatusCodes.BAD_REQUEST,
    );
  }
};

const fetchById = async (req, res, next) => {
  const bookingId = req.params.id;
  try {
    const booking = await bookingService.fetchById(bookingId);

    res.data = { booking };
    res.message = "Booking fetched successfully";
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};

const update = async (req, res, next) => {
  const { id } = req.params;
  const updatedData = req.body;
  const userId = req.user.id;

  try {
    const updatedBooking = await bookingService.update(id, updatedData, userId);

    res.data = updatedBooking;
    res.message = "Booking updated successfully";
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};

const updateByAction = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { feedback, action } = req.body;
    const userId = req.user.id;

    if (action === "feedback") {
      const result = await bookingService.submitFeedback({
        bookingId,
        userId,
        feedback,
      });

      res.data = result;
      res.message = "Feedback submitted successfully";
      res.statusCode = StatusCodes.OK;
    } else if (action === "cancelBooking") {
      const booking = await bookingService.cancelBooking(req.params, req.user);

      res.data = { booking };
      res.message = "Booking cancelled successfully";
      res.statusCode = StatusCodes.OK;
    } else {
      throwCustomError("Invalid action", StatusCodes.BAD_REQUEST);
    }

    next();
  } catch (error) {
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};

const monthlySummary = async (req, res, next) => {
  try {
    const { page, pageSize } = req.query;
    const { year = new Date().getFullYear() } = req.query;

    const booking = await bookingService.monthlySummary(year, page, pageSize);

    res.data = booking;
    res.message = "Monthly summary retrieved successfully";
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const bookings = await bookingService.getBookings(month, year);

    res.data = bookings;
    res.message = `Bookings for ${month}/${year}`;
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    errorHandler(res, error, StatusCodes.BAD_REQUEST);
  }
};

const fetchBookings = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const bookings = await getBookings(Number(month), Number(year));

    res.data = {
      message: "Bookings fetched successfully.",
      data: bookings,
    };
    res.statusCode = StatusCodes.OK;
    next();
  } catch (error) {
    next(error);
  }
};

const downloadMonthlyBookings = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const csvData = await bookingService.downloadMonthlyBookings(req.query);

    res.header("Content-Type", "text/csv");
    res.attachment(`bookings_${month || "all"}_${year || "all"}.csv`);
    res.send(csvData);
  } catch (error) {
    console.log(error);
    errorHandler(res, error, StatusCodes.BAD_REQUEST);
  }
};

module.exports = {
  downloadMonthlyBookings,
  create,
  fetchById,
  update,
  monthlySummary,
  getBookings,
  updateByAction,
  fetchBookings,
};
