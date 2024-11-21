const {
  toCamelCase,
  normalizeTimestamps,
  removeCircularReferences,
} = require("../helpers/serializer.helper");

const userSerializer = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phoneNumber: user.phone_number,
  city: user.city,
  roles: user.roles || [],
  ...normalizeTimestamps(user), // Normalize createdAt and updatedAt timestamps
});

const authSerializer = (req, res, next) => {
  if (!res.data) {
    return next();
  } // If there's no data, skip serialization.

  const serializeData = (data) => {
    if (data.user) {
      return {
        user: userSerializer(data.user),
        message: data.message || null,
      };
    } else if (data.token) {
      return {
        token: data.token,
      };
    } else if (data.otp) {
      return {
        otp: data.otp,
      };
    } else {
      return data; // Fallback for other response structures.
    }
  };

  // Remove circular references, convert to camelCase, and serialize.
  res.data = removeCircularReferences(res.data);
  res.data = serializeData(res.data);
  res.data = toCamelCase(res.data);

  next();
};

module.exports = {
  authSerializer,
};
