const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

const validateRequest = require("../middlewares/validator.middleware");

const { sendOtpSchema } = require("../validators/auth.validator");

router.post(
  "/send-otp",
  validateRequest(sendOtpSchema),
  authController.sendOtp,
);

module.exports = router;
