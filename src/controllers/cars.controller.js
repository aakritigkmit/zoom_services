const carService = require("../services/cars.service");
const { StatusCodes } = require("http-status-codes");
const { throwCustomError, errorHandler } = require("../helpers/common.helper");

const createCar = async (req, res, next) => {
  try {
    const carData = req.body;
    const imagePath = req.file?.path;
    const ownerId = req.user.id;

    const car = await carService.createCar(carData, ownerId, imagePath);

    res.data = {
      car,
      message: "Car created successfully",
    };
    console.log("create car", res.data);
    res.statusCode = StatusCodes.CREATED;
    next();
  } catch (error) {
    errorHandler(res, error, "Failed to create car");
  }
};

const fetchCarBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const carId = req.params.id;

    const bookings = await carService.fetchCarBookings(userId, carId);
    console.log("bookings", bookings);

    res.data = { bookings: bookings.length ? bookings : null };
    res.message = bookings.length
      ? "Bookings retrieved successfully"
      : "No bookings found for this car";

    res.statusCode = StatusCodes.CREATED;

    console.log("fetchCARBookings Controllers", res.data);
    res.statusCode = bookings.length ? StatusCodes.OK : StatusCodes.NOT_FOUND;
    next();
  } catch (error) {
    errorHandler(res, error, "Failed to fetch bookings of the car");
  }
};

const findNearestCars = async (req, res, next) => {
  const { latitude, longitude, radius } = req.query;

  if (!latitude || !longitude) {
    res.data = {
      message: "Latitude and longitude are required",
    };
    res.statusCode = StatusCodes.BAD_REQUEST;
    return next();
  }

  try {
    const nearbyCars = await carService.findNearestCars(
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseFloat(radius) : 10,
    );
    console.log(nearbyCars);

    res.data = { car: nearbyCars };
    res.message = "Nearby cars fetched successfully";
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    console.log(error);
    errorHandler(res, error, "Failed to find nearest cars");
  }
};

const fetchByCarId = async (req, res, next) => {
  try {
    const carId = req.params.id;

    const car = await carService.fetchByCarId(carId);

    if (!car) {
      throwCustomError("Car not found", StatusCodes.NOT_FOUND);
    }

    res.data = { car };
    res.message = "Car fetched successfully";
    res.statusCode = StatusCodes.OK;

    console.log("car fetchByCarId", res.data);
    res.statusCode = StatusCodes.OK;
    next();
  } catch (error) {
    errorHandler(res, error, "Failed to fetch car");
  }
};

const update = async (req, res, next) => {
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

    res.data = { car: updatedCar };
    res.message = "Car updated successfully";
    res.statusCode = StatusCodes.OK;
    next();
  } catch (error) {
    errorHandler(res, error, "Failed to update car details");
  }
};

const updateCarStatus = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;

    const updatedCar = await carService.updateCarStatus(carId, status, userId);

    res.data = { car: updatedCar };
    res.message = "Car status updated successfully";
    res.statusCode = StatusCodes.OK;
    next();
  } catch (error) {
    errorHandler(res, error, "Failed to update car status");
  }
};

const removeCar = async (req, res, next) => {
  try {
    const carId = req.params.id;

    const deletedCar = await carService.removeCar(carId);

    if (!deletedCar) {
      throwCustomError("Car not found", StatusCodes.NOT_FOUND);
    }

    res.message = "Car deleted successfully";
    res.statusCode = StatusCodes.NO_CONTENT;
    next();
  } catch (error) {
    errorHandler(res, error, "Failed to delete car");
  }
};

module.exports = {
  createCar,
  fetchCarBookings,
  findNearestCars,
  fetchByCarId,
  update,
  updateCarStatus,
  removeCar,
};
