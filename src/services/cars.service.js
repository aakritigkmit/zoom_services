const { Car } = require("../models");

const { client } = require("../config/redis");
const { StatusCodes } = require("http-status-codes");
const { throwCustomError } = require("../helpers/common.helper.js");

exports.createCar = async (carData, ownerId, imagePath) => {
  const cleanCarData = { ...carData };
  console.log("cleanCarData", cleanCarData);
  const latitude = parseFloat(carData.latitude);
  const longitude = parseFloat(carData.longitude);
  const pricePerKm = parseFloat(carData.price_per_km);
  const pricePerHr = parseFloat(carData.price_per_hr);
  const year = parseInt(carData.year, 10);

  const newCar = await Car.create({
    ...cleanCarData,
    user_id: ownerId,
    image: imagePath,
    latitude,
    longitude,
    price_per_km: pricePerKm,
    price_per_hr: pricePerHr,
    year,
  });

  console.log("newCar", newCar);
  const carId = newCar.id;

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error("Latitude and longitude must be valid numbers.");
  }

  if (!client) {
    throw new Error("Redis client is not initialized.");
  }
  if (!latitude || !longitude) {
    throw new Error("Latitude and longitude are required for geolocation.");
  }

  await client.sendCommand([
    "GEOADD",
    "cars:locations",
    longitude.toString(),
    latitude.toString(),
    carId.toString(),
  ]);

  return newCar;
};

exports.findNearestCars = async (userLatitude, userLongitude, radius = 10) => {
  try {
    // const searchRadius = radius || 10;

    // Debugging logs
    console.log(
      `User coordinates: latitude = ${userLatitude}, longitude = ${userLongitude}`,
    );
    console.log("Search radius: ", radius);

    const cars = await client.sendCommand([
      "GEORADIUS",
      "cars:locations",
      userLongitude.toString(),
      userLatitude.toString(),
      radius.toString(),
      "km",
      "WITHDIST",
      "ASC",
    ]);

    console.log("Redis GEORADIUS response cars: ", cars);

    return cars.map((car) => ({
      id: car[0],
      distance: parseFloat(car[1]),
    }));
  } catch (error) {
    console.error("Error fetching nearby cars:", error);
    throw new Error("Failed to retrieve nearby cars from Redis");
  }
};

exports.fetchByCarId = async (id) => {
  return await Car.findByPk(id);
};

exports.updateCarDetails = async (carId, updatedData, userId) => {
  const car = await Car.findByPk(carId);
  // console.log("car", car);
  if (userId !== car.user_id) {
    return throwCustomError("Forbidden", StatusCodes.FORBIDDEN);
  }

  if (!car) {
    throw new Error("Car not found");
  }
  await car.update(updatedData);
  return car;
};

exports.updateCarStatus = async (carId, status, userId) => {
  console.log(userId);
  const car = await Car.findByPk(carId);
  console.log("car", car);
  if (userId !== car.user_id) {
    return throwCustomError("Forbidden", StatusCodes.FORBIDDEN);
  }
  console.log("userId updated", userId);
  console.log("car.user_id updated", car.user_id);

  if (!car) {
    throw new Error("Car not found");
  }
  await car.update({ status });
  return car;
};

exports.removeCar = async (carId) => {
  const car = await Car.findByPk(carId);
  if (!car) {
    return null;
  }

  await car.destroy();
  return car;
};
