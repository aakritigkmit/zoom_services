const { errorHandler } = require("../../src/helpers/common.helper");
const validateRequest = require("../../src/middlewares/validator.middleware");
const Joi = require("joi");

jest.mock("../../src/helpers/common.helper");

describe("validateRequest Middleware", () => {
  let req, res, next, schema;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    schema = Joi.object({
      name: Joi.string().min(3).required(),
      email: Joi.string().email().required(),
    });
  });

  it("should return 400 if validation fails for body", async () => {
    req.body = {
      name: "Jo",
      email: "invalid-email",
    };

    const errorMessage = [
      {
        message: '"name" length must be at least 3 characters long',
        path: ["name"],
      },
      { message: '"email" must be a valid email', path: ["email"] },
    ];

    await validateRequest(schema)(req, res, next);

    // Ensure errorHandler is called once
    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(errorHandler).toHaveBeenCalledWith(
      res,
      expect.any(Error),
      errorMessage,
      400,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if validation passes for body", async () => {
    req.body = {
      name: "John",
      email: "john@example.com",
    };

    await validateRequest(schema)(req, res, next);

    // Ensure next() is called
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should return 400 if validation fails for params", async () => {
    req.params = {
      name: "Jo",
      email: "invalid-email",
    };

    const errorMessage = [
      {
        message: '"name" length must be at least 3 characters long',
        path: ["name"],
      },
      { message: '"email" must be a valid email', path: ["email"] },
    ];

    await validateRequest(schema, true)(req, res, next);

    // Ensure errorHandler is called once
    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(errorHandler).toHaveBeenCalledWith(
      res,
      expect.any(Error),
      errorMessage,
      400,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if validation passes for params", async () => {
    req.params = {
      name: "John",
      email: "john@example.com",
    };

    await validateRequest(schema, true)(req, res, next);

    // Ensure next() is called once
    expect(next).toHaveBeenCalledTimes(1);
  });
});
