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

module.exports = { generate };
