const bookingController = require("../../src/controllers/bookings.controller");
const bookingService = require("../../src/services/bookings.service");
const { StatusCodes } = require("http-status-codes");
const { faker } = require("@faker-js/faker");

jest.mock("../../src/services/bookings.service");
jest.mock("../../src/helpers/common.helper");

const { errorHandler } = require("../../src/helpers/common.helper");

describe("Booking Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      headers: {},
      user: { id: faker.string.uuid() },
    };
    res = { message: "", statusCode: 0, data: {} };
    next = jest.fn();
  });

  describe("create", () => {
    it("should create booking successfully", async () => {
      const bookingData = {
        carId: faker.string.uuid(),
        startDate: faker.date.past(),
        endDate: faker.date.future(),
      };
      req.body = bookingData;
      req.user.email = faker.internet.email();

      bookingService.create.mockResolvedValue({
        ...bookingData,
        id: faker.string.uuid(),
      });

      await bookingController.create(req, res, next);

      expect(res.message).toBe("Booking created successfully");
      expect(res.statusCode).toBe(StatusCodes.CREATED);
      expect(res.data.newBooking).toHaveProperty("id");
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during booking creation", async () => {
      req.body = {
        carId: faker.string.uuid(),
        startDate: faker.date.past(),
        endDate: faker.date.future(),
      };

      bookingService.create.mockRejectedValue(
        new Error("Failed to create booking"),
      );

      await bookingController.create(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("fetchById", () => {
    it("should fetch booking by ID successfully", async () => {
      const bookingId = faker.string.uuid();
      req.params.id = bookingId;

      const bookingData = { id: bookingId, carId: faker.string.uuid() };
      bookingService.fetchById.mockResolvedValue(bookingData);

      await bookingController.fetchById(req, res, next);

      expect(res.message).toBe("Booking fetched successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data.booking).toHaveProperty("id");
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during fetching booking by ID", async () => {
      const bookingId = faker.string.uuid();
      req.params.id = bookingId;

      bookingService.fetchById.mockRejectedValue(
        new Error("Booking not found"),
      );

      await bookingController.fetchById(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("cancelBooking", () => {
    it("should cancel booking successfully", async () => {
      const bookingId = faker.string.uuid();
      req.params.id = bookingId;

      const bookingData = { id: bookingId, status: "Cancelled" };
      bookingService.cancelBooking.mockResolvedValue(bookingData);

      await bookingController.cancelBooking(req, res, next);

      expect(res.message).toBe("Booking cancelled successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data.booking).toHaveProperty("status", "Cancelled");
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during booking cancellation", async () => {
      const bookingId = faker.string.uuid();
      req.params.id = bookingId;

      bookingService.cancelBooking.mockRejectedValue(
        new Error("Failed to cancel booking"),
      );

      await bookingController.cancelBooking(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update booking successfully", async () => {
      const bookingId = faker.string.uuid();
      req.params.id = bookingId;
      req.body = { startDate: faker.date.past() };

      const updatedBooking = { id: bookingId, ...req.body };
      bookingService.update.mockResolvedValue(updatedBooking);

      await bookingController.update(req, res, next);

      expect(res.message).toBe("Booking updated successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data).toHaveProperty("id", bookingId);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during booking update", async () => {
      const bookingId = faker.string.uuid();
      req.params.id = bookingId;
      req.body = { startDate: faker.date.past() };

      bookingService.update.mockRejectedValue(
        new Error("Failed to update booking"),
      );

      await bookingController.update(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("submitFeedback", () => {
    it("should submit feedback successfully", async () => {
      const bookingId = faker.string.uuid();
      req.params.id = bookingId;
      req.body = { feedback: "Great experience!" };

      const feedbackResponse = { bookingId, feedback: req.body.feedback };
      bookingService.submitFeedback.mockResolvedValue(feedbackResponse);

      await bookingController.submitFeedback(req, res, next);

      expect(res.message).toBe("Feedback submitted successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data).toHaveProperty("feedback", "Great experience!");
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during feedback submission", async () => {
      const bookingId = faker.string.uuid();
      req.params.id = bookingId;
      req.body = { feedback: "Great experience!" };

      bookingService.submitFeedback.mockRejectedValue(
        new Error("Failed to submit feedback"),
      );

      await bookingController.submitFeedback(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("monthlySummary", () => {
    it("should fetch monthly summary successfully", async () => {
      req.query = { year: 2024, page: 1, pageSize: 10 };

      const summaryData = { totalBookings: 100, bookings: [] };
      bookingService.monthlySummary.mockResolvedValue(summaryData);

      await bookingController.monthlySummary(req, res, next);

      expect(res.message).toBe("Monthly summary retrieved successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data).toHaveProperty("totalBookings", 100);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during fetching monthly summary", async () => {
      req.query = { year: 2024, page: 1, pageSize: 10 };

      bookingService.monthlySummary.mockRejectedValue(
        new Error("Failed to fetch summary"),
      );

      await bookingController.monthlySummary(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });
});
