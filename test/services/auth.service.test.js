const authService = require("../../src/services/auth.service");
const { client } = require("../../src/config/redis");
const bcrypt = require("bcryptjs");
const { sendOtpEmail } = require("../../src/utils/email");
const { User, Role } = require("../../src/models");
const { throwCustomError } = require("../../src/helpers/common.helper");
const { faker } = require("@faker-js/faker");
const { generateToken } = require("../../src/helpers/jwt.helper");
const { StatusCodes } = require("http-status-codes");

jest.mock("../../src/config/redis");
jest.mock("../../src/utils/email");
jest.mock("../../src/helpers/jwt.helper");
jest.mock("../../src/models");
jest.mock("../../src/helpers/common.helper");

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("../../src/helpers/jwt.helper", () => ({
  generateToken: jest.fn(),
}));

jest.mock("../../src/models", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  Role: {
    findOne: jest.fn(),
  },
}));

describe("Auth Service", () => {
  let userPayload;
  let user;

  beforeEach(() => {
    userPayload = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phoneNumber: faker.number.int(),
      password: "password123",
      city: faker.location.city(),
      roleName: ["Customer"],
    };

    user = {
      id: faker.string.uuid(),
      email: userPayload.email,
      password: "hashedPassword",
      name: userPayload.name,
      phone_number: userPayload.phoneNumber,
      city: userPayload.city,
      verified: false,
      addRole: jest.fn(),
    };
  });

  describe("sendOtp", () => {
    it("should send OTP to email successfully", async () => {
      User.findOne.mockResolvedValue(user);
      client.setEx.mockResolvedValue("OK");
      sendOtpEmail.mockResolvedValue(true);

      const result = await authService.sendOtp(userPayload.email);

      expect(client.setEx).toHaveBeenCalledWith(
        `otp:${userPayload.email}`,
        300,
        expect.any(String),
      );
      expect(sendOtpEmail).toHaveBeenCalledWith(
        userPayload.email,
        expect.any(String),
      );
      expect(result).toBe(true);
    });

    it("should throw error if user is not found", async () => {
      User.findOne.mockResolvedValue(null);

      await authService.sendOtp(userPayload.email);

      expect(throwCustomError).toHaveBeenCalledWith(
        "Email not registered",
        StatusCodes.NOT_FOUND,
      );
    });
  });

  describe("verifyOtp", () => {
    it("should verify OTP successfully", async () => {
      const storedOtp = "123456";
      const otp = "123456";
      client.get.mockResolvedValue(storedOtp);
      client.del.mockResolvedValue("OK");
      User.update.mockResolvedValue([1]);

      const result = await authService.verifyOtp(userPayload.email, otp);

      expect(client.del).toHaveBeenCalled();
      expect(User.update).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    it("should throw error if OTP is invalid", async () => {
      client.get.mockResolvedValue("wrongOtp");

      await authService.verifyOtp(userPayload.email, "123456");

      expect(throwCustomError).toHaveBeenCalledWith(
        "otp is not valid",
        StatusCodes.UNAUTHORIZED,
      );
    });
  });

  describe("Auth Service - registerUser", () => {
    const userPayload = {
      name: "John Doe",
      email: "johndoe@example.com",
      phoneNumber: "1234567890",
      password: "password123",
      city: "New York",
      roleName: ["Customer"],
    };

    beforeEach(() => {
      jest.clearAllMocks();
      jest.mock("bcryptjs");
    });

    it("should throw error if user already registered", async () => {
      const existingUser = {
        id: "1",
        name: "John Doe",
        email: "johndoe@example.com",
        roles: [{ id: "1", name: "Customer" }],
      };

      User.findOne.mockResolvedValueOnce(existingUser);

      await expect(authService.registerUser(userPayload)).rejects.toEqual({
        statusCode: 400,
        message: "User already registered",
      });

      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: userPayload.email },
        include: {
          model: Role,
          as: "roles",
          attributes: ["id", "name"],
        },
      });
    });

    it("should throw error if user already registered", async () => {
      const existingUser = {
        id: "1",
        name: "John Doe",
        email: "johndoe@example.com",
        roles: [{ id: "1", name: "Customer" }],
      };

      Role.findOne.mockResolvedValue({ id: "1", name: "Customer" });

      User.findOne.mockResolvedValueOnce(existingUser);

      await expect(authService.registerUser(userPayload)).rejects.toThrow({
        statusCode: 400,
        message: "Cannot read properties of undefined (reading 'transaction')",
      });

      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: userPayload.email },
        include: {
          model: Role,
          as: "roles",
          attributes: ["id", "name"],
        },
      });

      expect(Role.findOne).toHaveBeenCalledWith({
        where: { name: userPayload.roleName },
      });
    });
    it("should throw error if role is not found", async () => {
      Role.findOne.mockResolvedValue(null);

      await authService.registerUser(userPayload);

      await expect(authService.registerUser(userPayload)).rejects.toThrow(
        "Role not found",
      );

      expect(Role.findOne).toHaveBeenCalledWith({
        where: { name: userPayload.roleName },
      });
    });
    it("should register user if not already registered", async () => {
      const role = { id: "1", name: "Customer" };

      Role.findOne.mockResolvedValue(role);
      User.findOne.mockResolvedValueOnce(null);

      const mockUser = {
        id: "1",
        addRole: jest.fn().mockResolvedValue(true),
        roles: ["Customer"],
      };

      User.create.mockResolvedValueOnce(mockUser);

      const result = await authService.registerUser(userPayload);

      expect(User.create).toHaveBeenCalled();

      expect(mockUser.addRole).toHaveBeenCalledWith(role);
      expect(result).toEqual(mockUser);
    });
  });

  describe("login", () => {
    const loginPayload = {
      email: "test@example.com",
      password: "password123",
    };
    const user = {
      id: 1,
      email: "test@example.com",
      password: "hashedPassword",
      verified: true,
      roles: [{ name: "Customer" }],
    };

    it("should throw error if user is not verified", async () => {
      const unverifiedUser = { ...user, verified: false };
      User.findOne.mockResolvedValueOnce(unverifiedUser);

      await authService.login(loginPayload);

      expect(throwCustomError).toHaveBeenCalledWith(
        "User not verified",
        StatusCodes.FORBIDDEN,
      );

      // await expect(authService.login(loginPayload)).rejects.toThrowError(
      //   "User not verified",
      // );
    });

    it("should throw error if credentials are invalid", async () => {
      const invalidPasswordUser = { ...user, password: "wrongPassword" };
      User.findOne.mockResolvedValueOnce(invalidPasswordUser);

      // Mock bcrypt.compare to return false for invalid password
      bcrypt.compare.mockResolvedValueOnce(false);

      await authService.login(loginPayload);

      expect(throwCustomError).toHaveBeenCalledWith(
        "Invalid credentials",
        StatusCodes.BAD_REQUEST,
      );
    });

    it("should login successfully and generate token", async () => {
      User.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      const token = "generatedToken";
      generateToken.mockReturnValue(token);

      const result = await authService.login(loginPayload);

      expect(result).toBe(token);
    });
  });
});
