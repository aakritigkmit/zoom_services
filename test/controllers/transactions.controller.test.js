const transactionController = require("../../src/controllers/transactions.controller");
const transactionService = require("../../src/services/transactions.service");
const { StatusCodes } = require("http-status-codes");
const { faker } = require("@faker-js/faker");

jest.mock("../../src/services/transactions.service");
jest.mock("../../src/helpers/common.helper");

const { errorHandler } = require("../../src/helpers/common.helper");

describe("Transaction Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = { message: "", statusCode: 0, data: {} };
    next = jest.fn();
  });

  describe("fetchAll", () => {
    it("should fetch all transactions successfully", async () => {
      const transactions = [
        { id: faker.string.uuid(), amount: 100, date: "2024-11-01" },
        { id: faker.string.uuid(), amount: 200, date: "2024-11-02" },
      ];
      req.query.page = 1;
      req.query.pageSize = 10;

      transactionService.fetchAll.mockResolvedValue(transactions);

      await transactionController.fetchAll(req, res, next);

      expect(res.message).toBe("Transactions fetched successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data).toEqual(transactions);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error while fetching transactions", async () => {
      req.query.page = 1;
      req.query.pageSize = 10;

      transactionService.fetchAll.mockRejectedValue(
        new Error("Error fetching transactions"),
      );

      await transactionController.fetchAll(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("fetchById", () => {
    it("should fetch transaction by ID successfully", async () => {
      const transactionId = faker.string.uuid();
      req.params.id = transactionId;

      const transaction = {
        id: transactionId,
        amount: 100,
        date: "2024-11-01",
      };
      transactionService.fetchById.mockResolvedValue(transaction);

      await transactionController.fetchById(req, res, next);

      expect(res.message).toBe("Transaction fetched successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data.transaction).toEqual(transaction);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error while fetching transaction by ID", async () => {
      req.params.id = faker.string.uuid();

      transactionService.fetchById.mockRejectedValue(
        new Error("Transaction not found"),
      );

      await transactionController.fetchById(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should delete transaction successfully", async () => {
      const transactionId = faker.string.uuid();
      req.params.id = transactionId;

      transactionService.remove.mockResolvedValue(true);

      await transactionController.remove(req, res, next);

      expect(res.message).toBe("Transaction deleted successfully");
      expect(res.statusCode).toBe(StatusCodes.NO_CONTENT);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error while deleting transaction", async () => {
      req.params.id = faker.string.uuid();

      transactionService.remove.mockRejectedValue(
        new Error("Error deleting transaction"),
      );

      await transactionController.remove(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });
});
