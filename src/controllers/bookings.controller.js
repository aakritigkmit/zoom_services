const { StatusCodes } = require("http-status-codes");
const bookingService = require("../services/bookings.service");

exports.createBooking = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const newBooking = await bookingService.createBooking(req.body);
    console.log("newBooking", newBooking);
    res.status(StatusCodes.CREATED).json({
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
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
