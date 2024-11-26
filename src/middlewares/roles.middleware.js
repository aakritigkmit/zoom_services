const { errorHandler, responseHandler } = require("../helpers/common.helper");

const checkRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      const userRoleNames = req.user.roles.map((role) => role.name);

      const hasAccess = requiredRoles.some((role) =>
        userRoleNames.includes(role),
      );

      if (!hasAccess) {
        res.message = "Access denied";
        res.statusCode = 403;
        return responseHandler(req, res);
      }

      next();
    } catch (error) {
      console.error("Error in role middleware:", error);
      return errorHandler(res, error, "Server error", 400);
    }
  };
};

module.exports = checkRole;
