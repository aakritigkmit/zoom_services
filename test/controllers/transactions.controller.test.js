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

  describe("create", () => {
    it("should create a transaction successfully", async () => {
      const transactionData = {
        amount: 100,
        user_id: faker.string.uuid(),
        car_id: faker.string.uuid(),
        status: "Completed",
      };
      req.body = transactionData;

      transactionService.create.mockResolvedValue(transactionData);

      await transactionController.create(req, res, next);

      expect(res.message).toBe("Transaction created successfully");
      expect(res.statusCode).toBe(StatusCodes.CREATED);
      expect(res.data.transaction).toEqual(transactionData);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during transaction creation", async () => {
      req.body = { amount: 100 };

      transactionService.create.mockRejectedValue(
        new Error("Failed to create transaction"),
      );

      await transactionController.create(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("fetchAll", () => {
    it("should fetch all transactions successfully", async () => {
      const transactions = [
        { id: faker.string.uuid(), amount: 100, status: "Completed" },
        { id: faker.string.uuid(), amount: 50, status: "Pending" },
      ];
      req.query.page = 1;
      req.query.limit = 10;

      transactionService.fetchAll.mockResolvedValue(transactions);

      await transactionController.fetchAll(req, res, next);

      expect(res.message).toBe("Transactions fetched successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data.transactions).toEqual(transactions);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during fetching transactions", async () => {
      req.query.page = 1;
      req.query.limit = 10;

      transactionService.fetchAll.mockRejectedValue(
        new Error("Error fetching transactions"),
      );

      await transactionController.fetchAll(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("fetchById", () => {
    it("should fetch a transaction by ID successfully", async () => {
      const transactionId = faker.string.uuid();
      req.params.id = transactionId;

      const transaction = {
        id: transactionId,
        amount: 100,
        status: "Completed",
      };
      transactionService.fetchById.mockResolvedValue(transaction);

      await transactionController.fetchById(req, res, next);

      expect(res.message).toBe("Transaction fetched successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data.transaction).toEqual(transaction);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during transaction fetch by ID", async () => {
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
    it("should delete a transaction successfully", async () => {
      const transactionId = faker.string.uuid();
      req.params.id = transactionId;

      transactionService.remove.mockResolvedValue(transactionId);

      await transactionController.remove(req, res, next);

      expect(res.message).toBe("Transaction deleted successfully");
      expect(res.statusCode).toBe(StatusCodes.NO_CONTENT);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during transaction deletion", async () => {
      req.params.id = faker.string.uuid();

      transactionService.remove.mockRejectedValue(
        new Error("Failed to delete transaction"),
      );

      await transactionController.remove(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });
});
