const { Car, sequelize, Booking, User } = require("../models");
const { Op } = require("sequelize");
const { client } = require("../config/redis");
const { StatusCodes } = require("http-status-codes");
const { throwCustomError } = require("../helpers/common.helper.js");

const create = async (carData, ownerId, imagePath) => {
  const t = await sequelize.transaction();

  try {
    const cleanCarData = { ...carData };
    const latitude = parseFloat(carData.latitude);
    const longitude = parseFloat(carData.longitude);
    const pricePerKm = parseFloat(carData.price_per_km);
    const pricePerHr = parseFloat(carData.price_per_hr);
    const year = parseInt(carData.year, 10);

    const car = await Car.create({
      ...cleanCarData,
      _id: ownerId,
      image: imagePath,
      latitude,
      longitude,
      price_per_km: pricePerKm,
      price_per_hr: pricePerHr,
      year,
      owner_id: ownerId,
    });

    console.log("car", car);
    const carId = newCar.id;

    if (isNaN(latitude) || isNaN(longitude)) {
      throwCustomError(
        "Latitude and longitude must be valid numbers.",
        StatusCodes.BAD_REQUEST,
      );
    }

    if (!latitude || !longitude) {
      throwCustomError(
        "Latitude and longitude are required for geolocation.",
        StatusCodes.BAD_REQUEST,
      );
    }

    await client.sendCommand([
      "GEOADD",
      "cars:locations",
      longitude.toString(),
      latitude.toString(),
      carId.toString(),
    ]);

    await t.commit();

    return car;
  } catch (error) {
    console.log(error);
    await t.rollback();
    throw error;
  }
};

const fetchBookings = async (ownerId, carId) => {
  const car = await Car.findOne({
    where: { id: carId, owner_id: ownerId },
    attributes: ["id", "model", "type", "status"],
  });

  if (!car) {
    throwCustomError("This car does not belong to you", StatusCodes.FORBIDDEN);
  }

  const bookings = await Booking.findAll({
    where: { car_id: car.id },
    include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
    attributes: ["id", "start_date", "end_date", "status", "fare"],
  });

  return bookings;
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

    if (!cars.length) {
      return [];
    }

    const carIds = cars.map((car) => car[0]);

    const availableCars = await Car.findAll({
      where: {
        id: {
          [Op.in]: carIds,
        },
        status: {
          [Op.notIn]: ["booked", "unavailable"],
        },
      },
      attributes: ["id", "status", "model"],
    });

    const availableCarIds = availableCars.map((car) => car.id);

    const nearbyCars = cars
      .filter((car) => availableCarIds.includes(car[0]))
      .map((car) => {
        const carDetails = availableCars.find(
          (availableCar) => availableCar.id === car[0],
        );

        return {
          id: car[0],
          model: carDetails ? carDetails.model : "Unknown",
          distance: parseFloat(car[1]),
        };
      });

    return nearbyCars;
  } catch (error) {
    console.error("Error fetching nearby cars:", error);
    throw error;
  }
};

const fetchById = async (carId) => {
  return await Car.findByPk(carId);
};

const update = async (carId, updatedData, ownerId) => {
  const t = await sequelize.transaction();
  try {
    const car = await Car.findByPk(carId, { transaction: t });

    if (!car) {
      throwCustomError("Car not found", StatusCodes.NOT_FOUND);
    }

    if (ownerId !== car.owner_id) {
      throwCustomError("Forbidden", StatusCodes.FORBIDDEN);
    }

    await car.update(updatedData, { transaction: t });

    await t.commit();

    return car;
  } catch (error) {
    console.log(error);
    await t.rollback();
    throw error;
  }
};

const updateStatus = async (carId, status, userId) => {
  const t = await sequelize.transaction();

  try {
    const car = await Car.findByPk(carId, { transaction: t });
    if (!car) {
      throwCustomError("Car not found", StatusCodes.NOT_FOUND);
    }

    if (car.owner_id !== userId) {
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

const remove = async (carId) => {
  const transaction = await sequelize.transaction();

  try {
    const car = await Car.findByPk(carId, { transaction });

    if (!car) {
      await transaction.rollback();
      return { statusCode: StatusCodes.NOT_FOUND, message: "Car not found" };
    }

    await car.destroy({ transaction });
    await transaction.commit();

    return { message: "Car deleted successfully" };
  } catch (error) {
    await transaction.rollback();
    throw error;
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
