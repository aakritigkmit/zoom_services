const express = require("express");
const router = express.Router();

const carController = require("../controllers/cars.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/roles.middleware");
const upload = require("../middlewares/multer.middleware");
const validateRequest = require("../middlewares/validator.middleware");
const { createCarSchema } = require("../validators/cars.validator");

router.get("/", authenticate, carController.findNearestCars);
router.get("/:id", authenticate, carController.fetchByCarId);

router.post(
  "/",
  authenticate,
  checkRole(["Car Owner", "Admin"]),
  upload.single("image"),
  validateRequest(createCarSchema),
  carController.createCar,
);

module.exports = router;
