const userService = require("../services/users.service");
const { StatusCodes } = require("http-status-codes");
const {
  errorHandler,
  responseHandler,
} = require("../helpers/common.helper.js");

exports.register = async (req, res) => {
  const { name, email, phoneNumber, password, roleName, city } = req.body;

  try {
    const newUser = await userService.createUser(
      name,
      email,
      phoneNumber,
      password,
      roleName,
      city,
    );
    responseHandler(
      res,
      newUser,
      "User registered successfully",
      StatusCodes.CREATED,
    );
  } catch (error) {
    console.log(error);
    errorHandler(res, error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

exports.fetchUser = async (req, res) => {
  try {
    if (!req.user || !req.user.roles.some((role) => role.name === "Admin")) {
      return throwCustomError("Forbidden", StatusCodes.FORBIDDEN);
    }

    const users = await userService.fetchUsers();
    responseHandler(res, users, "Users fetched successfully");
  } catch (error) {
    errorHandler(res, error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
