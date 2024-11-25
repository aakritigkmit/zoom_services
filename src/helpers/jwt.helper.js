const { client } = require("../config/redis");
const jwt = require("jsonwebtoken");

exports.generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};

exports.verifyToken = async (token) => {
  const isBlacklisted = await client.get(token);
  console.log("Is token blacklisted:", isBlacklisted);
  if (isBlacklisted) {
    throw new Error("Token is blacklisted");
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("Token verification failed:", err.message);
    throw err;
  }
};

exports.blacklistToken = async (token) => {
  const decodedToken = jwt.decode(token);
  if (!decodedToken || !decodedToken.exp) {
    throw new Error("Failed to decode token or retrieve expiration.");
  }

  const expirationTime = decodedToken.exp - Math.floor(Date.now() / 1000);
  if (expirationTime > 0) {
    await client.setEx(token, expirationTime, "blacklisted");
  } else {
    console.warn("Token already expired. Not blacklisting.");
  }
};
