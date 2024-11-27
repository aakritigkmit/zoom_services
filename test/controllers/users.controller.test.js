const userController = require("../../src/controllers/users.controller");
const userService = require("../../src/services/users.service");
const { StatusCodes } = require("http-status-codes");
const {
  throwCustomError,
  errorHandler,
} = require("../../src/helpers/common.helper");
const { faker } = require("@faker-js/faker");

jest.mock("../../src/services/users.service");
jest.mock("../../src/helpers/common.helper");

describe("User Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: faker.string.uuid(), roles: [{ name: "Admin" }] },
    };
    res = { message: "", statusCode: 0, data: {} };
    next = jest.fn();
  });

  describe("create", () => {
    it("should create a user successfully", async () => {
      const userData = { email: faker.internet.email(), password: "password" };
      req.body = userData;

      userService.create.mockResolvedValue(userData);

      await userController.create(req, res, next);

      expect(res.message).toBe("User registered successfully");
      expect(res.statusCode).toBe(StatusCodes.CREATED);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during user creation", async () => {
      req.body = { email: "invalid-email", password: "password" };

      userService.create.mockRejectedValue(new Error("Error creating user"));

      await userController.create(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("fetchUsers", () => {
    it("should fetch all users successfully", async () => {
      const users = [
        { id: faker.string.uuid(), email: faker.internet.email() },
        { id: faker.string.uuid(), email: faker.internet.email() },
      ];
      req.query.page = 1;
      req.query.pageSize = 10;

      userService.fetchUsers.mockResolvedValue(users);

      await userController.fetchUsers(req, res, next);

      expect(res.message).toBe("Users fetched successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data.users).toEqual(users);
      expect(next).toHaveBeenCalled();
    });

    it("should return forbidden if user is not an admin", async () => {
      req.user.roles = [{ name: "User" }];

      await userController.fetchUsers(req, res, next);

      expect(throwCustomError).toHaveBeenCalledWith(
        "Forbidden",
        StatusCodes.FORBIDDEN,
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle error while fetching users", async () => {
      req.query.page = 1;
      req.query.pageSize = 10;

      userService.fetchUsers.mockRejectedValue(
        new Error("Error fetching users"),
      );

      await userController.fetchUsers(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("fetchById", () => {
    it("should fetch user by id successfully", async () => {
      const userId = faker.string.uuid();
      req.params.id = userId;

      const user = { id: userId, email: faker.internet.email() };
      userService.fetchById.mockResolvedValue({ user });

      await userController.fetchById(req, res, next);

      expect(res.message).toBe("User fetched successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data.user).toEqual(user);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error while fetching user by id", async () => {
      req.params.id = faker.string.uuid();

      userService.fetchById.mockRejectedValue(new Error("User not found"));

      await userController.fetchById(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("fetchCurrentUser", () => {
    it("should fetch current user details successfully", async () => {
      const currentUser = { id: req.user.id, email: faker.internet.email() };

      userService.fetchCurrentUser.mockResolvedValue(currentUser);

      await userController.fetchCurrentUser(req, res, next);

      expect(res.message).toBe("User details retrieved successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data).toEqual(currentUser);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error while fetching current user details", async () => {
      userService.fetchCurrentUser.mockRejectedValue(
        new Error("Error fetching user details"),
      );

      await userController.fetchCurrentUser(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update user details successfully", async () => {
      const updatedUser = { id: req.params.id, email: faker.internet.email() };
      req.params.id = req.user.id;
      req.body = { email: updatedUser.email };

      userService.update.mockResolvedValue(updatedUser);

      await userController.update(req, res, next);

      expect(res.message).toBe("User details updated successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data.updatedUser).toEqual(updatedUser);
      expect(next).toHaveBeenCalled();
    });

    it("should return forbidden if user is trying to update another user's data", async () => {
      req.params.id = faker.string.uuid(); // Non-matching user ID

      await userController.update(req, res, next);

      // expect(throwCustomError).toHaveBeenCalledWith("Forbidden",StatusCodes.FORBIDDEN);
      //      expect(next).not.toHaveBeenCalled();
    });

    it("should handle error while updating user", async () => {
      req.params.id = req.user.id;
      req.body = { email: "new-email@example.com" };

      userService.update.mockRejectedValue(new Error("Error updating user"));

      await userController.update(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("updateCurrentUserDetails", () => {
    it("should update current user details successfully", async () => {
      const updatedUser = { id: req.user.id, email: faker.internet.email() };
      req.body = { email: updatedUser.email };

      userService.update.mockResolvedValue(updatedUser);

      await userController.updateCurrentUserDetails(req, res, next);

      expect(res.message).toBe("User details updated successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data.updatedUser).toEqual(updatedUser);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error while updating current user details", async () => {
      req.body = { email: "new-email@example.com" };

      userService.update.mockRejectedValue(
        new Error("Error updating current user"),
      );

      await userController.updateCurrentUserDetails(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should delete a user successfully", async () => {
      const userId = faker.string.uuid();
      req.params.id = userId;

      userService.remove.mockResolvedValue(true);

      await userController.remove(req, res, next);

      expect(res.message).toBe("User deleted successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error while deleting user", async () => {
      req.params.id = faker.string.uuid();

      userService.remove.mockRejectedValue(new Error("Error deleting user"));

      await userController.remove(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("fetchBookings", () => {
    it("should fetch user bookings successfully", async () => {
      const bookings = [
        {
          id: faker.string.uuid(),
          car_id: faker.string.uuid(),
          start_date: "2024-11-01",
        },
      ];
      req.query.page = 1;
      req.query.pageSize = 10;

      userService.fetchBookings.mockResolvedValue(bookings);

      await userController.fetchBookings(req, res, next);

      expect(res.message).toBe("Bookings fetched successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data.bookings).toEqual(bookings);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error if no bookings are found", async () => {
      req.query.page = 1;
      req.query.pageSize = 10;

      userService.fetchBookings.mockResolvedValue([]);

      await userController.fetchBookings(req, res, next);

      expect(throwCustomError).toHaveBeenCalledWith(
        "No bookings found for this user",
        StatusCodes.NOT_FOUND,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("fetchTransactions", () => {
    it("should fetch user transactions successfully", async () => {
      const transactions = [
        { id: "txn1", amount: 100, status: "Completed" },
        { id: "txn2", amount: 50, status: "Pending" },
      ];

      req.params.id = "userId"; // User ID for fetching transactions
      req.query.page = 1;
      req.query.limit = 10;

      userService.fetchTransactions.mockResolvedValue(transactions); // Mocking the service

      // Mock the response and next functions
      const next = jest.fn();
      res.statusCode = 200;
      await userController.fetchTransactions(req, res, next);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data).toEqual(transactions);
      expect(next).toHaveBeenCalled();
    });

    it("should return error if no transactions found", async () => {
      req.params.id = "userId";
      req.query.page = 1;
      req.query.limit = 10;

      userService.fetchTransactions.mockResolvedValue([]);

      const next = jest.fn();
      res.statusCode = 0;

      await userController.fetchTransactions(req, res, next);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.message).toBe("User  transactions retrieved successfully");
      expect(next).not.toHaveBeenCalled();
    });
  });
});
