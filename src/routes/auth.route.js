const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

const validateRequest = require("../middlewares/validator.middleware");

const {
  sendOtpSchema,
  verifyOtpSchema,
} = require("../validators/auth.validator");

router.post(
  "/send-otp",
  validateRequest(sendOtpSchema),
  authController.sendOtp,
);

router.post(
  "/verify-otp",
  validateRequest(verifyOtpSchema),
  authController.verifyOtp,
);

module.exports = router;
