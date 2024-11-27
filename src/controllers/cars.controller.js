const carService = require("../services/cars.service");
const { StatusCodes } = require("http-status-codes");
const { throwCustomError, errorHandler } = require("../helpers/common.helper");

const create = async (req, res, next) => {
  try {
    const carData = req.body;
    const imagePath = req.file?.path;
    const ownerId = req.user.id;

    const car = await carService.create(carData, ownerId, imagePath);

    res.data = { car };
    res.message = "Car created successfully";
    res.statusCode = StatusCodes.CREATED;

    next();
  } catch (error) {
    console.log(error);
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};

const fetchBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const carId = req.params.id;

    const bookings = await carService.fetchBookings(userId, carId);

    res.data = { bookings: bookings.length ? bookings : null };
    res.message = bookings.length
      ? "Bookings retrieved successfully"
      : "No bookings found for this car";
    res.statusCode = bookings.length ? StatusCodes.OK : StatusCodes.NOT_FOUND;

    next();
  } catch (error) {
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
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

    res.data = { cars: nearbyCars };
    res.message = "Nearby cars fetched successfully";
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    console.log(error);
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};

const fetchById = async (req, res, next) => {
  try {
    const carId = req.params.id;

    const car = await carService.fetchById(carId);

    if (!car) {
      throwCustomError("Car not found", StatusCodes.NOT_FOUND);
    }

    res.data = { car };
    res.message = "Car fetched successfully";
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};

const update = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const ownerId = req.user.id;
    const updatedData = req.body;

    const payload = { carId, ownerId, updatedData };

    const updatedCar = await carService.update(payload);

    if (!updatedCar) {
      throwCustomError("Car not found", StatusCodes.NOT_FOUND);
    }

    res.data = { car: updatedCar };
    res.message = "Car updated successfully";
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;

    const updatedCar = await carService.updateStatus(carId, status, userId);

    res.data = { car: updatedCar };
    res.message = "Car status updated successfully";
    res.statusCode = StatusCodes.OK;

    next();
  } catch (error) {
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};

const remove = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const deletedCar = await carService.remove(carId);

    if (!deletedCar) {
      throwCustomError("Car not found", StatusCodes.NOT_FOUND);
    }

    res.message = "Car deleted successfully";
    res.statusCode = StatusCodes.NO_CONTENT;

    next();
  } catch (error) {
    errorHandler(res, error, error.message, StatusCodes.BAD_REQUEST);
  }
};

module.exports = {
  create,
  fetchBookings,
  findNearestCars,
  fetchById,
  update,
  updateStatus,
  remove,
};
