const { verifyToken } = require("../helpers/jwt.helper");
const { User, Role } = require("../models");
const { errorHandler } = require("../helpers/common.helper");
const { StatusCodes } = require("http-status-codes");

const authenticate = async (req, res, next) => {
  const token = (
    req.headers["authorization"] || req.headers["Authorization"]
  )?.split(" ")[1];

  if (!token) {
    return errorHandler(
      res,
      "Access denied. No token provided",
      StatusCodes.UNAUTHORIZED,
    );
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

    if (!user || !user.verified) {
      return errorHandler(res, "User not verified", StatusCodes.FORBIDDEN);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.message === "Token is blacklisted") {
      return errorHandler(
        res,
        "Token has been revoked",
        StatusCodes.UNAUTHORIZED,
      );
    }
    errorHandler(res, error.message, StatusCodes.UNAUTHORIZED);
  }
};

module.exports = { authenticate };
