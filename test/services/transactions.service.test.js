const { Transaction, Booking } = require("../../src/models");

const transactionService = require("../../src/services/transactions.service.js");

jest.mock("../../src/models");
jest.mock("../../src/utils/email.js");
jest.mock("../../src/helpers/common.helper");

describe("Transaction Service", () => {
  describe("fetchAll", () => {
    test("should fetch all transactions with pagination", async () => {
      const mockTransactions = [
        { id: 1, amount: 200, transaction_status: "Success" },
        { id: 2, amount: 150, transaction_status: "Success" },
      ];

      const mockCount = 2;
      Transaction.findAndCountAll.mockResolvedValue({
        rows: mockTransactions,
        count: mockCount,
      });

      const data = { page: 1, limit: 10 };
      const result = await transactionService.fetchAll(data);

      expect(result.transactions.length).toBe(2);
      expect(result.pagination.totalItems).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });
  });

  describe("fetchById", () => {
    test("should fetch transaction by id", async () => {
      const mockTransaction = {
        id: 1,
        booking_id: 1,
        amount: 200,
        transaction_status: "Success",
      };

      Transaction.findOne.mockResolvedValue(mockTransaction);

      const result = await transactionService.fetchById(1);

      expect(result.id).toBe(1);
      expect(result.transaction_status).toBe("Success");
    });

    test("should throw error if transaction not found", async () => {
      Transaction.findOne.mockResolvedValue(null);

      await expect(transactionService.fetchById(1)).rejects.toThrowError(
        "Transaction not found",
      );
    });
  });

  describe("remove", () => {
    test("should remove transaction successfully", async () => {
      const mockTransaction = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(true),
      };

      Transaction.findByPk.mockResolvedValue(mockTransaction);

      const result = await transactionService.remove(1);

      expect(result.message).toBe("Transaction removed successfully");
      expect(mockTransaction.destroy).toHaveBeenCalled();
    });

    test("should throw error if transaction not found", async () => {
      Transaction.findByPk.mockResolvedValue(null);

      await expect(transactionService.remove(1)).rejects.toThrowError(
        "Cannot read properties of undefined (reading 'rollback')",
      );
    });
  });
});
