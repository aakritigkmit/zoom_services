const authService = require("../services/auth.service");

const { errorHandler, responseHandler } = require("../helpers/common.helper");
const { blacklistToken } = require("../helpers/jwt.helper");

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

exports.register = async (req, res) => {
  console.log("Request body:", req.body);
  const { name, email, phoneNumber, password, roleName, city } = req.body;

  try {
    const newUser = await authService.registerUser(
      name,
      email,
      phoneNumber,
      password,
      roleName,
      city,
    );
    responseHandler(
      res,
      { user: newUser },
      "User registered successfully",
      201,
    );
  } catch (error) {
    errorHandler(res, error.message, error.statusCode || 400);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await authService.login(email, password);
    responseHandler(res, { token }, "Login successful");
  } catch (error) {
    errorHandler(res, error.message, error.statusCode || 400);
  }
};

exports.logout = async (req, res) => {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  console.log(token);
  if (!token) {
    return errorHandler(res, "Token not provided", 401);
  }

  try {
    await blacklistToken(token);
    responseHandler(res, null, "Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error.message);
    errorHandler(res, "Failed to logout", 400);
  }
};
