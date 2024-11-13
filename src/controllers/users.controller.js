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
