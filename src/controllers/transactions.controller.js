const transactionService = require("../services/transactions.service");
const { errorHandler, responseHandler } = require("../helpers/common.helper");

const generate = async (req, res) => {
  try {
    const transaction = await transactionService.create(req.body);

    return responseHandler(
      res,
      transaction,
      "Transaction created successfully",
      201,
    );
  } catch (error) {
    console.error("Error creating transaction:", error.message);
    return errorHandler(res, error);
  }
};

const fetchAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;

    const result = await transactionService.getAll(filters, page, limit);

    // res.data = result;
    res.statusCode = 200;
    responseHandler(res, result);
  } catch (error) {
    console.error(error);

    if (error.statusCode) {
      errorHandler(res, error.message, error.statusCode);
    } else {
      errorHandler(res, "Transaction not found", 404);
    }
  }
};

const fetchById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await transactionService.getById(id);

    // res.data = transaction;
    res.statusCode = 200;
    responseHandler(res, transaction);
  } catch (error) {
    console.error(error);

    if (error.statusCode) {
      errorHandler(res, error.message, error.statusCode);
    } else {
      errorHandler(res, "Transaction not found", 404);
    }
  }
};

module.exports = { generate, fetchAll, fetchById };
