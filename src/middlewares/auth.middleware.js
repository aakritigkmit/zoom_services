const { verifyToken } = require("../helpers/jwt.helper");
const { User, Role } = require("../models");

const authenticate = async (req, res, next) => {
  const token = (
    req.headers["authorization"] || req.headers["Authorization"]
  )?.split(" ")[1];

  if (!token) {
    return errorHandler(res, "Access denied. No token provided", 401);
  }

  try {
    const decoded = await verifyToken(token);
    const user = await User.findByPk(decoded.id, {
      include: {
        model: Role,
        as: "roles",
        through: { attributes: [] },
        required: true,
      },
    });

    if (!user) {
      return errorHandler(res, "User not found", 404);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.message === "Token is blacklisted") {
      return errorHandler(res, "Token has been revoked", 401);
    }
    errorHandler(res, error.message, 401);
  }
};

module.exports = { authenticate };
