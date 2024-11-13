const { StatusCodes } = require("http-status-codes");

function throwCustomError(message, statusCode = StatusCodes.BAD_REQUEST) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function errorHandler(res, error, defaultStatusCode = StatusCodes.BAD_REQUEST) {
  const statusCode = error.statusCode || defaultStatusCode;
  res
    .status(statusCode)
    .json({ message: error.message || "An error occurred" });
}

function responseHandler(
  res,
  data,
  message = "Success",
  statusCode = StatusCodes.OK,
) {
  res.status(statusCode).json({ message, data });
}

module.exports = { throwCustomError, errorHandler, responseHandler };
