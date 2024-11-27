const bookingController = require("../../src/controllers/bookings.controller");
const bookingService = require("../../src/services/bookings.service");
const { StatusCodes } = require("http-status-codes");
const { faker } = require("@faker-js/faker");

jest.mock("../../src/services/bookings.service");
jest.mock("../../src/helpers/common.helper");

const { errorHandler } = require("../../src/helpers/common.helper");

// describe("Booking Controller - create", () => {
//   let req, res, next;

//   beforeEach(() => {
//     req = {
//       body: {
//         carId: faker.string.uuid(),
//         userId: faker.string.uuid(),
//         startDate: new Date(),
//         endDate: new Date(),
//       },
//       user: { id: faker.string.uuid(), email: faker.internet.email() },
//     };
//     res = { data: {}, message: "", statusCode: 0 };
//     next = jest.fn();
//   });

//   //   it("should create booking successfully", async () => {
//   //     const bookingData = {
//   //       id: faker.string.uuid(),
//   //       carId: req.body.carId,
//   //       userId: req.body.userId,
//   //       startDate: req.body.startDate,
//   //       endDate: req.body.endDate,
//   //     };

//   //     const transactionData = {
//   //       id: faker.string.uuid(),
//   //       amount: 100,
//   //       status: "Pending",
//   //     };

//   //     // Mocking the service
//   //     bookingService.create.mockResolvedValue({
//   //       booking: bookingData,
//   //       transaction: transactionData,
//   //     });

//   //     // Call the controller method
//   //     await bookingController.create(req, res, next);

//   //     // Assertions
//   //     expect(res.message).toBe("Booking created successfully");
//   //     expect(res.statusCode).toBe(StatusCodes.CREATED);
//   //     expect(res.data.booking).toHaveProperty("id");
//   //     expect(res.data.transaction).toHaveProperty("id");
//   //     expect(next).toHaveBeenCalled();
//   //   });

//   //   it("should handle error during booking creation", async () => {
//   //     // Mocking service rejection
//   //     bookingService.create.mockRejectedValue(
//   //       new Error("Failed to create booking"),
//   //     );

//   //     // Call the controller method
//   //     await bookingController.create(req, res, next);

//   //     // Assertions
//   //     expect(errorHandler).toHaveBeenCalled();
//   //     expect(next).not.toHaveBeenCalled();
//   //     expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
//   //     expect(res.message).toBe("Failed to create booking");
//   //   });

//   //   it("should handle case when the booking data is missing fields", async () => {
//   //     // Missing required fields
//   //     req.body = {};

//   //     // Call the controller method
//   //     await bookingController.create(req, res, next);

//   //     // Assertions
//   //     expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
//   //     expect(res.message).toBe("Failed to create booking");
//   //     expect(next).not.toHaveBeenCalled();
//   //   });
//   // });

//   describe("fetchById", () => {
//     let req, res, next;
//     it("should fetch booking by ID successfully", async () => {
//       const bookingId = faker.string.uuid();
//       req.params.id = bookingId;

//       const bookingData = { id: bookingId, carId: faker.string.uuid() };
//       bookingService.fetchById.mockResolvedValue(bookingData);

//       await bookingController.fetchById(req, res, next);

//       expect(res.message).toBe("Booking fetched successfully");
//       expect(res.statusCode).toBe(StatusCodes.OK);
//       expect(res.data.booking).toHaveProperty("id");
//       expect(next).toHaveBeenCalled();
//     });

//     it("should handle error during fetching booking by ID", async () => {
//       const bookingId = faker.string.uuid();
//       req.params.id = bookingId;

//       bookingService.fetchById.mockRejectedValue(
//         new Error("Booking not found"),
//       );

//       await bookingController.fetchById(req, res, next);

//       expect(errorHandler).toHaveBeenCalled();
//       expect(next).not.toHaveBeenCalled();
//     });
//   });

//   describe("updateByAction", () => {
//     let req, res, next;
//     it("should submit feedback successfully", async () => {
//       const bookingId = faker.string.uuid();
//       req.params.id = bookingId;
//       req.body = { action: "feedback", feedback: "Great service!" };
//       req.user.id = faker.string.uuid();

//       bookingService.submitFeedback.mockResolvedValue({
//         feedback: "Great service!",
//       });

//       await bookingController.updateByAction(req, res, next);

//       expect(res.message).toBe("Feedback submitted successfully");
//       expect(res.statusCode).toBe(StatusCodes.OK);
//       expect(res.data).toHaveProperty("feedback");
//       expect(next).toHaveBeenCalled();
//     });

//     it("should cancel booking successfully", async () => {
//       const bookingId = faker.string.uuid();
//       req.params.id = bookingId;
//       req.body = { action: "cancelBooking" };
//       req.user.id = faker.string.uuid();

//       const canceledBooking = { id: bookingId, status: "Canceled" };
//       bookingService.cancelBooking.mockResolvedValue(canceledBooking);

//       await bookingController.updateByAction(req, res, next);

//       expect(res.message).toBe("Booking cancelled successfully");
//       expect(res.statusCode).toBe(StatusCodes.OK);
//       expect(res.data.booking).toHaveProperty("status", "Canceled");
//       expect(next).toHaveBeenCalled();
//     });

//     it("should handle invalid action", async () => {
//       req.body = { action: "invalidAction" };

//       await bookingController.updateByAction(req, res, next);

//       expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
//       expect(next).toHaveBeenCalled();
//     });

//     it("should handle error during updateByAction", async () => {
//       req.body = { action: "cancelBooking" };

//       bookingService.cancelBooking.mockRejectedValue(
//         new Error("Error during canceling booking"),
//       );

//       await bookingController.updateByAction(req, res, next);

//       expect(errorHandler).toHaveBeenCalled();
//       expect(next).not.toHaveBeenCalled();
//     });
//   });

//   describe("monthlySummary", () => {
//     let req, res, next;
//     it("should fetch monthly summary successfully", async () => {
//       req.query = { year: 2024, page: 1, pageSize: 10 };

//       const summaryData = { totalBookings: 100, bookings: [] };
//       bookingService.monthlySummary.mockResolvedValue(summaryData);

//       await bookingController.monthlySummary(req, res, next);

//       expect(res.message).toBe("Monthly summary retrieved successfully");
//       expect(res.statusCode).toBe(StatusCodes.OK);
//       expect(res.data).toHaveProperty("totalBookings", 100);
//       expect(next).toHaveBeenCalled();
//     });

//     it("should handle error during fetching monthly summary", async () => {
//       req.query = { year: 2024, page: 1, pageSize: 10 };

//       bookingService.monthlySummary.mockRejectedValue(
//         new Error("Failed to fetch summary"),
//       );

//       await bookingController.monthlySummary(req, res, next);

//       expect(errorHandler).toHaveBeenCalled();
//       expect(next).not.toHaveBeenCalled();
//     });
//   });
//   describe("Booking Controller - create", () => {
//     let req, res, next;

//     beforeEach(() => {
//       req = {
//         body: {
//           carId: faker.string.uuid(),
//           userId: faker.string.uuid(),
//           startDate: new Date(),
//           endDate: new Date(),
//         },
//         user: { id: faker.string.uuid(), email: faker.internet.email() },
//         params: {},
//       };
//       res = { data: {}, message: "", statusCode: 0 };
//       next = jest.fn();

//       // Mocking the necessary service functions
//       bookingService.create.mockReset();
//       bookingService.create.mockResolvedValue({
//         booking: {
//           id: faker.string.uuid(),
//           carId: req.body.carId,
//           userId: req.body.userId,
//           startDate: req.body.startDate,
//           endDate: req.body.endDate,
//         },
//         transaction: {
//           id: faker.string.uuid(),
//           amount: 100,
//           status: "Pending",
//         },
//       });
//     });

//     it("should create booking successfully", async () => {
//       await bookingController.create(req, res, next);

//       // Assertions
//       expect(res.message).toBe("Booking created successfully");
//       expect(res.statusCode).toBe(StatusCodes.CREATED);
//       expect(res.data.booking).toHaveProperty("id");
//       expect(res.data.transaction).toHaveProperty("id");
//       expect(next).toHaveBeenCalled();
//     });

//     it("should handle error during booking creation", async () => {
//       bookingService.create.mockRejectedValue(
//         new Error("Failed to create booking"),
//       );

//       await bookingController.create(req, res, next);

//       // Assertions
//       expect(errorHandler).toHaveBeenCalled();
//       expect(next).not.toHaveBeenCalled();
//       expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
//       expect(res.message).toBe("Failed to create booking");
//     });

//     it("should handle case when the booking data is missing fields", async () => {
//       req.body = {}; // Simulate missing fields

//       await bookingController.create(req, res, next);

//       // Assertions
//       // expect(res.statusCode).toBe(StatusCodes.CREATED);
//       expect(res.message).toBe("Booking created successfully");
//       expect(next).not.toHaveBeenCalled("id");
//     });
//   });

//   describe("fetchById", () => {
//     let req, res, next;

//     beforeEach(() => {
//       req = { params: { id: faker.string.uuid() } };
//       res = { data: {}, message: "", statusCode: 0 };
//       next = jest.fn();
//       bookingService.fetchById.mockReset();
//     });

//     it("should fetch booking by ID successfully", async () => {
//       const bookingId = faker.string.uuid();
//       req.params.id = bookingId;

//       const bookingData = { id: bookingId, carId: faker.string.uuid() };
//       bookingService.fetchById.mockResolvedValue(bookingData);

//       await bookingController.fetchById(req, res, next);

//       expect(res.message).toBe("Booking fetched successfully");
//       expect(res.statusCode).toBe(StatusCodes.OK);
//       expect(res.data.booking).toHaveProperty("id");
//       expect(next).toHaveBeenCalled();
//     });

//     it("should handle error during fetching booking by ID", async () => {
//       const bookingId = faker.string.uuid();
//       req.params.id = bookingId;

//       bookingService.fetchById.mockRejectedValue(
//         new Error("Booking not found"),
//       );

//       await bookingController.fetchById(req, res, next);

//       expect(errorHandler).toHaveBeenCalled();
//       expect(next).not.toHaveBeenCalled();
//       expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
//       expect(res.message).toBe("Booking not found");
//     });
//   });
// });

describe("Booking Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: faker.string.uuid(), email: faker.internet.email() },
    };
    res = { message: "", statusCode: 0, data: {} };
    next = jest.fn();
  });

  describe("create", () => {
    it("should create a booking successfully", async () => {
      const booking = {
        id: faker.string.uuid(),
        car: "Car 1",
        status: "Pending",
      };
      const transaction = { id: faker.string.uuid(), amount: 100 };

      bookingService.create.mockResolvedValue({ booking, transaction });

      await bookingController.create(req, res, next);

      expect(res.message).toBe("Booking created successfully");
      expect(res.statusCode).toBe(StatusCodes.CREATED);
      expect(res.data.booking).toEqual(booking);
      expect(res.data.transaction).toEqual(transaction);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during booking creation", async () => {
      bookingService.create.mockRejectedValue(
        new Error("Failed to create booking"),
      );

      await bookingController.create(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("fetchById", () => {
    it("should fetch a booking by ID successfully", async () => {
      const bookingId = faker.string.uuid();
      req.params.id = bookingId;
      const booking = { id: bookingId, car: "Car 1", status: "Completed" };

      bookingService.fetchById.mockResolvedValue(booking);

      await bookingController.fetchById(req, res, next);

      expect(res.message).toBe("Booking fetched successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data.booking).toEqual(booking);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during booking fetch by ID", async () => {
      req.params.id = faker.string.uuid();
      bookingService.fetchById.mockRejectedValue(
        new Error("Booking not found"),
      );

      await bookingController.fetchById(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update a booking successfully", async () => {
      const bookingId = faker.string.uuid();
      req.params.id = bookingId;
      const updatedData = { status: "Completed" };
      req.body = updatedData;

      const updatedBooking = { ...updatedData, id: bookingId };

      bookingService.update.mockResolvedValue(updatedBooking);

      await bookingController.update(req, res, next);

      expect(res.message).toBe("Booking updated successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data).toEqual(updatedBooking);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during booking update", async () => {
      req.params.id = faker.string.uuid();
      req.body = { status: "Completed" };

      bookingService.update.mockRejectedValue(
        new Error("Failed to update booking"),
      );

      await bookingController.update(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("updateByAction", () => {
    it("should submit feedback successfully", async () => {
      const bookingId = faker.string.uuid();
      req.params.id = bookingId;
      req.body = { action: "feedback", feedback: "Good" };

      const result = { message: "Feedback submitted successfully" };

      bookingService.submitFeedback.mockResolvedValue(result);

      await bookingController.updateByAction(req, res, next);

      expect(res.message).toBe("Feedback submitted successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data).toEqual(result);
      expect(next).toHaveBeenCalled();
    });

    it("should cancel booking successfully", async () => {
      const bookingId = faker.string.uuid();
      req.params.id = bookingId;
      req.body = { action: "cancelBooking" };

      const cancelledBooking = { id: bookingId, status: "Cancelled" };

      bookingService.cancelBooking.mockResolvedValue(cancelledBooking);

      await bookingController.updateByAction(req, res, next);

      expect(res.message).toBe("Booking cancelled successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data.booking).toEqual(cancelledBooking);
      expect(next).toHaveBeenCalled();
    });

    it("should handle invalid action", async () => {
      req.body = { action: "invalidAction" };

      await bookingController.updateByAction(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle error during updateByAction", async () => {
      req.body = { action: "cancelBooking" };

      bookingService.cancelBooking.mockRejectedValue(
        new Error("Failed to cancel booking"),
      );

      await bookingController.updateByAction(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("monthlySummary", () => {
    it("should fetch monthly summary successfully", async () => {
      req.query.year = 2024;
      req.query.page = 1;
      req.query.pageSize = 10;

      const summary = { totalBookings: 100, completed: 80, cancelled: 20 };

      bookingService.monthlySummary.mockResolvedValue(summary);

      await bookingController.monthlySummary(req, res, next);

      expect(res.message).toBe("Monthly summary retrieved successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data).toEqual(summary);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during monthly summary fetch", async () => {
      bookingService.monthlySummary.mockRejectedValue(
        new Error("Failed to retrieve monthly summary"),
      );

      await bookingController.monthlySummary(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("downloadMonthlyBookings", () => {
    it("should download monthly bookings CSV successfully", async () => {
      req.query.month = 12;
      req.query.year = 2024;

      const csvData = "Booking ID, Car, Amount\n1, Car 1, 100";

      res.header = jest.fn();
      res.attachment = jest.fn();
      res.send = jest.fn();

      bookingService.downloadMonthlyBookings.mockResolvedValue(csvData);

      const next = jest.fn();

      // Call the controller function
      await bookingController.downloadMonthlyBookings(req, res, next);

      expect(res.header).toHaveBeenCalledWith("Content-Type", "text/csv");
      expect(res.attachment).toHaveBeenCalledWith("bookings_12_2024.csv");
      expect(res.send).toHaveBeenCalledWith(csvData);

      expect(next).toHaveBeenCalled();
    });

    it("should handle error during CSV download", async () => {
      bookingService.downloadMonthlyBookings.mockRejectedValue(
        new Error("Failed to download CSV"),
      );

      const next = jest.fn();

      await bookingController.downloadMonthlyBookings(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });
});
