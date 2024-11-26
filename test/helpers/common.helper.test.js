const { StatusCodes } = require("http-status-codes");
const {
  throwCustomError,
  errorHandler,
  responseHandler,
} = require("../../src/helpers/common.helper");

describe("Error Handling Functions", () => {
  let res;

  beforeEach(() => {
    // Mocking the response object for testing
    res = {
      statusCode: null,
      message: null,
      data: null,
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("throwCustomError", () => {
    it("should throw an error with the provided message and default status code", () => {
      const message = "Bad request";
      const statusCode = StatusCodes.BAD_REQUEST;

      expect(() => throwCustomError(message)).toThrowError(new Error(message));

      try {
        throwCustomError(message);
      } catch (error) {
        expect(error.message).toBe(message);
        expect(error.statusCode).toBe(statusCode);
      }
    });

    it("should throw an error with the provided message and custom status code", () => {
      const message = "Custom error";
      const customStatusCode = StatusCodes.UNAUTHORIZED;

      expect(() => throwCustomError(message, customStatusCode)).toThrowError(
        new Error(message),
      );

      try {
        throwCustomError(message, customStatusCode);
      } catch (error) {
        expect(error.message).toBe(message);
        expect(error.statusCode).toBe(customStatusCode);
      }
    });
  });

  describe("errorHandler", () => {
    it("should set the response status and message correctly when an error is thrown", () => {
      const error = new Error("Something went wrong");
      error.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

      errorHandler(res, error);

      expect(res.status).toHaveBeenCalledWith(
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Something went wrong",
      });
    });

    it("should use the default status code when error has no statusCode", () => {
      const error = new Error("Bad request");

      errorHandler(res, error);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "Bad request",
      });
    });

    it("should use a custom message when provided", () => {
      const error = new Error("Custom error");
      const message = "Custom message";

      errorHandler(res, error, message);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "Custom error",
      });
    });
  });

  describe("responseHandler", () => {
    it("should return the correct status, message, and data", () => {
      res.statusCode = StatusCodes.OK;
      res.message = "Success";
      res.data = { id: 1, name: "Test" };

      responseHandler({}, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: "Success",
        data: { id: 1, name: "Test" },
      });
    });

    it("should handle missing statusCode, message, and data gracefully", () => {
      res.statusCode = StatusCodes.OK;
      res.message = undefined;
      res.data = undefined;

      responseHandler({}, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: undefined,
        data: undefined,
      });
    });
  });
});
