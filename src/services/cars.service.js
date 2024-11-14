const { Car } = require("../models");
const { client } = require("../config/redis");

exports.createCar = async (carData, ownerId, imagePath) => {
  // const { latitude, longitude, price_per_km, price_per_hr, year } = carData;
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
