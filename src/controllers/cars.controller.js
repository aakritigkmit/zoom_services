const carService = require("../services/cars.service");
const { StatusCodes } = require("http-status-codes");

exports.createCar = async (req, res) => {
  const carData = req.body;
  console.log("Received carData:", carData);
  const imagePath = req.file?.path;
  // console.log(imagePath);
  const ownerId = req.user.id;
  // console.log("ownerId", ownerId);

  try {
    const car = await carService.createCar(carData, ownerId, imagePath);
    res.status(StatusCodes.CREATED).json({ car });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

exports.findNearestCars = async (req, res) => {
  const { latitude, longitude, radius } = req.query;

  if (!latitude || !longitude) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Latitude and longitude are required",
    });
  }

  try {
    // Call the service to find nearest cars
    const nearbyCars = await carService.findNearestCars(
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseFloat(radius) : 10,
    );

    // Return the list of nearby cars
    res.status(StatusCodes.OK).json({ nearbyCars });
  } catch (error) {
    console.error("Error finding nearest cars:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Unable to find nearby cars",
      error: error.message,
    });
  }
};

exports.fetchByCarId = async (req, res) => {
  const carId = req.params.id;
  try {
    const car = await carService.fetchByCarId(carId);
    if (!car) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Car not found" });
    }
    res.status(StatusCodes.OK).json({ car });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};
