const userService = require("../services/users.service");
const { StatusCodes } = require("http-status-codes");

const {
  errorHandler,
  responseHandler,
} = require("../helpers/common.helper.js");

exports.register = async (req, res) => {
  const { name, email, phoneNumber, password, roles, city } = req.body;

  try {
    const newUser = await userService.createUser(
      name,
      email,
      phoneNumber,
      password,
      roles,
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

exports.fetchById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await userService.fetchById(id, req.user);

    if (result.statusCode) {
      return errorHandler(res, result, result.statusCode);
    }

    responseHandler(res, result.user, "User fetched successfully");
  } catch (error) {
    errorHandler(res, error, StatusCodes.INTERNAL_SERVER_ERROR);
    console.log(error);
  }
};

exports.editUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      req.user.id !== id &&
      !req.user.roles.some((role) => role.name === "Admin")
    ) {
      return throwCustomError("Forbidden", StatusCodes.FORBIDDEN);
    }

    const updatedUser = await userService.editUserDetails(id, req.body);
    console.log("updatedUser", updatedUser);
    if (!updatedUser) {
      return throwCustomError("User not found", StatusCodes.NOT_FOUND);
    }

    responseHandler(res, updatedUser, "User details updated successfully");
  } catch (error) {
    errorHandler(res, error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
