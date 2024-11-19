const checkRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      const userRoleNames = req.user.roles.map((role) => role.name);

      const hasAccess = requiredRoles.some((role) =>
        userRoleNames.includes(role),
      );

      if (!hasAccess) {
        return errorHandler(res, "Access denied", 403);
      }

      next(); // User has access, proceed
    } catch (error) {
      console.error("Error in role middleware:", error);
      return errorHandler(res, "Server error", 400);
    }
  };
};

module.exports = checkRole;
