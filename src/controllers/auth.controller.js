const authService = require("../services/auth.service");
const { StatusCodes } = require("http-status-codes");
const { errorHandler } = require("../helpers/common.helper");
const { blacklistToken } = require("../helpers/jwt.helper");

const sendOtp = async (req, res, next) => {
  try {
    const otp = await authService.sendOtp(req.body.email);

    res.message = "Otp sent Successfully";
    res.data = { otp };
    res.statusCode = StatusCodes.OK;
    next();
  } catch (error) {
    errorHandler(
      res,
      error.message,
      error.statusCode || StatusCodes.BAD_REQUEST,
    );
  }
};

const verifyOtp = async (req, res, next) => {
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
    res.message = "OTP verified";
    res.statusCode = StatusCodes.OK;

    console.log("res.data", res.data);

    next();
  } catch (error) {
    errorHandler(res, error.message, StatusCodes.BAD_REQUEST);
  }
};

const register = async (req, res, next) => {
  console.log("req.body", req.body);
  const payload = req.body;

  try {
    const newUser = await authService.registerUser(payload);

    res.message = "User registered successfully";
    res.data = { user: newUser };

    console.log("controllers", res.data);
    res.statusCode = StatusCodes.CREATED;
    next();
  } catch (error) {
    errorHandler(
      res,
      error.message,
      error.statusCode || StatusCodes.BAD_REQUEST,
    );
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const token = await authService.login(email, password);

    res.message = "Login successful";
    res.data = { token };
    res.statusCode = StatusCodes.OK;
    next();
  } catch (error) {
    errorHandler(
      res,
      error.message,
      error.statusCode || StatusCodes.BAD_REQUEST,
    );
  }
};

const logout = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return errorHandler(res, "Token not provided", 401);
  }

  try {
    await blacklistToken(token);

    res.message = "Logged out successfully";
    res.statusCode = StatusCodes.OK;
    next();
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
