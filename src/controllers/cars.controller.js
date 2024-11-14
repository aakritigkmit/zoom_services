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
