const {
  toCamelCase,
  normalizeTimestamps,
  removeCircularReferences,
} = require("../helpers/serializer.helper");

const carSerializerMiddleware = (car) => ({
  id: car.id,
  model: car.model,
  year: car.year,
  fuelType: car.fuelType,
  city: car.city,
  latitude: car.latitude,
  longitude: car.longitude,
  pricePerKm: car.pricePerKm,
  pricePerHr: car.pricePerHr,
  status: car.status,
  type: car.type,
  chassisNumber: car.chassisNumber,
  userId: car.userId,
  image: car.image,
  ...normalizeTimestamps(car),
});

const carsListSerializer = (carsData) => ({
  data: carsData.data.map(carSerializerMiddleware),
  pagination: carsData.pagination,
});

const carSerializer = (req, res, next) => {
  if (!res.data) {
    return next();
  }

  const serializeData = (data) => {
    if (data.car) {
      return { car: carSerializerMiddleware(data.car) };
    } else if (data.cars) {
      return { cars: carsListSerializer(data.cars) };
    } else {
      return data; // Fallback for unexpected data structure
    }
  };

  res.data = removeCircularReferences(res.data);
  res.data = serializeData(res.data);
  res.data = toCamelCase(res.data);

  next();
};

module.exports = {
  carSerializer,
};
