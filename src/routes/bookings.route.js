const express = require("express");
const router = express.Router();
const validateRequest = require("../middlewares/validator.middleware");
const bookingController = require("../controllers/bookings.controller");
const { createBookingSchema } = require("../validators/bookings.validator");
const { authenticate } = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/roles.middleware");
const commonHelpers = require("../helpers/common.helper");
const { bookingSerializer } = require("../serializers/bookings.serializer");

router.post(
  "/",
  authenticate,
  validateRequest(createBookingSchema),
  bookingController.create,
  bookingSerializer,
  commonHelpers.responseHandler,
);

router.get(
  "/details",
  authenticate,
  checkRole(["Admin"]),
  bookingController.getBookings,
  bookingSerializer,
  commonHelpers.responseHandler,
);

router.get(
  "/summary",
  authenticate,
  checkRole(["Admin"]),
  bookingController.monthlySummary,
  bookingSerializer,
  commonHelpers.responseHandler,
);

router.get(
  "/download",
  authenticate,
  checkRole(["Car Owner", "Admin"]),
  bookingController.downloadMonthlyBookings,
  bookingSerializer,
  commonHelpers.responseHandler,
);

router.get(
  "/:id",
  authenticate,
  bookingController.fetchById,
  bookingSerializer,
  commonHelpers.responseHandler,
);

router.put(
  "/:id",
  authenticate,
  checkRole(["Admin", "Car Owner"]),
  bookingController.update,
  bookingSerializer,
  commonHelpers.responseHandler,
);

router.patch(
  "/:id/cancel",
  authenticate,
  bookingController.cancelBooking,
  bookingSerializer,
  commonHelpers.responseHandler,
);

router.patch(
  "/:id/feedback",
  authenticate,
  bookingController.submitFeedback,
  bookingSerializer,
  commonHelpers.responseHandler,
);

module.exports = router;
