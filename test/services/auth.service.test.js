const authService = require("../../src/services/auth.service");
const { client } = require("../../src/config/redis");
const bcrypt = require("bcryptjs");
const { sendOtpEmail } = require("../../src/utils/email");
const { User, Role } = require("../../src/models");
const { throwCustomError } = require("../../src/helpers/common.helper");
const { faker } = require("@faker-js/faker");

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
  sign: jest.fn(), // Mocking the `sign` method
}));

describe("User Service", () => {
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

    throwCustomError.mockImplementation((message) => {
      const err = new Error(message);
      throw err;
    });
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

      await expect(authService.sendOtp(userPayload.email)).rejects.toEqual({
        statusCode: 404,
        message: "Email not registered",
      });
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

      expect(client.del).toHaveBeenCalledWith(`otp:${userPayload.email}`);
      expect(User.update).toHaveBeenCalledWith(
        { verified: true },
        { where: { email: userPayload.email } },
      );
      expect(result).toBe(true);
    });
    it("should throw error if OTP is invalid", async () => {
      client.get.mockResolvedValue("wrongOtp");

      await expect(
        authService.verifyOtp(userPayload.email, "123456"),
      ).rejects.toThrowError("otp is not valid");
    });

    describe("registerUser", () => {
      it("should register user successfully", async () => {
        User.findOne.mockResolvedValue(null); // No existing user
        Role.findOne.mockResolvedValue({ id: 1, name: "Customer" }); // Role exists
        bcrypt.hash.mockResolvedValue("hashedPassword"); // Password hashing
        User.create.mockResolvedValue(user); // User creation
        user.addRole.mockResolvedValue(true); // Adding role to user
        sendOtpEmail.mockResolvedValue(true); // Mocking OTP sending

        // Calling the service function
        const result = await authService.registerUser(userPayload);

        // Verifying the User.create call with expected arguments
        expect(User.create).toHaveBeenCalledWith(
          expect.objectContaining({
            email: userPayload.email,
            password: "hashedPassword",
          }),
        );
        expect(result).toEqual(user); // Verifying returned user
      });

      it("should throw error if user already registered", async () => {
        User.findOne.mockResolvedValueOnce(user); // User already exists

        await expect(authService.registerUser(userPayload)).rejects.toEqual({
          statusCode: 409,
          message: "User already registered",
        });
      });

      it("should throw error if role does not exist", async () => {
        Role.findOne.mockResolvedValue(null); // No role found

        await expect(authService.registerUser(userPayload)).rejects.toEqual({
          statusCode: 400,
          message: "Role does not exist",
        });
      });
    });

    describe("login", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      // it("should login user and return token", async () => {
      //   const validPassword = "password123";
      //   user.password = await bcrypt.hash(validPassword, 10);
      //   User.findOne.mockResolvedValue(user);
      //   bcrypt.compare.mockResolvedValue(true);
      //   generateToken.mockReturnValue("token");

      //   const token = await authService.login(userPayload.email, validPassword);

      //   expect(bcrypt.compare).toHaveBeenCalledWith(
      //     validPassword,
      //     user.password,
      //   );
      //   expect(generateToken).toHaveBeenCalledWith({
      //     id: user.id,
      //     role: "Customer",
      //   });
      //   expect(token).toBe("token");
      // });

      // it("should login user and return token", async () => {
      //   // Mocking an existing user with verified status as true
      //   const verifiedUser = { ...user, verified: true };

      //   User.findOne.mockResolvedValue(verifiedUser); // Mocking that the user exists and is verified
      //   bcrypt.compare.mockResolvedValue(true); // Simulate successful password comparison
      //   generateToken.jwt.sign.mockReturnValue("fakeToken"); // Mocking JWT token generation

      //   // Calling the login function
      //   const result = await authService.login(userPayload);

      //   // Check if the token returned is as expected
      //   expect(result.token).toBe("fakeToken");
      //   expect(result.user).toEqual(verifiedUser); // Ensure the verified user is returned
      // });

      // it("should throw error if user not found", async () => {
      //   User.findOne.mockResolvedValue(null);

      //   await expect(
      //     authService.login(userPayload.email, "password123"),
      //   ).rejects.toEqual({
      //     statusCode: 404,
      //     message: "User not registered",
      //   });
      // });

      it("should throw error if user is not verified", async () => {
        user.verified = false;
        User.findOne.mockResolvedValue(user);

        await expect(
          authService.login(userPayload.email, "password123"),
        ).rejects.toEqual({ statusCode: 403, message: "User not verified" });
      });

      it("should throw error if password is invalid", async () => {
        const hashedPassword = await bcrypt.hash("correctPassword", 10);
        User.findOne.mockResolvedValueOnce({
          ...user,
          password: hashedPassword,
          verified: true,
        });
        bcrypt.compare.mockResolvedValueOnce(false);

        await expect(
          authService.login(userPayload.email, "wrongPassword"),
        ).rejects.toEqual({ statusCode: 400, message: "Invalid credentials" });
      });
    });
  });
});
