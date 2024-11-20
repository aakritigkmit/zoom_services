const carService = require("../services/cars.service");
const { StatusCodes } = require("http-status-codes");
const {
  throwCustomError,
  errorHandler,
  responseHandler,
} = require("../helpers/common.helper");

const createCar = async (req, res) => {
  try {
    const carData = req.body;
    const imagePath = req.file?.path;
    const ownerId = req.user.id;
    const car = await carService.createCar(carData, ownerId, imagePath);
    responseHandler(res, car, "Car created successfully", StatusCodes.CREATED);
  } catch (error) {
    console.log("error", error);
    errorHandler(res, error, "Failed to create car");
  }
};

const fetchCarBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const carId = req.params.id;

    console.log("user", userId);
    console.log("car", carId);

    const bookings = await carService.fetchCarBookings(userId, carId);

    if (!bookings.length) {
      return responseHandler(
        res,
        null,
        "No bookings found for this car",
        StatusCodes.NOT_FOUND,
      );
    }

    return responseHandler(
      res,
      bookings,
      "Bookings retrieved successfully",
      StatusCodes.OK,
    );
  } catch (error) {
    errorHandler(res, error, "Failed to fetch Bookings of the Car");
  }
};

const findNearestCars = async (req, res) => {
  const { latitude, longitude, radius } = req.query;

  if (!latitude || !longitude) {
    return responseHandler(
      res,
      null,
      "Latitude and longitude are required",
      StatusCodes.BAD_REQUEST,
    );
  }

  try {
    const nearbyCars = await carService.findNearestCars(
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseFloat(radius) : 10,
    );
    responseHandler(
      res,
      nearbyCars,
      "Nearby cars fetched successfully",
      StatusCodes.OK,
    );
  } catch (error) {
    console.error("Error finding nearest cars:", error.message);
    errorHandler(res, error, "Failed to find nearest cars");
  }
};

const fetchByCarId = async (req, res) => {
  const carId = req.params.id;
  try {
    const car = await carService.fetchByCarId(carId);
    if (!car) {
      throwCustomError("Car not found", StatusCodes.NOT_FOUND);
    }
    responseHandler(res, car, "Car fetched successfully");
  } catch (error) {
    errorHandler(res, error, "Failed to fetch car");
  }
};

const update = async (req, res) => {
  try {
    const carId = req.params.id;
    const userId = req.user.id;
    const updatedData = req.body;

    const updatedCar = await carService.updateCarDetails(
      carId,
      updatedData,
      userId,
    );

    if (!updatedCar) {
      throwCustomError("Car not found", StatusCodes.NOT_FOUND);
    }
    responseHandler(res, updatedCar, "Car updated successfully");
  } catch (error) {
    errorHandler(res, error, "Failed to update car details");
  }
};

const updateCarStatus = async (req, res) => {
  try {
    const carId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;

    const updatedCar = await carService.updateCarStatus(carId, status, userId);

    responseHandler(res, updatedCar, "Car status updated successfully");
  } catch (error) {
    errorHandler(res, error, "Failed to update car status");
  }
};

const removeCar = async (req, res) => {
  const carId = req.params.id;
  try {
    const deletedCar = await carService.removeCar(carId);
    if (!deletedCar) {
      throwCustomError("Car not found", StatusCodes.NOT_FOUND);
    }
    responseHandler(res, null, "Car deleted successfully");
  } catch (error) {
    errorHandler(res, error, "Failed to delete car");
  }
};

module.exports = {
  fetchByCarId,
  findNearestCars,
  createCar,
  update,
  updateCarStatus,
  removeCar,
  fetchCarBookings,
};
