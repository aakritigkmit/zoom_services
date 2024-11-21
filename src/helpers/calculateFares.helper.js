const calculateBookingFare = (car, estimatedDistance, startDate, endDate) => {
  const distanceFare = estimatedDistance * car.price_per_km;

  //calculate hours difference between start and end Date

  const hours = Math.ceil(
    (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60),
  );
  const timeFare = hours * car.price_per_hr;

  return distanceFare + timeFare;
};

module.exports = calculateBookingFare;
