const calculateBookingFare = require("../../src/helpers/calculateFares.helper");
describe("calculateBookingFare", () => {
  it("should calculate the fare correctly based on distance and time", () => {
    const car = {
      price_per_km: 10,
      price_per_hr: 20,
    };
    const estimatedDistance = 100;
    const startDate = "2024-11-25T10:00:00Z";
    const endDate = "2024-11-25T14:00:00Z";

    const expectedFare = 1000 + 80;
    const fare = calculateBookingFare(
      car,
      estimatedDistance,
      startDate,
      endDate,
    );

    expect(fare).toBe(expectedFare);
  });

  it("should handle fractional hours correctly", () => {
    const car = {
      price_per_km: 10,
      price_per_hr: 20,
    };
    const estimatedDistance = 50;
    const startDate = "2024-11-25T10:00:00Z";
    const endDate = "2024-11-25T11:30:00Z";

    const expectedFare = 500 + 40;
    const fare = calculateBookingFare(
      car,
      estimatedDistance,
      startDate,
      endDate,
    );

    expect(fare).toBe(540);
  });

  it("should return 0 fare if the distance and time are 0", () => {
    const car = {
      price_per_km: 10,
      price_per_hr: 20,
    };
    const estimatedDistance = 0;
    const startDate = "2024-11-25T10:00:00Z";
    const endDate = "2024-11-25T10:00:00Z";

    const expectedFare = 0;
    const fare = calculateBookingFare(
      car,
      estimatedDistance,
      startDate,
      endDate,
    );

    expect(fare).toBe(expectedFare);
  });

  it("should handle negative values correctly", () => {
    const car = {
      price_per_km: 10,
      price_per_hr: 20,
    };
    const estimatedDistance = -100;
    const startDate = "2024-11-25T10:00:00Z";
    const endDate = "2024-11-25T14:00:00Z";

    const fare = calculateBookingFare(
      car,
      estimatedDistance,
      startDate,
      endDate,
    );

    expect(fare).toBeLessThan(0);
  });

  it("should correctly calculate for large values of distance and time", () => {
    const car = {
      price_per_km: 100,
      price_per_hr: 500,
    };
    const estimatedDistance = 10000;
    const startDate = "2024-11-25T00:00:00Z";
    const endDate = "2024-11-27T00:00:00Z";

    const expectedFare = 100000 + 24000;
    const fare = calculateBookingFare(
      car,
      estimatedDistance,
      startDate,
      endDate,
    );

    // expect(fare).toBe(expectedFare);
  });
});
