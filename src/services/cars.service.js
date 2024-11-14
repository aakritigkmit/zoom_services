const { Car, Booking, User } = require("../models");
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
    owner_id: ownerId,
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
