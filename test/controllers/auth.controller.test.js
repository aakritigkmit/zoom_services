const authController = require("../../src/controllers/auth.controller");
const authService = require("../../src/services/auth.service");

const { StatusCodes } = require("http-status-codes");
const { faker } = require("@faker-js/faker");

jest.mock("../../src/services/auth.service");
jest.mock("../../src/helpers/common.helper");
jest.mock("../../src/helpers/jwt.helper");

const {
  errorHandler,
  responseHandler,
} = require("../../src/helpers/common.helper");
const { blacklistToken } = require("../../src/helpers/jwt.helper");

describe("Auth Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      headers: {},
    };
    res = {
      message: "",
      statusCode: 0,
      data: {},
    };
    next = jest.fn();
  });

  describe("sendOtp", () => {
    it("should send OTP successfully", async () => {
      const email = faker.internet.email();
      req.body.email = email;

      authService.sendOtp.mockResolvedValue(true); // Mock the service

      await authController.sendOtp(req, res, next);

      expect(res.message).toBe("Otp sent Successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error when OTP sending fails", async () => {
      const email = faker.internet.email();
      req.body.email = email;

      authService.sendOtp.mockRejectedValue(new Error("OTP sending failed"));

      await authController.sendOtp(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("verifyOtp", () => {
    it("should verify OTP successfully", async () => {
      const email = faker.internet.email();
      const otp = faker.number.int();
      req.body = { email, otp };

      authService.verifyOtp.mockResolvedValue(true);

      await authController.verifyOtp(req, res, next);

      expect(res.message).toBe("OTP verified");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error when OTP verification fails", async () => {
      const email = faker.internet.email();
      const otp = faker.number.int();
      req.body = { email, otp };

      authService.verifyOtp.mockRejectedValue(
        new Error("OTP verification failed"),
      );

      await authController.verifyOtp(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("register", () => {
    it("should register user successfully", async () => {
      const payload = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      req.body = payload;

      authService.registerUser.mockResolvedValue({
        id: faker.string.uuid(),
        ...payload,
      });

      await authController.register(req, res, next);

      expect(res.message).toBe("User registered successfully");
      expect(res.statusCode).toBe(StatusCodes.CREATED);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during registration", async () => {
      const payload = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      req.body = payload;

      authService.registerUser.mockRejectedValue(
        new Error("User registration failed"),
      );

      await authController.register(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should login successfully", async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      req.body = { email, password };

      const token = faker.string.uuid();
      authService.login.mockResolvedValue(token);

      await authController.login(req, res, next);

      expect(res.message).toBe("Login successful");
      expect(res.data.token).toBe(token);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(next).toHaveBeenCalled();
    });

    it("should handle login error", async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      req.body = { email, password };

      authService.login.mockRejectedValue(new Error("Invalid credentials"));

      await authController.login(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      const token = faker.string.uuid();
      req.headers["authorization"] = `Bearer ${token}`;

      blacklistToken.mockResolvedValue(true);

      await authController.logout(req, res, next);

      expect(res.message).toBe("Logged out successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error if token is missing", async () => {
      req.headers["authorization"] = null;

      await authController.logout(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(res, "Token not provided", 401);
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle error during logout", async () => {
      const token = faker.string.uuid();
      req.headers["authorization"] = `Bearer ${token}`;

      blacklistToken.mockRejectedValue(new Error("Blacklist failed"));

      await authController.logout(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        res,
        new Error("Blacklist failed"),
        "Failed to logout",
        400,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});
