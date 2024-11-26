const { StatusCodes } = require("http-status-codes");

function throwCustomError(message, statusCode = StatusCodes.BAD_REQUEST) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function errorHandler(
  res,
  error,
  message,
  defaultStatusCode = StatusCodes.BAD_REQUEST,
) {
  const statusCode = error.statusCode || defaultStatusCode;
  res
    .status(statusCode)
    .json({ message: error.message || "An error occurred" });
}

function responseHandler(req, res) {
  res.status(res.statusCode).json({ message: res.message, data: res.data });
}

module.exports = { throwCustomError, errorHandler, responseHandler };
