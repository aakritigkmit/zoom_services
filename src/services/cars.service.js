const { Car, sequelize } = require("../models");
const { Op } = require("sequelize");
const { client } = require("../config/redis");
const { StatusCodes } = require("http-status-codes");
const { throwCustomError } = require("../helpers/common.helper.js");

const createCar = async (carData, ownerId, imagePath) => {
  const t = await sequelize.transaction();

  try {
    const cleanCarData = { ...carData };
    // console.log("cleanCarData", cleanCarData);
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

    await t.commit();

    return newCar;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const findNearestCars = async (userLatitude, userLongitude, radius = 10) => {
  try {
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
    // console.log(cars);

    if (!cars.length) {
      return [];
    }

    const carIds = cars.map((car) => car[0]);
    console.log("cars", carIds);
    const availableCars = await Car.findAll({
      where: {
        id: {
          [Op.in]: carIds,
        },
        status: {
          [Op.notIn]: ["booked", "unavailable"],
        },
      },
      attributes: ["id", "status"],
    });
    console.log("availaivle cars", availableCars);
    const availableCarIds = availableCars.map((car) => car.id);
    return cars
      .filter((car) => availableCarIds.includes(car[0]))
      .map((car) => ({
        id: car[0],
        distance: parseFloat(car[1]),
      }));
  } catch (error) {
    console.error("Error fetching nearby cars:", error);
    throw new Error("Failed to retrieve nearby cars from Redis");
  }
};

const fetchByCarId = async (id) => {
  return await Car.findByPk(id);
};

const updateCarDetails = async (carId, updatedData, userId) => {
  const t = await sequelize.transaction();
  try {
    const car = await Car.findByPk(carId, { transaction: t });

    if (!car) {
      throw new Error("Car not found");
    }

    if (userId !== car.user_id) {
      throwCustomError("Forbidden", StatusCodes.FORBIDDEN);
    }

    await car.update(updatedData, { transaction: t });

    await t.commit();

    return car;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const updateCarStatus = async (carId, status, userId) => {
  const t = await sequelize.transaction();

  try {
    const car = await Car.findByPk(carId, { transaction: t });
    if (!car) {
      throw new Error("Car not found");
    }

    if (car.user_id !== userId) {
      throwCustomError(
        "Forbidden: You don't have permission to update this car's status.",
        StatusCodes.FORBIDDEN,
      );
    }

    car.status = status;

    await car.save({ transaction: t });

    await t.commit();

    return car;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
const removeCar = async (carId) => {
  const car = await Car.findByPk(carId);
  if (!car) {
    return null;
  }

  await car.destroy();
  return car;
};

module.exports = {
  removeCar,
  updateCarStatus,
  updateCarDetails,
  fetchByCarId,
  findNearestCars,
  createCar,
};
