const transactionService = require("../services/transactions.service");
const { errorHandler, responseHandler } = require("../helpers/common.helper");
const { StatusCodes } = require("http-status-codes");
const generate = async (req, res) => {
  try {
    const transaction = await transactionService.create(req.body);

    responseHandler(
      res,
      transaction,
      "Transaction created successfully",
      StatusCodes.CREATED,
    );
  } catch (error) {
    errorHandler(
      res,
      error.message,
      error.statusCode || StatusCodes.BAD_REQUEST,
    );
  }
};

const fetchAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;

    const result = await transactionService.getAll(filters, page, limit);

    responseHandler(res, result, "Transactions fetched successfully");
  } catch (error) {
    errorHandler(
      res,
      error.message,
      error.statusCode || StatusCodes.BAD_REQUEST,
    );
  }
};

const fetchById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await transactionService.getById(id);

    if (!transaction) {
      throwCustomError("Transaction not found", StatusCodes.NOT_FOUND);
    }

    responseHandler(res, transaction, "Transaction fetched successfully");
  } catch (error) {
    errorHandler(
      res,
      error.message,
      error.statusCode || StatusCodes.BAD_REQUEST,
    );
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await transactionService.remove(id);

    responseHandler(
      res,
      null,
      "Transaction deleted successfully",
      StatusCodes.NO_CONTENT,
    );
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
