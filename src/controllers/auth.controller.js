const authService = require("../services/auth.service");

const { errorHandler, responseHandler } = require("../helpers/common.helper");

exports.sendOtp = async (req, res) => {
  try {
    const otp = await authService.sendOtp(req.body.email);
    responseHandler(res, { otp }, "OTP sent successfully");
  } catch (error) {
    console.log(error);
    errorHandler(res, error.message, error.statusCode || 400);
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const isValid = await authService.verifyOtp(email, otp);
    if (!isValid) {
      return errorHandler(res, "Invalid or expired OTP", 400);
    }
    responseHandler(res, null, "OTP verified");
  } catch (error) {
    errorHandler(res, error.message, 400);
  }
};
