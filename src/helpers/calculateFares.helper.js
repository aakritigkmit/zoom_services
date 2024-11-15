exports.calculateBookingFare = (car, estimatedDistance, startDate, endDate) => {
  const distanceFare = estimatedDistance * car.price_per_km;

  // Calculate hours difference between startDate and endDate
  const hours = Math.ceil(
    (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60),
  );
  const timeFare = hours * car.price_per_hr;

  return distanceFare + timeFare;
};
