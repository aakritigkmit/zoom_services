const authService = require("../services/auth.service");
const { StatusCodes } = require("http-status-codes");
const { errorHandler, responseHandler } = require("../helpers/common.helper");
const { blacklistToken } = require("../helpers/jwt.helper");
const sendOtp = async (req, res) => {
  try {
    const otp = await authService.sendOtp(req.body.email);
    responseHandler(res, { otp }, "OTP sent successfully", StatusCodes.OK);
  } catch (error) {
    errorHandler(
      res,
      error.message,
      error.statusCode || StatusCodes.BAD_REQUEST,
    );
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const isValid = await authService.verifyOtp(email, otp);

    if (!isValid) {
      return errorHandler(
        res,
        "Invalid or expired OTP",
        StatusCodes.BAD_REQUEST,
      );
    }

    responseHandler(res, null, "OTP verified", StatusCodes.OK);
  } catch (error) {
    errorHandler(res, error.message, StatusCodes.BAD_REQUEST);
  }
};

const register = async (req, res) => {
  const payload = req.body;

  try {
    const newUser = await authService.registerUser(payload);
    responseHandler(
      res,
      { user: newUser },
      "User registered successfully",
      StatusCodes.CREATED,
    );
  } catch (error) {
    errorHandler(
      res,
      error.message,
      error.statusCode || StatusCodes.BAD_REQUEST,
    );
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const token = await authService.login(email, password);
    responseHandler(res, { token }, "Login successful", StatusCodes.OK);
  } catch (error) {
    errorHandler(
      res,
      error.message,
      error.statusCode || StatusCodes.BAD_REQUEST,
    );
  }
};

const logout = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
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

module.exports = {
  logout,
  login,
  register,
  verifyOtp,
  sendOtp,
};
