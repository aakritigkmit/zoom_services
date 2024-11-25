const { authenticate } = require("../../src/middlewares/auth.middleware");
const { User, Role } = require("../../src/models");
const { verifyToken } = require("../../src/helpers/jwt.helper");

jest.mock("../../src/helpers/jwt.helper");
jest.mock("../../src/models");

const { errorHandler } = require("../../src/helpers/common.helper");

jest.mock("../../src/models");
jest.mock("../../src/helpers/jwt.helper");
jest.mock("../../src/helpers/common.helper");

describe("Authenticate Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should return 401 if no token is provided", async () => {
    await authenticate(req, res, next);

    expect(errorHandler).toHaveBeenCalledWith(
      res,
      "Access denied. No token provided",
      401,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if user is not verified", async () => {
    req.headers["authorization"] = "Bearer some-token";
    const decodedToken = { id: 1 };

    verifyToken.mockResolvedValue(decodedToken);
    User.findByPk.mockResolvedValue({
      id: 1,
      verified: false,
      roles: [{ name: "admin" }],
    });

    await authenticate(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith("some-token");
    expect(User.findByPk).toHaveBeenCalledWith(1, {
      include: {
        model: Role,
        as: "roles",
        through: { attributes: [] },
        required: true,
      },
    });
    expect(errorHandler).toHaveBeenCalledWith(res, "User not verified", 403);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token is blacklisted", async () => {
    req.headers["authorization"] = "Bearer blacklisted-token";

    verifyToken.mockRejectedValue(new Error("Token is blacklisted"));

    await authenticate(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith("blacklisted-token");
    expect(errorHandler).toHaveBeenCalledWith(
      res,
      "Token has been revoked",
      401,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() if user is verified and token is valid", async () => {
    req.headers["authorization"] = "Bearer valid-token";
    const decodedToken = { id: 1 };

    verifyToken.mockResolvedValue(decodedToken);
    User.findByPk.mockResolvedValue({
      id: 1,
      verified: true,
      roles: [{ name: "admin" }],
    });

    await authenticate(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith("valid-token");
    expect(User.findByPk).toHaveBeenCalledWith(1, {
      include: {
        model: Role,
        as: "roles",
        through: { attributes: [] },
        required: true,
      },
    });
    expect(req.user).toEqual({
      id: 1,
      verified: true,
      roles: [{ name: "admin" }],
    });
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 for other token-related errors", async () => {
    req.headers["authorization"] = "Bearer invalid-token";

    verifyToken.mockRejectedValue(new Error("Invalid token"));

    await authenticate(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith("invalid-token");
    expect(errorHandler).toHaveBeenCalledWith(res, "Invalid token", 401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle errors thrown by User.findByPk", async () => {
    req.headers["authorization"] = "Bearer valid-token";
    const decodedToken = { id: 1 };

    verifyToken.mockResolvedValue(decodedToken);
    User.findByPk.mockRejectedValue(new Error("Database error"));

    await authenticate(req, res, next);

    expect(User.findByPk).toHaveBeenCalledWith(1, {
      include: {
        model: Role,
        as: "roles",
        through: { attributes: [] },
        required: true,
      },
    });
    expect(errorHandler).toHaveBeenCalledWith(res, "Database error", 401);
    expect(next).not.toHaveBeenCalled();
  });
});
