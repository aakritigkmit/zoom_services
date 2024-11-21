const { verifyToken } = require("../helpers/jwt.helper");
const { User, Role } = require("../models");

exports.authenticate = async (req, res, next) => {
  const token = (
    req.headers["authorization"] || req.headers["Authorization"]
  )?.split(" ")[1];
  console.log("#######", token);
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided" });
  }
  try {
    const decoded = await verifyToken(token);
    console.log(decoded);
    const user = await User.findByPk(decoded.id, {
      include: {
        model: Role,
        as: "roles",
        through: { attributes: [] },
        required: true,
      },
    });
    req.user = user;
    next();
  } catch (error) {
    if (error.message === "Token is blacklisted") {
      return res.status(401).json({ message: "Token has been revoked." });
    }
    res.status(401).json({ message: error.message });
  }
};
