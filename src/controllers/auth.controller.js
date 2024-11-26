const authService = require("../services/auth.service");
const { StatusCodes } = require("http-status-codes");
const { errorHandler } = require("../helpers/common.helper");
const { blacklistToken } = require("../helpers/jwt.helper");

const sendOtp = async (req, res, next) => {
  try {
    const otp = await authService.sendOtp(req.body.email);

    res.message = "Otp sent Successfully";
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    errorHandler(
      res,
      error,
      error.message,
      error.statusCode || StatusCodes.BAD_REQUEST,
    );
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const payload = req.body;
    await authService.verifyOtp(payload);

    res.message = "OTP verified";
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};

const register = async (req, res, next) => {
  const payload = req.body;

  try {
    const newUser = await authService.registerUser(payload);

    res.message = "User registered successfully";
    res.statusCode = StatusCodes.CREATED;

    next();
  } catch (error) {
    errorHandler(
      res,
      error,
      error.message,
      error.statusCode || StatusCodes.BAD_REQUEST,
    );
  }
};

const login = async (req, res, next) => {
  const payload = req.body;

  try {
    const token = await authService.login(payload);

    res.message = "Login successful";
    res.data = { token };
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    errorHandler(
      res,
      error,
      error.message,
      error.statusCode || StatusCodes.BAD_REQUEST,
    );
  }
};

const logout = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  try {
    if (!token) {
      return errorHandler(res, "Token not provided", 401);
    }

    await blacklistToken(token);

    res.message = "Logged out successfully";
    res.statusCode = StatusCodes.OK;
    next();
  } catch (error) {
    console.error("Logout error:", error.message);
    errorHandler(res, error, "Failed to logout", 400);
  }
};

module.exports = {
  logout,
  login,
  register,
  verifyOtp,
  sendOtp,
};
