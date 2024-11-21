const { errorHandler } = require("../../src/helpers/common.helper");

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

      return errorHandler(res, error, errorMessage, 400);
    }

    next();
  };
}

module.exports = validateRequest;
