const serializeSingleCar = (car) => ({
  id: car.id,
  model: car.model,
  year: car.year,
  fuelType: car.fuel_type,
  city: car.city,
  latitude: car.latitude,
  longitude: car.longitude,
  pricePerKm: car.price_per_km,
  pricePerHr: car.price_per_hr,
  status: car.status,
  type: car.type,
  chassisNumber: car.chassis_number,
  userId: car.user_id,
  image: car.image,
  createdAt: car.created_at,
  updatedAt: car.updated_at,
  deletedAt: car.deleted_at || null,
});

const serializeCarBookings = (bookings) => {
  if (!bookings || bookings.length === 0) {
    return [];
  }

  return bookings.map((booking) => {
    console.log("Serializing booking data:", booking);

    return {
      id: booking.id,
      startDate: booking.start_date,
      endDate: booking.end_date,
      status: booking.status,
      fare: booking.fare,
      user: booking.user
        ? {
            id: booking.user.id,
            name: booking.user.name,
            email: booking.user.email,
          }
        : null,
    };
  });
};

const serializeCar = (req, res, next) => {
  const { data } = res;

  console.log("Before Serialization CAR res.data:", Object.keys(data)); // [ 'car', 'message' ]

  if (data.bookings) {
    console.log("Serializing bookings data:", data.bookings);

    const serializedBookings = serializeCarBookings(data.bookings);

    res.data = {
      bookings: serializedBookings,
      // message: data.message || "Bookings retrieved successfully",
    };

    return next();
  }

  if (data.car) {
    const serializedCar = serializeSingleCar(data.car);

    res.data = {
      car: serializedCar,
      // message: data.message || "Car bookings retrieved successfully",
    };
  }

  return next();
};

module.exports = {
  serializeCar,
};
