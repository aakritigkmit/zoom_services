const express = require("express");
const router = express.Router();
const validateRequest = require("../middlewares/validator.middleware");
const bookingController = require("../controllers/bookings.controller");
const { createBookingSchema } = require("../validators/bookings.validator");
const { authenticate } = require("../middlewares/auth.middleware");

router.post(
  "/",
  authenticate,
  validateRequest(createBookingSchema),
  bookingController.createBooking,
);

router.get("/:id", authenticate, bookingController.fetchByBookingId);
router.patch("/:id/cancel", authenticate, bookingController.cancelBooking);

router.post("/:id/feedback", authenticate, bookingController.submitFeedback);

module.exports = router;
