const transactionService = require("../services/transactions.service");
const { errorHandler } = require("../helpers/common.helper");
const { StatusCodes } = require("http-status-codes");

const fetchAll = async (req, res, next) => {
  try {
    const result = await transactionService.fetchAll(req.query);

    res.data = result;
    res.message = "Transactions fetched successfully";
    res.statusCode = StatusCodes.OK;
    next();
  } catch (error) {
    errorHandler(
      res,
      error,
      error.message,
      error.statusCode || StatusCodes.BAD_REQUEST,
    );
  }
};

const fetchById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await transactionService.fetchById(id);

    res.data = { transaction };
    res.message = "Transaction fetched successfully";
    res.statusCode = StatusCodes.OK;
    next();
  } catch (error) {
    errorHandler(
      res,
      error,
      error.message,
      error.statusCode || StatusCodes.BAD_REQUEST,
    );
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    await transactionService.remove(id);

    res.message = "Transaction deleted successfully";
    res.statusCode = StatusCodes.NO_CONTENT;

    next();
  } catch (error) {
    errorHandler(
      res,
      error,
      error.message,
      error.statusCode || StatusCodes.BAD_REQUEST,
    );
  }
};

module.exports = {
  fetchAll,
  fetchById,
  remove,
};
