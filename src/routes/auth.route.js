const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const commonHelpers = require("../helpers/common.helper");
const validateRequest = require("../middlewares/validator.middleware");
const { authSerializer } = require("../serializers/auth.serializer");

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
  authSerializer,
  commonHelpers.responseHandler,
);

router.post(
  "/verify-otp",
  validateRequest(verifyOtpSchema),
  authController.verifyOtp,
  authSerializer,
  commonHelpers.responseHandler,
);

router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register,
  authSerializer,
  commonHelpers.responseHandler,
);

router.post(
  "/login",
  validateRequest(loginSchema),
  authController.login,
  authSerializer,
  commonHelpers.responseHandler,
);

router.delete(
  "/logout",
  authenticate,
  authController.logout,
  authSerializer,
  commonHelpers.responseHandler,
);

module.exports = router;
