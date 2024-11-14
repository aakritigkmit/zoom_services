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
} = require("../validators/cars.validator");

router.post(
  "/",
  authenticate,
  checkRole(["Car Owner", "Admin"]),
  upload.single("image"),
  validateRequest(createCarSchema),
  carController.createCar,
);

router.get("/", authenticate, carController.findNearestCars);
router.get("/:id", authenticate, carController.fetchByCarId);

router.put(
  "/:id",
  authenticate,
  checkRole(["Car Owner", "Admin"]),
  validateRequest(updateCarSchema),
  carController.update,
);

module.exports = router;
