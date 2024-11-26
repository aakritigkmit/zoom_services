const carController = require("../../src/controllers/cars.controller");
const carService = require("../../src/services/cars.service");
const { StatusCodes } = require("http-status-codes");
const { faker } = require("@faker-js/faker");

jest.mock("../../src/services/cars.service");
jest.mock("../../src/helpers/common.helper");

const { errorHandler } = require("../../src/helpers/common.helper");

describe("Car Controller", () => {
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
    it("should create car successfully", async () => {
      const carData = {
        model: faker.vehicle.model(),
        year: 2022,
        fuel_type: "Petrol",
        // city: faker.location.city(),
        price_per_km: 10,
        price_per_hr: 100,
      };
      req.body = carData;
      req.user.email = faker.internet.email();
      req.file = { path: faker.system.filePath() };

      carService.create.mockResolvedValue({
        ...carData,
        id: faker.string.uuid(),
      });

      await carController.create(req, res, next);

      expect(res.message).toBe("Car created successfully");
      expect(res.statusCode).toBe(StatusCodes.CREATED);
      expect(res.data.car).toHaveProperty("id");
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during car creation", async () => {
      req.body = { model: faker.vehicle.model() };
      req.user.id = faker.string.uuid();

      carService.create.mockRejectedValue(new Error("Failed to create car"));

      await carController.create(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("fetchBookings", () => {
    it("should fetch car bookings successfully", async () => {
      const carId = faker.string.uuid();
      req.params.id = carId;
      req.user.id = faker.string.uuid();

      const bookings = [{ carId, userId: req.user.id }];
      carService.fetchBookings.mockResolvedValue(bookings);

      await carController.fetchBookings(req, res, next);

      expect(res.message).toBe("Bookings retrieved successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data.bookings).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during fetching bookings", async () => {
      req.params.id = faker.string.uuid();
      req.user.id = faker.string.uuid();

      carService.fetchBookings.mockRejectedValue(
        new Error("Error fetching bookings"),
      );

      await carController.fetchBookings(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("findNearestCars", () => {
    it("should fetch nearest cars successfully", async () => {
      req.query = { latitude: 12.9716, longitude: 77.5946, radius: 10 };

      const nearbyCars = [
        { id: faker.string.uuid(), model: faker.vehicle.model() },
      ];
      carService.findNearestCars.mockResolvedValue(nearbyCars);

      await carController.findNearestCars(req, res, next);

      expect(res.message).toBe("Nearby cars fetched successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data.cars).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during fetching nearest cars", async () => {
      req.query = { latitude: 12.9716, longitude: 77.5946 };

      carService.findNearestCars.mockRejectedValue(
        new Error("Error finding nearest cars"),
      );

      await carController.findNearestCars(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("should return error when latitude or longitude is missing", async () => {
      req.query = { radius: 10 };

      await carController.findNearestCars(req, res, next);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("fetchById", () => {
    it("should fetch car by ID successfully", async () => {
      const carId = faker.string.uuid();
      req.params.id = carId;

      const carData = { id: carId, model: faker.vehicle.model() };
      carService.fetchById.mockResolvedValue(carData);

      await carController.fetchById(req, res, next);

      expect(res.message).toBe("Car fetched successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data.car).toHaveProperty("id");
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during car fetch by ID", async () => {
      const carId = faker.string.uuid();
      req.params.id = carId;

      carService.fetchById.mockRejectedValue(new Error("Car not found"));

      await carController.fetchById(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update car successfully", async () => {
      const carId = faker.string.uuid();
      req.params.id = carId;
      req.body = { model: faker.vehicle.model() };

      const updatedCar = { id: carId, ...req.body };
      carService.update.mockResolvedValue(updatedCar);

      await carController.update(req, res, next);

      expect(res.message).toBe("Car updated successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data.car).toHaveProperty("id");
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during car update", async () => {
      const carId = faker.string.uuid();
      req.params.id = carId;
      req.body = { model: faker.vehicle.model() };

      carService.update.mockRejectedValue(new Error("Failed to update car"));

      await carController.update(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("updateStatus", () => {
    it("should update car status successfully", async () => {
      const carId = faker.string.uuid();
      req.params.id = carId;
      req.body = { status: "Available" };

      const updatedCar = { id: carId, status: "Available" };
      carService.updateStatus.mockResolvedValue(updatedCar);

      await carController.updateStatus(req, res, next);

      expect(res.message).toBe("Car status updated successfully");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.data.car).toHaveProperty("status", "Available");
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during car status update", async () => {
      const carId = faker.string.uuid();
      req.params.id = carId;
      req.body = { status: "Unavailable" };

      carService.updateStatus.mockRejectedValue(
        new Error("Failed to update car status"),
      );

      await carController.updateStatus(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should delete car successfully", async () => {
      const carId = faker.string.uuid();
      req.params.id = carId;

      const deletedCar = { id: carId };
      carService.remove.mockResolvedValue(deletedCar);

      await carController.remove(req, res, next);

      expect(res.message).toBe("Car deleted successfully");
      expect(res.statusCode).toBe(StatusCodes.NO_CONTENT);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error during car deletion", async () => {
      const carId = faker.string.uuid();
      req.params.id = carId;

      carService.remove.mockRejectedValue(new Error("Failed to delete car"));

      await carController.remove(req, res, next);

      expect(errorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });
});
