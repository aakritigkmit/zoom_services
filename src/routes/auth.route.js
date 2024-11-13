const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {
  authenticate,
  isTokenBlacklisted,
} = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validator.middleware");

const {
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  loginSchema,
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

router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register,
);

router.post("/login", validateRequest(loginSchema), authController.login);

router.delete("/logout", authenticate, authController.logout);

module.exports = router;
