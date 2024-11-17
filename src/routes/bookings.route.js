const express = require("express");
const router = express.Router();
const validateRequest = require("../middlewares/validator.middleware");
const bookingController = require("../controllers/bookings.controller");
const { createBookingSchema } = require("../validators/bookings.validator");
const { authenticate } = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/roles.middleware");

router.post(
  "/",
  authenticate,
  validateRequest(createBookingSchema),
  bookingController.createBooking,
);

router.get(
  "/summary",
  authenticate,
  checkRole(["Admin"]),
  bookingController.monthlySummary,
);
router.get(
  "/details",
  authenticate,
  checkRole(["Admin"]),
  bookingController.getBookings,
);
router.get(
  "/download",
  authenticate,
  checkRole(["Car Owner", "Admin"]),
  bookingController.downloadMonthlyBookings,
);

router.get("/:id", authenticate, bookingController.fetchByBookingId);

router.put(
  "/:id",
  authenticate,
  checkRole(["Admin", "Car Owner"]),
  bookingController.updateBookingDetails,
);

router.patch("/:id/cancel", authenticate, bookingController.cancelBooking);

router.post("/:id/feedback", authenticate, bookingController.submitFeedback);

module.exports = router;
