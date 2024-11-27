const { errorHandler } = require("../../src/helpers/common.helper");
const { StatusCodes } = require("http-status-codes");

function validateRequest(schema, params = false) {
  return (req, res, next) => {
    const { error } = params
      ? schema.validate(req.params)
      : schema.validate(req.body);

    if (error) {
      const errorMessage = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
      }));

      return errorHandler(res, error, errorMessage, StatusCodes.BAD_REQUEST);
    }

    next();
  };
}

module.exports = validateRequest;
