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
