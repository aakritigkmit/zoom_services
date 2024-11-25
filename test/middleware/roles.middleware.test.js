const checkRole = require("../../src/middlewares/roles.middleware");
const { errorHandler } = require("../../src/helpers/common.helper");

jest.mock("../../src/helpers/common.helper");

describe("checkRole Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {
        id: 1,
        roles: [{ name: "admin" }, { name: "user" }],
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should call next() if user has a required role", async () => {
    const middleware = checkRole(["admin"]);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should return 403 if user does not have a required role", async () => {
    req.user.roles = [{ name: "user" }]; // Simulate a user without the "admin" role

    const middleware = checkRole(["admin"]);

    await middleware(req, res, next);

    expect(errorHandler).toHaveBeenCalledWith(res, "Access denied", 403);
    expect(next).not.toHaveBeenCalled();
  });
});
