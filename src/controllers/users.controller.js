const userService = require("../services/users.service");
const { StatusCodes } = require("http-status-codes");

const {
  throwCustomError,
  errorHandler,
} = require("../helpers/common.helper.js");

const register = async (req, res, next) => {
  const payload = req.body;

  try {
    const newUser = await userService.createUser(payload);
    console.log("newUser", newUser);

    res.data = { newUser };
    res.message = "User registered successfully";
    res.statusCode = StatusCodes.CREATED;
    next();
  } catch (error) {
    console.log(error);
    errorHandler(res, error, StatusCodes.BAD_REQUEST);
  }
};

const fetchUser = async (req, res, next) => {
  try {
    const { page, pageSize } = req.query;

    if (!req.user || !req.user.roles.some((role) => role.name === "Admin")) {
      return throwCustomError("Forbidden", StatusCodes.FORBIDDEN);
    }

    const users = await userService.fetchUsers(page, pageSize);

    console.log("BEFORE CONTusers", res.data);
    res.data = { users };
    res.message = "Users fetched successfully";
    console.log("AFTER CONTusers", res.data);
    res.statusCode = StatusCodes.OK;
    next();
  } catch (error) {
    errorHandler(res, error, StatusCodes.BAD_REQUEST);
  }
};

const fetchById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await userService.fetchById(id, req.user);

    if (result.statusCode) {
      return errorHandler(res, result, result.statusCode);
    }
    // res.status(200).json({ message: "hellooooooooo" });
    console.log("controllerFetchById", result.user);
    res.data = { user: result.user };
    res.message = "User fetched successfully";
    console.log("controllerFetchById", res.data);
    res.statusCode = StatusCodes.OK;
    next();
  } catch (error) {
    errorHandler(res, error, StatusCodes.BAD_REQUEST);
    console.log(error);
  }
};

const editUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (
      req.user.id !== id &&
      !req.user.roles.some((role) => role.name === "Admin")
    ) {
      return throwCustomError("Forbidden", StatusCodes.FORBIDDEN);
    }

    const updatedUser = await userService.editUserDetails(id, req.body);

    if (!updatedUser) {
      return throwCustomError("User not found", StatusCodes.NOT_FOUND);
    }

    res.data = { updatedUser };
    res.message = "User details updated successfully";
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    console.log(error);
    errorHandler(res, error, StatusCodes.BAD_REQUEST);
  }
};

const removeUser = async (req, res, next) => {
  try {
    const { id } = req.params;

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

    res.message = "User deleted successfully";

    res.statusCode = StatusCodes.OK;
    next();
  } catch (error) {
    errorHandler(res, error, StatusCodes.BAD_REQUEST);
  }
};

const fetchUserBookings = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const { page = 1, pageSize = 10 } = req.query;
    const bookings = await userService.fetchUserBookings(
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

    res.data = { bookings };
    res.message = "Bookings fetched successfully";
    res.statusCode = StatusCodes.OK;
    next();
  } catch (error) {
    errorHandler(res, error, StatusCodes.BAD_REQUEST);
  }
};

const fetchUserTransactions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    const transactions = await userService.fetchUserTransactions(
      id,
      page,
      limit,
    );
    res.data = transactions;
    res.message = "User  transactions retrieved successfully";
    res.statusCode = StatusCodes.OK;
    next();
  } catch (error) {
    errorHandler(res, error, StatusCodes.BAD_REQUEST);
  }
};
module.exports = {
  fetchUserTransactions,
  fetchUserBookings,
  removeUser,
  editUserDetails,
  fetchById,
  fetchUser,
  register,
};
