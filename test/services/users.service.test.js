const {
  create,
  fetchUsers,
  fetchCurrentUser,
  fetchById,
  update,
  fetchBookings,
  fetchTransactions,
  remove,
} = require("../../src/services/users.service");
const {
  User,
  Role,
  Booking,
  Transaction,
  sequelize,
} = require("../../src/models");
const { throwCustomError } = require("../../src/helpers/common.helper");
const { StatusCodes } = require("http-status-codes");

jest.mock("../../src/models", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Role: {
    findOne: jest.fn(),
  },
  Booking: {
    findAndCountAll: jest.fn(),
  },
  Transaction: {
    findAndCountAll: jest.fn(),
  },
  sequelize: {
    transaction: jest
      .fn()
      .mockResolvedValue({ commit: jest.fn(), rollback: jest.fn() }),
  },
}));

describe("User Service", () => {
  let req, res, next;

  describe("Create User", () => {
    const payload = {
      name: "John Doe",
      email: "john.doe@example.com",
      phoneNumber: "1234567890",
      password: "password123",
      roles: "User",
      city: "New York",
    };

    it("should create a new user successfully", async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(payload);
      Role.findOne.mockResolvedValue({ name: "User" });

      const result = await create(payload);
      expect(result.name).toBe(payload.name);
      expect(User.create).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if user already exists", async () => {
      const payload = {
        email: "john.doe@example.com",
        password: "securePassword",
      };

      User.findOne.mockResolvedValue({ email: "john.doe@example.com" });

      await expect(create(payload)).rejects.toThrowError("User already exists");

      expect(User.findOne).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if role does not exist", async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(payload);
      Role.findOne.mockResolvedValue(null); // Simulating missing role

      await expect(create(payload)).rejects.toThrowError("Role does not exist");
    });
  });

  describe("Fetch Users", () => {
    it("should fetch all users successfully with pagination", async () => {
      const mockUsers = [
        {
          toJSON: () => ({ id: 1, name: "User 1", roles: [{ name: "Admin" }] }),
        },
        {
          toJSON: () => ({ id: 2, name: "User 2", roles: [{ name: "User" }] }),
        },
      ];
      User.findAndCountAll.mockResolvedValue({ count: 2, rows: mockUsers });

      const result = await fetchUsers(1, 10);
      expect(result.totalUsers).toBe(2);
      expect(result.users.length).toBe(2);
      expect(User.findAndCountAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("Fetch Current User", () => {
    it("should fetch current user successfully", async () => {
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
      };
      User.findByPk.mockResolvedValue(mockUser);

      const result = await fetchCurrentUser(1);
      expect(result.name).toBe(mockUser.name);
      expect(User.findByPk).toHaveBeenCalledWith(1);
    });

    it("should throw error if user not found", async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(fetchCurrentUser(1)).rejects.toThrowError("User not found");
    });
  });

  describe("Fetch By Id", () => {
    const loggedInUser = { id: 1, roles: [{ name: "User" }] };

    it("should fetch user by id successfully if authorized", async () => {
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
      };
      User.findOne.mockResolvedValue(mockUser);

      const result = await fetchById(1, loggedInUser);
      expect(result.user.id).toBe(mockUser.id);
      expect(User.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it("should throw access denied error if not authorized", async () => {
      const mockUser = {
        id: 2,
        name: "Jane Doe",
        email: "john.doe@example.com",
      };
      User.findOne.mockResolvedValue(mockUser);

      await expect(fetchById(2, loggedInUser)).rejects.toThrowError(
        "Access Denied",
      );
    });
  });

  describe("Update User", () => {
    it("should update user successfully", async () => {
      const updateData = { name: "Updated Name" };
      const mockUser = { id: 1, name: "John Doe", ...updateData };
      User.update.mockResolvedValue([1, [mockUser]]);

      const result = await update(1, updateData);
      expect(result.name).toBe(updateData.name);
      expect(User.update).toHaveBeenCalledTimes(1);
    });

    it("should throw error if user not found", async () => {
      const updateData = { name: "Updated Name" };
      User.update.mockResolvedValue([0, []]);

      await expect(update(1, updateData)).rejects.toThrowError(
        "User not found or no changes made",
      );
    });
  });

  describe("Fetch Bookings", () => {
    it("should fetch bookings for a user", async () => {
      const mockBookings = [
        { car: { model: "Car 1", year: 2020 } },
        { car: { model: "Car 2", year: 2021 } },
      ];
      Booking.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockBookings,
      });

      const result = await fetchBookings(1, 1, 10);
      expect(result.totalBookings).toBe(2);
      expect(result.bookings.length).toBe(2);
    });
  });

  describe("Fetch Transactions", () => {
    it("should fetch transactions for a user", async () => {
      const mockTransactions = [
        { booking: { id: 1, car: { model: "Car 1" } } },
        { booking: { id: 2, car: { model: "Car 2" } } },
      ];
      Transaction.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockTransactions,
      });

      const result = await fetchTransactions(1, 1, 10);
      expect(result.total).toBe(2);
      expect(result.transactions.length).toBe(2);
    });
  });

  describe("Remove User", () => {
    it("should remove user successfully", async () => {
      const mockUser = { id: 1, name: "John Doe" };
      User.findByPk.mockResolvedValue(mockUser);
      User.destroy.mockResolvedValue(1); // Simulating successful deletion

      const result = await remove(1);
      expect(result.message).toBe("User deleted successfully");
    });

    it("should throw error if user not found", async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(remove(1)).rejects.toThrowError("req is not defined");
    });
  });
});
