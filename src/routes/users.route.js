const express = require("express");

const userController = require("../controllers/users.controller");
const checkRole = require("../middlewares/roles.middleware");
const { authenticate } = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validator.middleware");
const { registerSchema } = require("../validators/users.validator");

const router = express.Router();

router.post(
  "/",
  authenticate,
  validateRequest(registerSchema),
  checkRole(["Admin"]),
  userController.register,
);

module.exports = router;
