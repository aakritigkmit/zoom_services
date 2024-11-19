const userService = require("../services/users.service");
const bookingService = require("../services/bookings.service");
const { StatusCodes } = require("http-status-codes");

const {
  errorHandler,
  responseHandler,
  throwCustomError,
} = require("../helpers/common.helper.js");

const register = async (req, res) => {
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
    errorHandler(res, error, StatusCodes.BAD_REQUEST);
  }
};

const fetchUser = async (req, res) => {
  try {
    const { page, pageSize } = req.query;
    if (!req.user || !req.user.roles.some((role) => role.name === "Admin")) {
      return throwCustomError("Forbidden", StatusCodes.FORBIDDEN);
    }

    const users = await userService.fetchUsers(page, pageSize);
    responseHandler(res, users, "Users fetched successfully");
  } catch (error) {
    errorHandler(res, error, StatusCodes.BAD_REQUEST);
  }
};

const fetchById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await userService.fetchById(id, req.user);

    if (result.statusCode) {
      return errorHandler(res, result, result.statusCode);
    }

    responseHandler(res, result.user, "User fetched successfully");
  } catch (error) {
    errorHandler(res, error, StatusCodes.BAD_REQUEST);
    console.log(error);
  }
};

const editUserDetails = async (req, res) => {
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
    errorHandler(res, error, StatusCodes.BAD_REQUEST);
  }
};

const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Admins can delete any user, but users can only delete their own profile
    if (
      req.user.id !== id &&
      !req.user.roles.some((role) => role.name === "Admin")
    ) {
      return throwCustomError("Forbidden", StatusCodes.FORBIDDEN);
    }

    const deleted = await userService.removeUser(id);
    if (!deleted) {
      return throwCustomError("User not found", StatusCodes.NOT_FOUND);
    }

    responseHandler(res, null, "User deleted successfully");
  } catch (error) {
    errorHandler(res, error, StatusCodes.BAD_REQUEST);
  }
};

const fetchAllBookingsForUser = async (req, res) => {
  const userId = req.user.id;
  console.log("userId", userId);

  try {
    const { page = 1, pageSize = 10 } = req.query;
    const bookings = await bookingService.fetchAllBookingsForUser(
      userId,
      parseInt(page),
      parseInt(pageSize),
    );

    if (bookings.length === 0) {
      return throwCustomError(
        "No bookings found for this user",
        StatusCodes.NOT_FOUND,
      );
    }

    responseHandler(res, { bookings }, "Bookings fetched successfully");
  } catch (error) {
    // console.error(error);
    errorHandler(res, error, StatusCodes.BAD_REQUEST);
  }
};

module.exports = {
  fetchAllBookingsForUser,
  removeUser,
  editUserDetails,
  fetchById,
  fetchUser,
  register,
};
