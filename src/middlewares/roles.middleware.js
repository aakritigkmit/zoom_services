const { errorHandler, responseHandler } = require("../helpers/common.helper");
const { StatusCodes } = require("http-status-codes");

const checkRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      const userRoleNames = req.user.roles.map((role) => role.name);

      const hasAccess = requiredRoles.some((role) =>
        userRoleNames.includes(role),
      );
      console.log(requiredRoles);
      console.log(userRoleNames);
      if (!hasAccess) {
        res.message = "Access denied ,You are not Authorized";
        res.statusCode = StatusCodes.FORBIDDEN;
        return responseHandler(req, res);
      }

      next();
    } catch (error) {
      return errorHandler(res, error, "Server error", StatusCodes.BAD_REQUEST);
    }
  };
};

module.exports = checkRole;
