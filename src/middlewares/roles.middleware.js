const checkRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      // Ensure `req.user` contains authenticated user's ID
      const userId = req.user.id;

      console.log(req.user.roles);

      const userRoleNames = req.user.roles.map((role) => role.name);
      console.log(userRoleNames);
      // Check if the user has any of the required roles
      const hasAccess = requiredRoles.some((role) =>
        userRoleNames.includes(role),
      );

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      next(); // User has access, proceed
    } catch (error) {
      console.error("Error in role middleware:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
};

module.exports = checkRole;
