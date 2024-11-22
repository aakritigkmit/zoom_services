const {
  toCamelCase,
  normalizeTimestamps,
  removeCircularReferences,
} = require("../helpers/serializer.helper");

const roleSerializer = (role) => ({
  id: role.id,
  name: role.name,
  ...normalizeTimestamps(role),
});

const userSerializerMiddleware = (user) => ({
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

const usersListSerializer = (usersData) => ({
  totalUsers: usersData.totalUsers,
  currentPage: usersData.currentPage,
  totalPages: usersData.totalPages,
  users: usersData.users.map(userSerializerMiddleware),
});

const userSerializer = (req, res, next) => {
  if (!res.data) {
    return next();
  }
  // console.log("====================>", res.data);
  const serializeData = (data) => {
    if (data.newUser) {
      return {
        newUser: userSerializerMiddleware(data.newUser),
      };
    } else if (data.users) {
      return usersListSerializer(data.users);
    } else if (data.user) {
      return {
        user: userSerializerMiddleware(data.user),
      };
    } else if (data.bookings) {
      return data;
    } else {
      return data;
    }
  };

  res.data = removeCircularReferences(res.data);
  res.data = serializeData(res.data);
  res.data = toCamelCase(res.data);

  next();
};

module.exports = {
  userSerializer,
};
