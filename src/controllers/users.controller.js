const userService = require("../services/users.service");
const { StatusCodes } = require("http-status-codes");
const {
  throwCustomError,
  errorHandler,
} = require("../helpers/common.helper.js");

const create = async (req, res, next) => {
  const payload = req.body;

  try {
    const newUser = await userService.create(payload);

    res.message = "User registered successfully";
    res.statusCode = StatusCodes.CREATED;

    next();
  } catch (error) {
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};

const fetchUsers = async (req, res, next) => {
  try {
    const { page, pageSize } = req.query;

    if (!req.user || !req.user.roles.some((role) => role.name === "Admin")) {
      return throwCustomError("Forbidden", StatusCodes.FORBIDDEN);
    }

    const users = await userService.fetchUsers(page, pageSize);

    res.data = { users };
    res.message = "Users fetched successfully";

    res.statusCode = StatusCodes.OK;
    next();
  } catch (error) {
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};

const fetchById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await userService.fetchById(id, req.user);

    if (result.statusCode) {
      return errorHandler(res, result, result.statusCode);
    }

    res.data = { user: result.user };
    res.message = "User fetched successfully";
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
    console.log(error);
  }
};

const fetchCurrentUser = async (req, res, next) => {
  try {
    const id = req.user.id;
    const user = await userService.fetchCurrentUser(id);

    res.data = user;
    res.message = "User details retrieved successfully";
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    console.error("Error fetching user details:", error);
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (
      req.user.id !== id &&
      !req.user.roles.some((role) => role.name === "Admin")
    ) {
      return throwCustomError("Forbidden", StatusCodes.FORBIDDEN);
    }

    const updatedUser = await userService.update(id, req.body);

    if (!updatedUser) {
      return throwCustomError("User not found", StatusCodes.NOT_FOUND);
    }

    res.data = { updatedUser };
    res.message = "User details updated successfully";
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    console.log(error);
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};

const updateCurrentUserDetails = async (req, res, next) => {
  try {
    const id = req.user.id;

    const updatedUser = await userService.update(id, req.body);

    if (!updatedUser) {
      return throwCustomError("User not found", StatusCodes.NOT_FOUND);
    }

    res.data = { updatedUser };
    res.message = "User details updated successfully";
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    console.log(error);
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await userService.remove(id);

    if (!deleted) {
      return throwCustomError("User not found", StatusCodes.NOT_FOUND);
    }

    res.message = "User deleted successfully";
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};

const fetchBookings = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const { page = 1, pageSize = 10 } = req.query;
    const bookings = await userService.fetchBookings(
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
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};

const fetchTransactions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    const transactions = await userService.fetchTransactions(id, page, limit);

    if (transactions.length) {
      return throwCustomError(
        "No Transaction found for this user",
        StatusCodes.NOT_FOUND,
      );
    }

    res.data = transactions;
    res.message = "User  transactions retrieved successfully";
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};
module.exports = {
  fetchTransactions,
  fetchBookings,
  remove,
  update,
  fetchById,
  fetchUsers,
  create,
  fetchCurrentUser,
  updateCurrentUserDetails,
};
