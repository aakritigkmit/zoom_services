const express = require("express");
const router = express.Router();
const validateRequest = require("../middlewares/validator.middleware");
const bookingController = require("../controllers/bookings.controller");
const { createBookingSchema } = require("../validators/bookings.validator");

router.post(
  "/",
  validateRequest(createBookingSchema),
  bookingController.createBooking,
);

// router.get("/bookings", getAllBookingsForUserCars);

router.get(
  "/:id",

  bookingController.fetchByBookingId,
);

module.exports = router;
