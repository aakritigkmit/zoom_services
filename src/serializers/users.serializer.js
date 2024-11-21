const {
  toCamelCase,
  normalizeTimestamps,
  removeCircularReferences,
} = require("../helpers/serializer.helper");

// Serialize a single role
const roleSerializer = (role) => ({
  id: role.id,
  name: role.name,
  ...normalizeTimestamps(role),
});

// Serialize a single user
const userSerializer = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phoneNumber: user.phone_number,
  city: user.city,
  roles: Array.isArray(user.roles)
    ? user.roles.map((role) =>
        typeof role === "string" ? { name: role } : roleSerializer(role),
      )
    : [],
  ...normalizeTimestamps(user),
});

// Serialize a list of users
const usersListSerializer = (usersData) => ({
  totalUsers: usersData.totalUsers,
  currentPage: usersData.currentPage,
  totalPages: usersData.totalPages,
  users: usersData.users.map(userSerializer),
});

// Main serializer middleware
const userSerializerMiddleware = (req, res, next) => {
  if (!res.data) {
    return next();
  }

  const serializeData = (data) => {
    if (data.newUser) {
      return {
        newUser: userSerializer(data.newUser),
      };
    } else if (data.users) {
      return usersListSerializer(data.users);
    } else if (data.user) {
      return {
        user: userSerializer(data.user),
      };
    } else if (data.bookings) {
      // If bookings serialization is required, add it here
      return data; // Default to raw data for now
    } else {
      return data; // Fallback for other cases
    }
  };

  // Remove circular references, serialize data, and convert to camelCase
  res.data = removeCircularReferences(res.data);
  res.data = serializeData(res.data);
  res.data = toCamelCase(res.data);

  next();
};

module.exports = {
  userSerializerMiddleware,
};
