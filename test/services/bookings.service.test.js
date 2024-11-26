const { Booking, Car, sequelize } = require("../../src/models");
const bookingService = require("../../src/services/bookings.service");
const calculateBookingFare = require("../../src/helpers//calculateFares.helper");

const { sendEmail } = require("../../src/utils/email");
const moment = require("moment");

jest.mock("../../src/models", () => ({
  Booking: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
  },
  Car: {
    findByPk: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn(),
  },
}));

jest.mock("../../src/helpers/calculateFares.helper");
jest.mock("../../src/helpers/common.helper");
jest.mock("../../src/utils/email");
jest.mock("moment");

describe("Booking Service", () => {
  let transactionMock;

  beforeEach(() => {
    transactionMock = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };
    sequelize.transaction.mockResolvedValue(transactionMock);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new booking", async () => {
      const mockCar = { id: 1, model: "SUV", type: "Luxury" };
      const mockData = {
        car_id: 1,
        estimated_distance: 100,
        start_date: "2024-11-30",
        end_date: "2024-12-05",
      };
      const mockUserId = 123;
      const mockFare = 5000;

      Car.findByPk.mockResolvedValue(mockCar);
      Booking.findOne.mockResolvedValue(null);
      calculateBookingFare.mockReturnValue(mockFare);
      Booking.create.mockResolvedValue({ id: 1, ...mockData, fare: mockFare });

      const result = await bookingService.create(
        mockData,
        "test@example.com",
        mockUserId,
      );

      expect(Car.findByPk).toHaveBeenCalledWith(mockData.car_id);
      expect(Booking.findOne).toHaveBeenCalledWith({
        where: { user_id: mockUserId, car_id: mockData.car_id },
      });
      expect(calculateBookingFare).toHaveBeenCalledWith(
        mockCar,
        mockData.estimated_distance,
        mockData.start_date,
        mockData.end_date,
      );
      expect(Booking.create).toHaveBeenCalledWith({
        ...mockData,
        fare: mockFare,
        user_id: mockUserId,
      });
      expect(transactionMock.commit).toHaveBeenCalled();
      expect(result).toEqual({ id: 1, ...mockData, fare: mockFare });
    });

    it("should throw an error if the car is not found", async () => {
      Car.findByPk.mockResolvedValue(null);

      await expect(
        bookingService.create({ car_id: 1 }, "test@example.com", 123),
      ).rejects.toThrow("Car not found");

      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it("should throw an error if there is an active booking", async () => {
      Booking.findOne.mockResolvedValue({ id: 1 });

      await expect(
        bookingService.create({ car_id: 1 }, "test@example.com", 123),
      ).rejects.toThrow("You already have an active booking for this car.");

      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });

  describe("fetchById", () => {
    it("should return a booking by ID", async () => {
      const mockBooking = { id: 1, car_id: 1, user_id: 123 };
      Booking.findByPk.mockResolvedValue(mockBooking);

      const result = await bookingService.fetchById(1);

      expect(Booking.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBooking);
    });

    it("should throw an error if booking is not found", async () => {
      Booking.findByPk.mockResolvedValue(null);

      await expect(bookingService.fetchById(999)).rejects.toThrow(
        "Booking not found",
      );
    });
  });

  describe("update", () => {
    it("should update a booking", async () => {
      const mockBooking = { id: 1, car_id: 1, user_id: 123, update: jest.fn() };
      Booking.findByPk.mockResolvedValue(mockBooking);

      const updatedData = { car_id: 2, estimated_distance: 200 };
      Car.findByPk.mockResolvedValue({ id: 2 });

      const result = await bookingService.update(1, updatedData, 123);

      expect(Booking.findByPk).toHaveBeenCalledWith(1, {
        transaction: transactionMock,
      });
      expect(Car.findByPk).toHaveBeenCalledWith(updatedData.car_id, {
        transaction: transactionMock,
      });
      expect(mockBooking.update).toHaveBeenCalledWith(updatedData, {
        transaction: transactionMock,
      });
      expect(transactionMock.commit).toHaveBeenCalled();
      expect(result).toEqual(mockBooking);
    });

    it("should throw an error if booking is not found", async () => {
      Booking.findByPk.mockResolvedValue(null);

      await expect(
        bookingService.update(999, { car_id: 2 }, 123),
      ).rejects.toThrow("Booking not found");

      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });

  describe("cancelBooking", () => {
    it("should cancel a booking", async () => {
      const mockBooking = {
        id: 1,
        user_id: 123,
        status: "Confirmed",
        save: jest.fn(),
        user: { name: "John Doe", email: "john@example.com" },
      };
      Booking.findByPk.mockResolvedValue(mockBooking);

      const result = await bookingService.cancelBooking(1, 123);

      expect(mockBooking.status).toBe("Cancelled");
      expect(mockBooking.save).toHaveBeenCalled();
      expect(result).toEqual(mockBooking);
    });

    it("should throw an error if the booking is already cancelled", async () => {
      const mockBooking = { id: 1, user_id: 123, status: "Cancelled" };
      Booking.findByPk.mockResolvedValue(mockBooking);

      await expect(bookingService.cancelBooking(1, 123)).rejects.toThrow(
        "This booking has already been cancelled.",
      );
    });
  });

  describe("submitFeedback", () => {
    it("should submit feedback for a booking", async () => {
      const mockBooking = {
        id: 1,
        user_id: 123,
        feedback: null,
        save: jest.fn(),
      };
      Booking.findOne.mockResolvedValue(mockBooking);

      const feedback = "Great service!";
      const result = await bookingService.submitFeedback({
        bookingId: 1,
        userId: 123,
        feedback,
      });

      expect(mockBooking.feedback).toBe(feedback);
      expect(mockBooking.save).toHaveBeenCalled();
      expect(result).toEqual(mockBooking);
    });

    it("should throw an error if feedback already exists", async () => {
      const mockBooking = {
        id: 1,
        user_id: 123,
        feedback: "Already given",
        save: jest.fn(), // Mock the save method
      };

      Booking.findOne.mockResolvedValue(mockBooking);

      await expect(
        bookingService.submitFeedback({
          bookingId: 1,
          userId: 123,
          feedback: "Great!",
        }),
      ).rejects.toThrow("Feedback already submitted for this booking");

      expect(mockBooking.save).not.toHaveBeenCalled();
    });
  });
});

describe("downloadMonthlyBookings", () => {
  it("should return CSV data for bookings", async () => {
    const mockBookings = [
      {
        id: 1,
        user_id: 1,
        car_id: 2,
        start_date: "2023-11-01",
        end_date: "2023-11-10",
        status: "Confirmed",
        fare: 500,
        feedback: null,
        estimated_distance: 100,
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          user_id: 1,
          car_id: 2,
          start_date: "2023-11-01",
          end_date: "2023-11-10",
          status: "Confirmed",
          fare: 500,
          feedback: null,
          estimated_distance: 100,
        }),
      },
    ];
    Booking.findAll.mockResolvedValue(mockBookings);

    const csvData = await bookingService.downloadMonthlyBookings({
      month: 11,
      year: 2023,
    });

    expect(csvData).toContain("id,user_id,car_id,start_date,end_date,status");
    expect(csvData).toContain("1,1,2,2023-11-01,2023-11-10,Confirmed");
  });

  it("should throw error if no bookings found", async () => {
    Booking.findAll.mockResolvedValue([]);

    await expect(
      bookingService.downloadMonthlyBookings({ month: 11, year: 2023 }),
    ).rejects.toThrow("No bookings found for the specified criteria");
  });
});

describe("bookingScheduler", () => {
  it("should send reminder emails for bookings starting in 24 hours", async () => {
    const mockBooking = {
      id: 1,
      user: { email: "test@example.com" },
      start_date: "2023-11-25T12:00:00Z",
      end_date: "2023-11-26T12:00:00Z",
      status: "Confirmed",
      save: jest.fn(),
    };

    const momentMock = {
      diff: jest.fn().mockReturnValue(24), // 24 hours difference
      isBefore: jest.fn().mockReturnValue(false), // Not before current time
    };

    moment.mockImplementation(() => momentMock); // Mock moment to return the mocked instance

    Booking.findAll.mockResolvedValue([mockBooking]);
    await bookingService.bookingScheduler(); // Assuming the service is properly imported

    expect(sendEmail).toHaveBeenCalledWith(
      "test@example.com",
      "Booking Reminder",
      expect.stringContaining(
        "Your booking with ID 1 is about to start in 24 hours.",
      ),
    );
  });

  it("should send late notification emails for overdue bookings", async () => {
    const mockBooking = {
      id: 2,
      user: { email: "test@example.com" },
      start_date: "2023-11-20T12:00:00Z",
      end_date: "2023-11-21T12:00:00Z",
      status: "Confirmed",
      save: jest.fn(),
    };

    const momentMock = {
      diff: jest.fn().mockReturnValue(-48), // 48 hours in the past
      isBefore: jest.fn().mockReturnValue(true), // Before current time
    };

    moment.mockImplementation(() => momentMock); // Mock moment to return the mocked instance

    Booking.findAll.mockResolvedValue([mockBooking]);
    await bookingService.bookingScheduler(); // Assuming the service is properly imported

    expect(sendEmail).toHaveBeenCalledWith(
      "test@example.com",
      "Late Notification",
      expect.stringContaining("Your booking with ID 2 is overdue."),
    );
    expect(mockBooking.status).toBe("Late");
    expect(mockBooking.save).toHaveBeenCalled();
  });
});