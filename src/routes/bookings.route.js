const express = require("express");
const router = express.Router();
const validateRequest = require("../middlewares/validator.middleware");
const bookingController = require("../controllers/bookings.controller");
const { createBookingSchema } = require("../validators/bookings.validator");
const { authenticate } = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/roles.middleware");
const commonHelpers = require("../helpers/common.helper");
const {
  bookingsSerializerMiddleware,
} = require("../serializers/bookings.serializer");

router.post(
  "/",
  authenticate,
  validateRequest(createBookingSchema),
  bookingController.createBooking,
  bookingsSerializerMiddleware,
  commonHelpers.responseHandler,
);

router.get(
  "/summary",
  authenticate,
  checkRole(["Admin"]),
  bookingController.monthlySummary,
  bookingsSerializerMiddleware,
  commonHelpers.responseHandler,
);

router.get(
  "/details",
  authenticate,
  checkRole(["Admin"]),
  bookingController.getBookings,
  bookingsSerializerMiddleware,
  commonHelpers.responseHandler,
);

router.get(
  "/download",
  authenticate,
  checkRole(["Car Owner", "Admin"]),
  bookingController.downloadMonthlyBookings,
  bookingsSerializerMiddleware,
  commonHelpers.responseHandler,
);

router.get(
  "/:id",
  authenticate,
  bookingController.fetchByBookingId,
  bookingsSerializerMiddleware,
  commonHelpers.responseHandler,
);

router.put(
  "/:id",
  authenticate,
  checkRole(["Admin", "Car Owner"]),
  bookingController.updateBookingDetails,
  bookingsSerializerMiddleware,
  commonHelpers.responseHandler,
);

router.patch(
  "/:id/cancel",
  authenticate,
  bookingController.cancelBooking,
  bookingsSerializerMiddleware,
  commonHelpers.responseHandler,
);

router.post(
  "/:id/feedback",
  authenticate,
  bookingController.submitFeedback,
  bookingsSerializerMiddleware,
  commonHelpers.responseHandler,
);

module.exports = router;
