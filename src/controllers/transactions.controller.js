const transactionService = require("../services/transactions.service");
const { errorHandler } = require("../helpers/common.helper");
const { StatusCodes } = require("http-status-codes");

const generate = async (req, res, next) => {
  try {
    const transaction = await transactionService.create(req.body);

    res.data = { transaction };
    res.message = "Transaction created successfully";
    res.statusCode = StatusCodes.CREATED;
    next();
  } catch (error) {
    errorHandler(
      res,
      error.message,
      error.statusCode || StatusCodes.BAD_REQUEST,
    );
  }
};

const fetchAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;

    const result = await transactionService.getAll(filters, page, limit);

    res.data = { transactions: result };
    res.message = "Transactions fetched successfully";
    res.statusCode = StatusCodes.OK;
    next();
  } catch (error) {
    errorHandler(
      res,
      error.message,
      error.statusCode || StatusCodes.BAD_REQUEST,
    );
  }
};

const fetchById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await transactionService.getById(id);

    if (!transaction) {
      return throwCustomError("Transaction not found", StatusCodes.NOT_FOUND);
    }

    res.data = { transaction };
    res.message = "Transaction fetched successfully";
    res.statusCode = StatusCodes.OK;
    next();
  } catch (error) {
    errorHandler(
      res,
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
      error.message,
      error.statusCode || StatusCodes.BAD_REQUEST,
    );
  }
};

module.exports = {
  generate,
  fetchAll,
  fetchById,
  remove,
};
