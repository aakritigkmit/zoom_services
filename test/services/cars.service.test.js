const {
  create,
  fetchBookings,
  findNearestCars,
  fetchById,
  update,
  updateStatus,
  remove,
} = require("../../src/services/cars.service");
const { Car, Booking, User, sequelize } = require("../../src/models");
const { throwCustomError } = require("../../src/helpers/common.helper");
const { client } = require("../../src/config/redis");
const { StatusCodes } = require("http-status-codes");

jest.mock("../../src/models", () => ({
  Car: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
  Booking: {
    findAll: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn().mockReturnValue({
      commit: jest.fn(),
      rollback: jest.fn(),
    }),
  },
}));

jest.mock("../../src/helpers/common.helper", () => ({
  throwCustomError: jest.fn(),
}));

jest.mock("../../src/config/redis", () => ({
  client: {
    sendCommand: jest.fn(),
  },
}));

describe("Cars Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new car and add its geolocation to Redis", async () => {
      const carData = {
        latitude: "10.000",
        longitude: "20.000",
        price_per_km: "5.5",
        price_per_hr: "10.0",
        year: "2020",
      };
      const ownerId = 1;
      const imagePath = "path/to/image.jpg";

      const mockCar = {
        id: 1,
        ...carData,
        owner_id: ownerId,
        image: imagePath,
      };
      Car.create.mockResolvedValue(mockCar);
      client.sendCommand.mockResolvedValue("OK");

      const result = await create(carData, ownerId, imagePath);

      expect(result).toEqual(mockCar);
      expect(Car.create).toHaveBeenCalledWith({
        ...carData,
        owner_id: ownerId,
        _id: ownerId,
        image: imagePath,
        latitude: 10,
        longitude: 20,
        price_per_km: 5.5,
        price_per_hr: 10.0,
        year: 2020,
      });
      expect(client.sendCommand).toHaveBeenCalledWith([
        "GEOADD",
        "cars:locations",
        "20",
        "10",
        "1",
      ]);
    });
  });

  describe("fetchBookings", () => {
    it("should fetch bookings for a car owned by the user", async () => {
      const ownerId = 1;
      const carId = 1;

      const mockCar = { id: carId, owner_id: ownerId };
      const mockBookings = [
        {
          id: 1,
          start_date: "2023-11-01",
          end_date: "2023-11-05",
          status: "Confirmed",
          fare: 100,
          user: { id: 2, name: "John Doe", email: "john@example.com" },
        },
      ];

      Car.findOne.mockResolvedValue(mockCar);
      Booking.findAll.mockResolvedValue(mockBookings);

      const result = await fetchBookings(ownerId, carId);

      expect(result).toEqual(mockBookings);
      expect(Car.findOne).toHaveBeenCalledWith({
        where: { id: carId, owner_id: ownerId },
        attributes: ["id", "model", "type", "status"],
      });
      expect(Booking.findAll).toHaveBeenCalledWith({
        where: { car_id: carId },
        include: [
          { model: User, as: "user", attributes: ["id", "name", "email"] },
        ],
        attributes: ["id", "start_date", "end_date", "status", "fare"],
      });
    });

    it("should throw an error if the car is not owned by the user", async () => {
      const ownerId = 1;
      const carId = 2;

      Car.findOne.mockResolvedValue(null);

      await expect(fetchBookings(ownerId, carId)).rejects.toThrow(
        "This car does not belong to you",
      );
      expect(throwCustomError).toHaveBeenCalledWith(
        "This car does not belong to you",
        403,
      );
    });
  });

  describe("findNearestCars", () => {
    it("should fetch nearby cars from Redis and database", async () => {
      const userLatitude = 10;
      const userLongitude = 20;
      const radius = 10;

      const mockCarsFromRedis = [["1", "5.0"]];
      const mockAvailableCars = [
        { id: 1, status: "available", model: "Model X" },
      ];

      client.sendCommand.mockResolvedValue(mockCarsFromRedis);
      Car.findAll.mockResolvedValue(mockAvailableCars);

      const result = await findNearestCars(userLatitude, userLongitude, radius);

      expect(result).toEqual([{ id: "1", model: "Model X", distance: 5.0 }]);
      expect(client.sendCommand).toHaveBeenCalledWith([
        "GEORADIUS",
        "cars:locations",
        "20",
        "10",
        "10",
        "km",
        "WITHDIST",
        "ASC",
      ]);
    });

    it("should return an empty array if no cars are nearby", async () => {
      client.sendCommand.mockResolvedValue([]);

      const result = await findNearestCars(10, 20);

      expect(result).toEqual([]);
    });
  });

  describe("fetchById", () => {
    it("should fetch a car by its ID", async () => {
      const carId = 1;
      const mockCar = { id: carId, model: "Model X" };

      Car.findByPk.mockResolvedValue(mockCar);

      const result = await fetchById(carId);

      expect(result).toEqual(mockCar);
      expect(Car.findByPk).toHaveBeenCalledWith(carId);
    });
  });

  describe("update", () => {
    it("should update car details if the owner is authorized", async () => {
      const carId = 1;
      const updatedData = { model: "Updated Model" };
      const ownerId = 1;

      const mockCar = { id: carId, owner_id: ownerId, update: jest.fn() };
      Car.findByPk.mockResolvedValue(mockCar);

      const result = await update(carId, updatedData, ownerId);

      expect(result).toEqual(mockCar);
      expect(mockCar.update).toHaveBeenCalledWith(
        updatedData,
        expect.any(Object),
      );
    });

    it("should throw an error if the owner is not authorized", async () => {
      const carId = 1;
      const updatedData = { model: "Updated Model" };
      const ownerId = 2;

      const mockCar = { id: carId, owner_id: 1 };
      Car.findByPk.mockResolvedValue(mockCar);

      await expect(update(carId, updatedData, ownerId)).rejects.toThrow(
        "Forbidden",
      );
      expect(throwCustomError).toHaveBeenCalledWith(
        "Forbidden",
        StatusCodes.FORBIDDEN,
      );
    });
  });

  describe("remove", () => {
    it("should delete a car by its ID", async () => {
      const carId = 1;
      const mockCar = { id: carId, destroy: jest.fn() };

      Car.findByPk.mockResolvedValue(mockCar);

      const result = await remove(carId);

      expect(result).toEqual({ message: "Car deleted successfully" });
      expect(mockCar.destroy).toHaveBeenCalled();
    });

    it("should return a not found error if the car does not exist", async () => {
      const carId = 1;

      Car.findByPk.mockResolvedValue(null);

      const result = await remove(carId);

      expect(result).toEqual({
        statusCode: StatusCodes.NOT_FOUND,
        message: "Car not found",
      });
    });
  });
});
