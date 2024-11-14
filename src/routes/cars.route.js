const express = require("express");
const router = express.Router();

const carController = require("../controllers/cars.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/roles.middleware");
const upload = require("../middlewares/multer.middleware");

// router.get("/:id", checkRole(["Admin"]), carController.getCar);
// router.get("/:id/bookings", carController.getCarBookings);
// router.get("/:id", authenticate, carController.fetchByCarId);

router.post(
  "/",
  authenticate,
  checkRole(["Car Owner", "Admin"]),
  upload.single("image"),
  carController.createCar,
);

module.exports = router;
