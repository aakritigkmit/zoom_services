const express = require("express");
const router = express.Router();

const carController = require("../controllers/cars.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/roles.middleware");
const upload = require("../middlewares/multer.middleware");
const validateRequest = require("../middlewares/validator.middleware");
const {
  createCarSchema,
  updateCarSchema,
  updateCarStatusSchema,
} = require("../validators/cars.validator");
const { serializeCar } = require("../serializers/cars.serializer");
const commonHelpers = require("../helpers/common.helper");

router.post(
  "/",
  authenticate,
  checkRole(["Car Owner", "Admin"]),
  upload.single("image"),
  validateRequest(createCarSchema),
  carController.createCar,
  serializeCar,
  commonHelpers.responseHandler,
);

router.get(
  "/",
  authenticate,
  carController.findNearestCars,
  commonHelpers.responseHandler,
);

router.get(
  "/:id",
  authenticate,
  carController.fetchByCarId,
  serializeCar,
  commonHelpers.responseHandler,
);

router.get(
  "/:id/bookings",
  authenticate,
  carController.fetchCarBookings,
  serializeCar,
  commonHelpers.responseHandler,
);

router.put(
  "/:id",
  authenticate,
  checkRole(["Car Owner", "Admin"]),
  validateRequest(updateCarSchema),
  carController.update,
  serializeCar,
  commonHelpers.responseHandler,
);

router.patch(
  "/:id/status",
  authenticate,
  checkRole(["Car Owner", "Admin"]),
  validateRequest(updateCarStatusSchema),
  carController.updateCarStatus,
  serializeCar,
  commonHelpers.responseHandler,
);

router.delete(
  "/:id",
  authenticate,
  checkRole(["Admin"]),
  carController.removeCar,
  serializeCar,
  commonHelpers.responseHandler,
);

module.exports = router;
